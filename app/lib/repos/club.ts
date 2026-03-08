
import { mapToClub } from "../mapper";
import { Club } from "../domain/club";
import { prisma } from "./prisma";
import { ClubCreateInput, ClubGetPayload, ClubInclude, ClubUncheckedCreateInput, ClubWhereInput } from "../generated/prisma/models";
import { Prisma } from "../generated/prisma/client";
import { ClubDto } from "../data/dataSource";

export async function getClubs(options: { where?: ClubWhereInput, include?: ClubInclude }): Promise<Club[]>{
  const clubs = await prisma.club.findMany(options);
  return clubs.map((c) => mapToClub(c));
}

export async function findClubs(shortCodes: string[]): Promise<ClubGetPayload<{ include: { players: true } }>[]> {
  return await prisma.club.findMany({
    where: {
      shortCode: {
        in: shortCodes
      }
    },
    include: {
      players: true
    }
  });
}

export async function getClub(id: number, include?: ClubInclude): Promise<Club | null>{
  const club = await prisma.club.findUnique({where: {id}, include});
  return club ? mapToClub(club) : null;
}

export async function updateClub(dto: ClubDto) {
  const data = {
    name: dto.name,
    shortCode: dto.shortCode,
    game: { connect : { id: dto.gameId } },
    league: { connect: { id: dto.leagueId } },
    manager: dto.manager ? {
      connectOrCreate: {
        where: { emailAddress: dto.manager.emailAddress },
        create: {
          fullName: dto.manager.fullName,
          emailAddress: dto.manager.emailAddress
        },
      }
    } : undefined,
    updatedAt: dto.updatedAt
  }

  try {
    const updatedClub = await prisma.club.update({
      where: { 
        shortCode: dto.shortCode,
        OR: [
          { updatedAt: { lt: dto.updatedAt } },
          { updatedAt: null },
        ],
      },
      data,
    });
    return mapToClub(updatedClub);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return null
    }

    throw e;
  }
}

export async function createClub(dto: ClubDto) {
  const newClub = await prisma.club.create({
    data: {
      name: dto.name,
      shortCode: dto.shortCode,
      game: { connect : { id: dto.gameId } },
      league: { connect: { id: dto.leagueId } },
      manager: dto.manager ? {
        connectOrCreate: {
          where: { emailAddress: dto.manager.emailAddress },
          create: {
            fullName: dto.manager.fullName,
            emailAddress: dto.manager.emailAddress
          },
        }
      } : undefined,
      updatedAt: dto.updatedAt
    }
  });
  return mapToClub(newClub);
}