import { League } from "../domain/league";
import { LeagueInclude, LeagueWhereInput } from "../generated/prisma/models";
import { mapToLeague } from "../mapper";
import { prisma } from "./prisma";

export async function getLeagues(options: { where: LeagueWhereInput, include?: LeagueInclude }): Promise<League[]>{
  const leagues = await prisma.league.findMany(options);
  return leagues.map((l) => mapToLeague(l));
}

export async function getLeague(id: number, include?: LeagueInclude): Promise<League | null>{
  const league = await prisma.league.findUnique({
    where: {
      id
    },
    include,
  })
  return league ? mapToLeague(league): null;
}

export async function findLeague(name: string, include?: LeagueInclude): Promise<League | null>{
  const league = await prisma.league.findFirst({
    where: {
      synonyms: {
        contains: name
      }
    },
    include,
  })
  return league ? mapToLeague(league) : null;
}
