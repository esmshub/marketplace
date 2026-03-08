
import { mapToPlayer } from "../mapper";
import { prisma } from "./prisma";
import { PlayerInclude, PlayerWhereInput } from "../generated/prisma/models";
import { Player, PlayerData } from "../domain/player";
import { PlayerDto } from "../data/dataSource";
import { Prisma } from "../generated/prisma/client";

export async function getPlayers(options: { where?: PlayerWhereInput, include?: PlayerInclude }): Promise<Player[]>{
  const players = await prisma.player.findMany(options);
  return players.map((p) => mapToPlayer(p));
}

export async function updatePlayer(player: PlayerDto) {
  const { id, clubId, gameId, ...data } = player;
  const payload = {
    ...data,
    game: { connect: { id: gameId } },
    club: { connect: { id: clubId } },
  }
  try {
    return await prisma.player.update({
      where: {
        name_nat: {
          name: payload.name,
          nat: payload.nat
        },
        OR: [
          { updatedAt: { lt: payload.updatedAt } },
          { updatedAt: null },
        ],
      },
      data: payload,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return null
    }

    throw e;
  }
}

export async function createPlayer(player: PlayerDto) {
  const { id, gameId, club, ...payload } = player;
  const data = { ...payload, gameId: gameId! }
  const newPlayer = await prisma.player.create({ data });
  return mapToPlayer(newPlayer);
}