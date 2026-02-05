import { auth } from "@/auth";
import CsvPlayerDataSource from "@/lib/data/csvPlayerDataSource";
import SslClubDataSource from "@/lib/data/sslClubDataSource";
import { DataSync } from "@/lib/domain/dataSync";
import { InvalidStateError } from "@/lib/domain/errors";
import { getGame } from "@/lib/repos/game";
import { getLeagues } from "@/lib/repos/league";
import { findClubs, summarizeResults, updateClub, getPosition, updatePlayer, insertPlayer, insertClub, getPlayers } from "./helpers";
import { NextRequest } from "next/server";
import { ClubGetPayload, PlayerGetPayload } from "@/lib/generated/prisma/models";
import { PlayerDto } from "@/lib/data/dataSource";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameId = parseInt(id);

  if (isNaN(gameId)) return Response.json({ error: "gameId is not valid" }, { status: 400 });

  const body = await req.json();
  if (!body.sourceUrl) return Response.json({ error: "sourceUrl is not valid" }, { status: 400 });

  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`){
    return new Response("Unauthorized", { status: 401 })
  }

  const game = await getGame(gameId, { dataSyncs: true });
  if (!game) return Response.json({ error: "Game not found" }, { status: 404 });

  if (game.code === "ssl") {
    let dataSync: DataSync;
    try {
      dataSync = await game.startSync(parseInt(token.sub!));
    } catch (e) {
      if (e instanceof InvalidStateError && e.message.includes("cooling off")) {
        return Response.json({ error: e.message }, { status: 429 });
      } else {
        // rethrow if we get here
        console.error(e);
        throw e;
      }
    }

    try {
      const clubDs = new SslClubDataSource(body.sourceUrl); 
      const result = await clubDs.load();
      if (result.errors.length > 0) return Response.json({ errors: result.errors }, { status: 500 });

      const leagues = await getLeagues();
      const existingClubs = await findClubs(result.data.map(c => c.shortCode));
      const existingPlayers = await getPlayers(game.id);

      const clubInserts: Promise<ClubGetPayload<null>>[] = [];
      const clubUpdates: Promise<ClubGetPayload<null> | null | undefined>[] = [];
      const playerInserts: Promise<PlayerGetPayload<null>>[] = [];
      const playerUpdates: Promise<PlayerGetPayload<null> | null | undefined>[] = [];

      console.log("Preparing data.");
      for (const clubData of result.data) {
        // verify the league exists
        console.log(`Verifying League \"${clubData.leagueName}\"...`);
        const league = leagues.find(l => l.synonyms?.includes(clubData.leagueName));
        if (!league) {
          console.warn(`League does not exist: "${clubData.leagueName}", skipping.`);
          continue;
        }

        clubData.gameId = game.id;
        clubData.leagueId = league.id;

        const rosterDs = new CsvPlayerDataSource(clubData.rosterUrl);
        const roster = await rosterDs.load();
        if (roster.errors.length > 0) return Response.json({ errors: roster.errors }, { status: 500 });

        const upsertPlayers = async (players: PlayerDto[], pendingClub: Promise<ClubGetPayload<null>>) => {
          const club = await pendingClub;
          for (const player of players) {
            player.gameId = game.id;
            player.clubId = club.id;
            player.pos = getPosition(player);
            const exists = !!existingPlayers.find(p => p.name === player.name && p.nat === player.nat);

            if (exists) {
              playerUpdates.push(updatePlayer(player));
            } else {
              playerInserts.push(insertPlayer(player));
            }
          }
        }

        const existing = existingClubs.find(c => c.shortCode === clubData.shortCode);
        let clubResponse: Promise<ClubGetPayload<null> | null | undefined> | Promise<ClubGetPayload<null>>;
        if (existing) {
          // updates may return undefined if no update is necessary, since we know we only need the ID anyway
          // just return the existing club before the update (ID won't change)
          clubResponse = Promise.resolve(existing);
          clubUpdates.push(updateClub(clubData));
        } else {
          clubResponse = insertClub(clubData);
          clubInserts.push(clubResponse as Promise<ClubGetPayload<null>>);
        }
        await upsertPlayers(roster.data, clubResponse as Promise<ClubGetPayload<null>>);
      }

      console.log(`Updating ${clubUpdates.length} clubs...`);
      const clubUpdateResults = await Promise.allSettled(clubUpdates);
      const clubSummary = summarizeResults(clubUpdateResults);

      console.log(`Updating ${playerUpdates.length} players...`);
      const playerUpdateResults = await Promise.allSettled(playerUpdates);
      const playerSummary = summarizeResults(playerUpdateResults);

      console.log(`Inserting ${clubInserts.length} clubs...`);
      const clubInsertResults = await Promise.allSettled(clubInserts);
      const clubInsertSummary = summarizeResults(clubInsertResults);

      console.log(`Inserting ${playerInserts.length} players...`);
      const playerInsertResults = await Promise.allSettled(playerInserts);
      const playerInsertSummary = summarizeResults(playerInsertResults);

      const errors = clubSummary.failures.concat(clubInsertSummary.failures).concat(playerSummary.failures).concat(playerInsertSummary.failures);
      dataSync.status = errors.length ? "completed_with_errors" : "completed";
      if (errors.length) {
        console.warn(`Failed to update ${errors.length} clubs and/or players.`);
        console.error(errors);
      }
      dataSync.metadata = {
        clubs: {
          updated: clubSummary.succeeded,
          inserted: clubInsertSummary.succeeded,
          failed: clubSummary.failed + clubInsertSummary.failed,
        },
        players: {
          updated: playerSummary.succeeded,
          inserted: playerInsertSummary.succeeded,
          failed: playerSummary.failed + playerInsertSummary.failed,
        },
      };
    }  
    catch (e) { 
      console.error(e); 
      dataSync.metadata = { error: (e as Error).message };
      dataSync.status = "failed";
      return Response.json({ error: "Internal server error" }, { status: 500 });
    } 
    finally {
      await game.endSync(dataSync);
    }

    game.settings.sourceUrl = body.sourceUrl;
    await game.save();

    revalidateTag("clubs", "max");
    revalidateTag("players", "max");
    return Response.json(dataSync, { status: 202 });
  } else {
    return Response.json({ error: "Operation is Forbidden" }, { status: 403 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  if (!idStr) return Response.json({ error: "id is missing" }, { status: 400 });

  const gameId = parseInt(idStr);
  if (isNaN(gameId)) return Response.json({ error: "id is not valid" }, { status: 400 });

  const session = await auth();
  if (!session?.user?.isAdmin) {
    return Response.json({ error: "User is forbidden" }, { status: 401 });
  }

  try {
    const game = await getGame(gameId, { dataSyncs: true });
    if (!game) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }
    if (!game.dataSyncs.length) {
      return Response.json({}, { status: 404 });
    }

    return Response.json(game.dataSyncs[0], { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}