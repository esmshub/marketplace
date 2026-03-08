import { prisma } from "./prisma";
import { LeagueSeason, Prisma } from "../generated/prisma/client";
import {
  LeagueSeasonCreateInput,
  LeagueSeasonOrderByWithRelationInput,
  LeagueSeasonUncheckedCreateInput,
  LeagueSeasonUncheckedUpdateInput,
  LeagueSeasonUpdateInput,
  LeagueSeasonWhereUniqueInput,
} from "../generated/prisma/models";

export type LeagueSeasonRow = LeagueSeason;

export async function getLeagueSeasons(leagueIds: number[]): Promise<LeagueSeasonRow[]> {
  if (leagueIds.length === 0) {
    return [];
  }

  const orderBy: LeagueSeasonOrderByWithRelationInput[] = [
    { leagueId: "asc" },
    { season: "asc" },
  ];

  return prisma.leagueSeason.findMany({
    where: {
      leagueId: { in: leagueIds },
    },
    orderBy,
  });
}

export async function createLeagueSeason(
  data: LeagueSeasonCreateInput | LeagueSeasonUncheckedCreateInput,
): Promise<LeagueSeasonRow> {
  return prisma.leagueSeason.create({ data });
}

export async function updateLeagueSeason(
  where: LeagueSeasonWhereUniqueInput,
  data: LeagueSeasonUpdateInput | LeagueSeasonUncheckedUpdateInput,
): Promise<LeagueSeasonRow | null> {
  try {
    return await prisma.leagueSeason.update({ where, data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return null;
    }

    throw e;
  }
}
