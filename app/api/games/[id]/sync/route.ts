import { auth } from "@/auth";
import { InvalidStateError } from "@/lib/domain/errors";
import { getGame } from "@/lib/repos/game";
import { getLeagues } from "@/lib/repos/league";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import SslDataSource from "@/lib/data/ssl/dataSource";
import type { SslDataSourceConfig, SslLeagueConfig } from "@/lib/data/ssl/dataSource";
import { GameDataImporter, GameDataSource } from "@/lib/domain/dataImporter";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameId = parseInt(id);

  if (isNaN(gameId)) return Response.json({ error: "gameId is not valid" }, { status: 400 });

  const body = await req.json();
  if (!body.config) return Response.json({ error: "config is not valid" }, { status: 400 });
  if (!body.userId) return Response.json({ error: "userId is not valid" }, { status: 400 });

  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`){
    return new Response("Unauthorized", { status: 401 })
  }

  const game = await getGame(gameId, { dataSyncs: true });
  if (!game) return Response.json({ error: "Game not found" }, { status: 404 });

  console.log(`Attempting to sync ${game.displayName} game data...`);
  let dataSource: GameDataSource;
  if (game.code === "ssl") {
    const leagues = await getLeagues({ where: { gameId: game.id } });
    const leagueConfigs = body.config.leagues ?? {};
    const config: SslDataSourceConfig = {
      clubsUrl: body.config.clubsUrl,
      leagues: Object.fromEntries(
        Object.entries(leagueConfigs).map(([leagueName, leagueConfig]) => {
          const matchedLeague = leagues.find((league) =>
            league.name === leagueName
            || league.synonyms?.includes(leagueName),
          );
          const parsedLeagueConfig = leagueConfig as SslLeagueConfig;

          return [
            leagueName,
            {
              ...parsedLeagueConfig,
              currentSeason: matchedLeague?.currentSeason ?? 1,
            },
          ];
        }),
      ),
    };
    dataSource = new SslDataSource(config);
  } else {
    return Response.json({ error: "Operation is Forbidden" }, { status: 403 });
  }

  try {
    const dataImporter = new GameDataImporter(dataSource);
    const dataSync = await game.startSync(body.userId);
    try {
      const result = await dataImporter.import(game.id);
      const errors = [
        ...result.clubInserts.errors,
        ...result.clubUpdates.errors,
        ...result.playerInserts.errors,
        ...result.playerUpdates.errors,
        ...result.leagueInserts.errors,
        ...result.leagueUpdates.errors
      ];
      dataSync.status = errors.length ? "completed_with_errors" : "completed";
      if (errors.length) {
        console.error(errors);
      }
      dataSync.metadata = {
        clubs: {
          updated: result.clubUpdates.succeeded,
          inserted: result.clubInserts.succeeded,
          failed: result.clubInserts.errors.length + result.clubUpdates.errors.length,
        },
        players: {
          updated: result.playerUpdates.succeeded,
          inserted: result.playerInserts.succeeded,
          failed: result.playerInserts.errors.length + result.playerUpdates.errors.length,
        },
        leagues: {
          updated: result.leagueInserts.succeeded,
          inserted: result.leagueUpdates.succeeded,
          failed: result.leagueInserts.errors.length + result.leagueUpdates.errors.length,
        }
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

    game.settings["dataSource"] = body.config;
    await game.save();

    revalidateTag("clubs", "max");
    revalidateTag("players", "max");
    return Response.json(dataSync, { status: 202 });
  } catch (e) {
    console.error(e);
    if (e instanceof InvalidStateError && e.message.includes("cooling off")) {
      return Response.json({ error: e.message }, { status: 429 });
    } else {
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
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
