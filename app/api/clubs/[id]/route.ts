import { getClub } from '@/lib/repos/club';
import type { NextRequest } from 'next/server'
 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return new Response(null, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams
  const includePlayers = searchParams.get('players')?.toLowerCase() === 'true';
  const includeLeague = searchParams.get('league')?.toLowerCase() === 'true';
  const includeManager = searchParams.get('manager')?.toLowerCase() === 'true';

  const club = await getClub(parsedId, {
    players: includePlayers,
    league: includeLeague,
    manager: includeManager
  });
  if (!club) {
    return new Response(null, { status: 404 });
  }

  return Response.json(club, { status: 200 });
}