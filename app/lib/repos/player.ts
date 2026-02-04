
import { mapToPlayer } from "../mapper";
import { prisma } from "./prisma";
import { PlayerInclude, PlayerWhereInput } from "../generated/prisma/models";
import { Player } from "../domain/player";

export async function getPlayers(where?: PlayerWhereInput, include?: PlayerInclude): Promise<Player[]>{
  const players = await prisma.player.findMany({ where, include});
  return players.map((p) => mapToPlayer(p));
}