
import { mapToClub } from "../mapper";
import { Club } from "../domain/club";
import { prisma } from "./prisma";
import { ClubInclude, ClubUncheckedCreateInput } from "../generated/prisma/models";

export async function getClubs(include?: ClubInclude): Promise<Club[]>{
  const clubs = await prisma.club.findMany({include});
  return clubs.map((c) => mapToClub(c));
}

export async function getClub(id: number, include?: ClubInclude): Promise<Club | null>{
  const club = await prisma.club.findUnique({where: {id}, include});
  return club ? mapToClub(club) : null;
}

export async function createClub(data: ClubUncheckedCreateInput): Promise<Club> {
  const club = await prisma.club.create({
    data,
    include: { 
      players: !!data.players, 
      league: !!data.leagueId, 
      manager: !!data.managerId, 
      game: !!data.gameId 
    },
  });
  return mapToClub(club);
}