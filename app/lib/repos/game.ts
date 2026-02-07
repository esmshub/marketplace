import { Game } from "../domain/game";
import { GameGetPayload, GameInclude, GameUncheckedCreateInput, GameUpdateInput } from "../generated/prisma/models";
import { mapToGame } from "../mapper";
import { prisma } from "./prisma";

export async function getGames(): Promise<Game[]>{
  const games = await prisma.game.findMany({
    include: {
      dataSyncs: {
        orderBy: {
          startTime: 'desc'
        },
        take: 1,
      },
    },
  });
  return games.map((g: GameGetPayload<{ include: { dataSyncs: true }}>) => mapToGame(g));
}

export async function getGame(id: number, include?: GameInclude): Promise<Game | null>{
  const game = await prisma.game.findUnique({
    where: {
      id
    },
    include,
  });
  return game ? mapToGame(game) : null;
}

export async function createGame(data: GameUncheckedCreateInput): Promise<Game>{
  const game = await prisma.game.create({
    data
  });
  return mapToGame(game);
}

export async function updateGame(id: number, data: GameUpdateInput): Promise<Game>{
  const game = await prisma.game.update({
    where: {
      id,
    },
    data
  });
  return mapToGame(game);
}