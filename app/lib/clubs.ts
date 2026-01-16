// import { prisma } from "./repos/prisma";
// import { createOrUpdate as upsertPlayer } from "./player";
// import { ClubDto } from "./data/dataSource";
// import { id } from "zod/v4/locales";

// async function createOrUpdateClub(dto: ClubDto) {
//   return await prisma.$transaction(async (tx) => {
//     const baseProps = {
//       name: dto.name,
//       shortCode: dto.shortCode,
//       game: { connect : { id: dto.gameId } },
//       league: { connect: { id: dto.leagueId } },
//       manager: dto.manager ? {
//         connectOrCreate: {
//           where: dto.manager.id ? 
//             { id: dto.manager.id } : 
//             { emailAddress: dto.manager.emailAddress },
//           create: {
//             fullName: dto.manager.fullName,
//             emailAddress: dto.manager.emailAddress
//           },
//         }
//       } : undefined,
//     };

//     const club = await tx.club.upsert({
//       where: { 
//         shortCode: dto.shortCode,
//       },
//       create: { ...baseProps },
//       update: { ...baseProps },
//       include: {
//         league: true,
//         manager: true,
//         players: true,
//       },
//     });

//     const playerUpserts = dto.players?.map(p => upsertPlayer(p, dto.gameId, club.id, tx));
//     const results = await Promise.allSettled(playerUpserts);

//     results.forEach((result) => {
//       if (result.status === "fulfilled") {
//         club.players.push(result.value);
//       } else {
//         console.warn(`Failed to create player: ${result.reason}`);
//       }
//     });

//     return club;
//   })
// }

// export async function getClub(id: number, include: { players?: boolean, league?: boolean, manager?: boolean } = {}) {
//   return await prisma.club.findUnique({
//     where: { id },
//     include: include,
//   });
// }

// export async function getClubs(include: { players?: boolean, league?: boolean, manager?: boolean } = {}) {
//   return await prisma.club.findMany({
//     include
//   });
// }