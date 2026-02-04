import { mapToClubDto, mapToPlayerDto } from "@/lib/mapper";
import { getClubs } from "@/lib/repos/club"
import { cacheLife, cacheTag } from "next/cache";

export async function getPlayers() {
  'use cache'
  cacheTag("players");
  cacheLife("days");

  const clubs = await getClubs({ players: true });
  const players = clubs.flatMap(
    (club) => club.players?.map((p) => mapToPlayerDto({ ...p, club })) ?? [],
  );
  players.sort((a, b) => {
    const surnameA = a?.name.split("_").pop();
    const surnameB = b?.name.split("_").pop();
    return surnameA!.localeCompare(surnameB!);
  });
  return players;
}