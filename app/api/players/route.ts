import { getPlayers } from "@/lib/repos/player";
import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";

// To handle a GET request to /api
export async function GET(req: NextRequest) {
  let gameId: number | undefined;
  let hasGameStr = false;
  if (req.nextUrl.searchParams.has('gameId')) {
    hasGameStr = true;
    gameId = parseInt(req.nextUrl.searchParams.get('gameId')!);
  }
  if (hasGameStr && isNaN(gameId!)) {
    return Response.json({ error: "gameId is not valid" }, { status: 400 });
  }
  // const session = await auth();
  const playerFetch = unstable_cache(
    async (gameId?: number) => {
      console.log("Fetching players from Database...");
      return getPlayers({ gameId });
    },
    ["players"],
    {
      tags: ["players"],
      revalidate: 86400, // 1hr
    },
  )

  const players = await playerFetch(gameId);
  return Response.json(players, { status: 200 });
}