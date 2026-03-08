import { Club, ClubData } from "./club";
import { createClub, getClubs, updateClub } from "../repos/club";
import { createLeagueSeason, getLeagueSeasons, updateLeagueSeason } from "../repos/leagueSeason";
import type { LeagueSeasonRow } from "../repos/leagueSeason";
import { getLeagues } from "../repos/league";
import { createPlayer, getPlayers, updatePlayer } from "../repos/player";
import { LeagueData } from "./league";
import { Player, PlayerData } from "./player";
import { Prisma } from "../generated/prisma/client";

type ClassifiedError =
  | { type: "transient"; message: string }
  | { type: "permanent"; code?: string; message: string };


export interface IterableItem<T> {
  value?: T;
  ok: boolean;
  error?: Error;
}

export interface GameDataSource {
  clubs(): AsyncIterable<IterableItem<ClubData>>
  leagues(): AsyncIterable<IterableItem<LeagueData>>
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);
  return `{${entries.join(",")}}`;
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value));
  }

  if (typeof value === "string") {
    const parsed = parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) {
      return Math.max(1, parsed);
    }
  }

  return null;
}

function leagueSeasonNumber(season: unknown): number {
  return toPositiveInt(season) ?? 1;
}

function classifyError(error: unknown): ClassifiedError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        type: "permanent",
        code: error.code,
        message: error.message,
      };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return { type: "transient", message: error.message };
    }

    if (error instanceof Error) {
      return { type: "transient", message: error.message };
    }

    return { type: "transient", message: String(error) };
  }

  function summarizeResults<T>(results: PromiseSettledResult<T>[]) {
    const successes: T[] = [];
    const errors: ClassifiedError[] = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value !== null) {
          // if the value is null then no update happened
          successes.push(r.value);
        }
      } else {
        errors.push(classifyError(r.reason));
      }
    }

    return {
      attempted: results.length,
      succeeded: successes.length,
      errors,
    };
  }

export class GameDataImporter {

  constructor(
    private readonly dataSource: GameDataSource
  ) {
    if (!dataSource) throw new Error("dataSource is missing");
  }

  private async importClubs(gameId: number) {
    const existingLeagues = await getLeagues({ where: { gameId } });
    const existingClubs = await getClubs({ where: { gameId } });
    const existingPlayers = await getPlayers({ where: { gameId } });

    const clubInserts: Promise<Club>[] = [];
    const clubUpdates: Promise<Club | null>[] = [];
    const playerInserts: Promise<Player>[] = [];
    const playerUpdates: Promise<Player | null>[] = [];

    for await (const item of this.dataSource.clubs()) {
      const { value: sourcedClub } = item;
      if (item.error) {
        console.error(item.error);
      }

      if (!item.ok || !sourcedClub) {
        console.warn("club data not ok or null, skipping.");
        continue;
      }

      // verify the league exists
      const league = existingLeagues.find(l => l.synonyms?.includes(sourcedClub.leagueName));
      if (!league) {
        console.warn(`Associated league for club ${sourcedClub.name} does not exist: "${sourcedClub.leagueName}", skipping.`);
        continue;
      }

      const upsertPlayers = async (players: PlayerData[], pendingClub: Promise<Club>) => {
        const club = await pendingClub;
        for (const player of players) {
          const exists = !!existingPlayers.find(p => p.name === player.name && p.nat === player.nat);

          const dto = {
            ...player,
            gameId,
            clubId: club.id,
            club: null,
          }
          if (exists) {
            playerUpdates.push(updatePlayer(dto));
          } else {
            playerInserts.push(createPlayer(dto));
          }
        }
      }

      const dto = {
        ...sourcedClub,
        gameId,
        leagueId: league.id,
      }
      const existingClub = existingClubs.find(c => c.shortCode === sourcedClub.shortCode);
      let clubResponse: Promise<Club>;
      if (existingClub) {
        // updates may return undefined if no update is necessary, since we know we only need the ID anyway
        // just return the existing club before the update (ID won't change)
        clubResponse = Promise.resolve(existingClub);
        clubUpdates.push(updateClub(dto));
      } else {
        clubResponse = createClub(dto);
        clubInserts.push(clubResponse);
      }
      await upsertPlayers(sourcedClub.players, clubResponse);
    }

    const [
      clubUpdateResults,
      playerUpdateResults,
      clubInsertResults,
      playerInsertResults,
    ] = await Promise.all([
      Promise.allSettled(clubUpdates),
      Promise.allSettled(playerUpdates),
      Promise.allSettled(clubInserts),
      Promise.allSettled(playerInserts),
    ]);

    return {
      clubUpdates: summarizeResults(clubUpdateResults),
      clubInserts: summarizeResults(clubInsertResults),
      playerUpdates: summarizeResults(playerUpdateResults),
      playerInserts: summarizeResults(playerInsertResults),
    }
  }

  private async importLeagues(gameId: number) {
    const existingLeagues = await getLeagues({ where: { gameId } });
    const existingSeasons = await getLeagueSeasons(existingLeagues.map((l) => l.id));

    const seasonInserts: Promise<LeagueSeasonRow>[] = [];
    const seasonUpdates: Promise<LeagueSeasonRow | null>[] = [];

    const seasonIndex = new Map<string, LeagueSeasonRow>(
      existingSeasons.map((s) => [`${s.leagueId}:${s.season}`, s]),
    );

    for await (const item of this.dataSource.leagues()) {
      const { value: sourcedLeague } = item;
      if (item.error) {
        console.error(item.error);
      }

      if (!item.ok || !sourcedLeague) {
        console.warn("league data not ok or null, skipping.");
        continue;
      }

      const league = existingLeagues.find((l) => l.synonyms?.includes(sourcedLeague.name));
      if (!league) {
        console.warn(`League does not exist: "${sourcedLeague.name}", skipping.`);
        continue;
      }

      const fixturesBySeason = new Map<number, Record<string, unknown>[]>();
      const defaultSeason = leagueSeasonNumber(sourcedLeague.currentSeason ?? league.currentSeason);

      for (const sourceRound of sourcedLeague.fixtures) {
        if (!sourceRound || typeof sourceRound !== "object" || Array.isArray(sourceRound)) {
          console.warn(`Invalid fixture round payload for league "${sourcedLeague.name}", skipping.`);
          continue;
        }

        const round = sourceRound as Record<string, unknown>;
        const season = toPositiveInt(round.season ?? round.seasonNo ?? round.year) ?? defaultSeason;
        const seasonRounds = fixturesBySeason.get(season);
        if (seasonRounds) {
          seasonRounds.push(round);
        } else {
          fixturesBySeason.set(season, [round]);
        }
      }

      if (fixturesBySeason.size === 0) {
        fixturesBySeason.set(defaultSeason, []);
      }

      for (const [season, rounds] of fixturesBySeason.entries()) {
        const tablePayload = stableStringify(sourcedLeague.clubStats);
        const fixturesPayload = stableStringify(rounds);
        const rowKey = `${league.id}:${season}`;
        const existingSeason = seasonIndex.get(rowKey);

        if (!existingSeason) {
          const row = { leagueId: league.id, season, tablePayload, fixturesPayload };
          seasonInserts.push(createLeagueSeason(row));
          seasonIndex.set(rowKey, row);
          continue;
        }

        if (existingSeason.tablePayload !== tablePayload || existingSeason.fixturesPayload !== fixturesPayload) {
          seasonUpdates.push(updateLeagueSeason(
            { leagueId_season: { leagueId: league.id, season } },
            { tablePayload, fixturesPayload },
          ));
          const row = { leagueId: league.id, season, tablePayload, fixturesPayload };
          seasonIndex.set(rowKey, row);
        }
      }
    }

    const [
      seasonUpdateResults,
      seasonInsertResults,
    ] = await Promise.all([
      Promise.allSettled(seasonUpdates),
      Promise.allSettled(seasonInserts),
    ]);

    return {
      leagueUpdates: summarizeResults(seasonUpdateResults),
      leagueInserts: summarizeResults(seasonInsertResults),
    }
  }

  async import(gameId: number) {
    const [
      leagueResults,
      clubResults,
    ] = await Promise.all([
      this.importLeagues(gameId),
      this.importClubs(gameId),
    ]);
    return {
      ...leagueResults,
      ...clubResults
    }
  }
}
