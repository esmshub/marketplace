import { PlayerDto } from "@/lib/data/dataSource";
import { ClubData } from "@/lib/data/sslClubDataSource";
import { Prisma } from "@/lib/generated/prisma/client";
import { ClubGetPayload } from "@/lib/generated/prisma/models";
import { prisma } from "@/lib/repos/prisma";

type ClassifiedError =
  | { type: "transient"; message: string }
  | { type: "permanent"; code?: string; message: string };

function classifyError(error: unknown): ClassifiedError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      type: "permanent",
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { type: "transient", message: error.message };
  }

  if (error instanceof Error) {
    return { type: "transient", message: error.message };
  }

  return { type: "transient", message: String(error) };
}

export function summarizeResults<T>(results: PromiseSettledResult<T>[]) {
  const successes: T[] = [];
  const failures: ClassifiedError[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value !== null) {
        // if the value is null then no update happened
        successes.push(r.value);
      }
    } else {
      failures.push(classifyError(r.reason));
    }
  }

  return {
    attempted: results.length,
    succeeded: successes.length,
    failed: failures.length,
    failures,
  };
}

export function getPosition(player: { st: number, tk: number, ps: number, sh: number}): string {
  const skills = [
    { name: "st", val: player.st },
    { name: "tk", val: player.tk },
    { name: "ps", val: player.ps },
    { name: "sh", val: player.sh },
  ].sort((a, b) => b.val - a.val);
  let pos = "";
  if (skills[0].name === "st") {
    pos = "GK";
  } else if (skills[0].name === "tk") {
    pos = "DF";
  } else if (skills[0].name === "ps") {
    pos = "MF";
    if (
      skills[1].name === "tk" &&
      skills[1].val > 14 &&
      (skills[2].name !== "sh" || skills[2].val < skills[1].val)
    ) {
      pos = "DM";
    } else if (
      skills[1].name === "sh" &&
      skills[1].val > 14 &&
      (skills[2].name !== "tk" || skills[2].val < skills[1].val)
    ) {
      pos = "AM";
    }
  } else if (skills[0].name === "sh") {
    pos = "FW";
  }
  return pos;
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

export async function updateClub(data: ClubData) {
  const payload = {
    name: data.name,
    shortCode: data.shortCode,
    game: { connect : { id: data.gameId } },
    league: { connect: { id: data.leagueId } },
    manager: {
      connectOrCreate: {
        where: { emailAddress: data.managerEmail },
        create: {
          fullName: data.managerName,
          emailAddress: data.managerEmail
        },
      }
    },
    updatedAt: data.lastUpdated
  }

  try {
    return await prisma.club.update({
      where: { 
        shortCode: data.shortCode,
        OR: [
          { updatedAt: { lt: data.lastUpdated } },
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

export async function insertClub(data: ClubData) {
  return await prisma.club.create({
    data: {
      name: data.name,
      shortCode: data.shortCode,
      game: { connect : { id: data.gameId } },
      league: { connect: { id: data.leagueId } },
      manager: {
        connectOrCreate: {
          where: { emailAddress: data.managerEmail },
          create: {
            fullName: data.managerName,
            emailAddress: data.managerEmail
          },
        }
      },
      updatedAt: data.lastUpdated
    }
  });
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

export async function insertPlayer(player: PlayerDto) {
  const { id, gameId, club, ...payload } = player;
  const data = { ...payload, gameId: gameId! }
  return await prisma.player.create({ data });
}

export async function getPlayers(gameId: number) {
  return await prisma.player.findMany({
    where: {
      gameId: gameId
    }
  });
}