import { getLeagues as getLeagueRows } from "@/lib/repos/league";
import { getLeagueSeasons } from "@/lib/repos/leagueSeason";
import { prisma } from "@/lib/repos/prisma";
import { connection } from "next/server";

export interface LeagueTableRow {
  clubName: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
}

export interface LeagueFixtureRow {
  homeClub: string
  awayClub: string
  homeGoals?: number
  awayGoals?: number
}

export interface LeagueFixtureRound {
  round: number
  fixtures: LeagueFixtureRow[]
}

export interface LeagueSnapshot {
  leagueId: number
  leagueKey: string
  leagueName: string
  currentSeason: number
  table: LeagueTableRow[]
  fixtures: LeagueFixtureRound[]
}

function buildLeagueKey(leagueName: string): string {
  const aliasMap: Record<string, string> = {
    Premiership: "prem",
    "Division 1": "div1",
    "Division 2": "div2",
    "Youth Division 1": "ydiv1",
    "Youth Division 2": "ydiv2",
  };

  if (aliasMap[leagueName]) {
    return aliasMap[leagueName];
  }

  return leagueName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseJsonArray<T>(payload: string): T[] {
  try {
    const value = JSON.parse(payload);
    if (Array.isArray(value)) {
      return value as T[];
    }
  } catch (e) {
    console.error(e);
  }

  return [];
}

export async function getLeagueSnapshots(): Promise<LeagueSnapshot[]> {
  await connection();

  const activeGame = await prisma.game.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (!activeGame) {
    return [];
  }

  const leagues = await getLeagueRows({ where: { gameId: activeGame.id } });
  if (leagues.length === 0) {
    return [];
  }

  const seasons = await getLeagueSeasons(leagues.map((league) => league.id));

  return leagues
    .map((league) => {
      const leagueSeasons = seasons.filter((season) => season.leagueId === league.id);
      if (leagueSeasons.length === 0) {
        return null;
      }

      const currentSeason = league.currentSeason ?? 1;
      const seasonSnapshot = leagueSeasons.find((season) => season.season === currentSeason)
        ?? leagueSeasons[leagueSeasons.length - 1];
      if (!seasonSnapshot) {
        return null;
      }

      const table = parseJsonArray<LeagueTableRow>(seasonSnapshot.tablePayload);
      const fixtures = parseJsonArray<LeagueFixtureRound>(seasonSnapshot.fixturesPayload);

      return {
        leagueId: league.id,
        leagueKey: buildLeagueKey(league.name ?? `League ${league.id}`),
        leagueName: league.name ?? `League ${league.id}`,
        currentSeason: seasonSnapshot.season,
        table,
        fixtures,
      };
    })
    .filter((snapshot): snapshot is LeagueSnapshot => snapshot !== null);
}
