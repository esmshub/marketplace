import { getClubs } from "@/lib/repos/club";
import { NextRequest } from "next/server";


// To handle a GET request to /api
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const includePlayers = searchParams.get('players')?.toLowerCase() === 'true';

  console.log("Fetching players from Database...");
  const clubs = await getClubs({ include: { players: includePlayers } });

  return Response.json(clubs, { status: 200 });
}