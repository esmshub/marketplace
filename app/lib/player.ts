// import { Prisma } from "./generated/prisma/client"
// import { prisma } from "./repos/prisma"

// export type PlayerEntity = Prisma.PlayerGetPayload<{
//   include: {
//     club: false
//   }
// }>

// export async function scrapeRoster(url: string): Promise<PlayerDto[]> {
//   // stagger requests to avoid spamming site
//   await sleep(200, 2000);

//   console.log(`Scraping ${url}...`);
//   const rosterData = await fetch(url).then(r => r.text());
//   const lines = rosterData.toString().split(/\r?\n/);

//   const results: PlayerDto[] = [];
//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (trimmed.startsWith('---') || trimmed === '') {
//       continue;
//     }

//     // Split by whitespace
//     const fields = trimmed.split(/\s+/);
//     if (fields[0] === 'Name') {
//       // skip header row
//       continue;
//     }

//     results.push({
//       name: fields[0],
//       age: parseInt(fields[1].trim()),
//       nat: fields[2],
//       st: parseInt(fields[3].trim()),
//       tk: parseInt(fields[4].trim()),
//       ps: parseInt(fields[5].trim()),
//       sh: parseInt(fields[6].trim()),
//       ag: parseInt(fields[7].trim()),
//       kab: parseInt(fields[8].trim()),
//       tab: parseInt(fields[9].trim()),
//       pab: parseInt(fields[10].trim()),
//       sab: parseInt(fields[11].trim()),
//       inj: parseInt(fields[fields.length-2]),
//       sus: parseInt(fields[fields.length-1]), 
//     });
//   }

//   return results;
// }

// function getPosition(player: PlayerDto): string {
//   const skills = [
//     { name: "st", val: player.st },
//     { name: "tk", val: player.tk },
//     { name: "ps", val: player.ps },
//     { name: "sh", val: player.sh },
//   ].sort((a, b) => b.val - a.val);
//   let pos = "";
//   if (skills[0].name === "st") {
//     pos = "GK";
//   } else if (skills[0].name === "tk") {
//     pos = "DF";
//   } else if (skills[0].name === "ps") {
//     pos = "MF";
//     if (
//       skills[1].name === "tk" &&
//       skills[1].val > 14 &&
//       (skills[2].name !== "sh" || skills[2].val < skills[1].val)
//     ) {
//       pos = "DM";
//     } else if (
//       skills[1].name === "sh" &&
//       skills[1].val > 14 &&
//       (skills[2].name !== "tk" || skills[2].val < skills[1].val)
//     ) {
//       pos = "AM";
//     }
//   } else if (skills[0].name === "sh") {
//     pos = "FW";
//   }
//   return pos;
// }

// export async function createOrUpdate(dto: PlayerDto, gameId: number, clubId: number, tx?: Prisma.TransactionClient): Promise<PlayerEntity> {
//   const client = tx ?? prisma;
//   const { id, ...payload } = dto
//   const pos = getPosition(payload);
//   return await client.player.upsert({
//     where: {
//       id: id ?? -1,
//       OR: [{
//         AND: [
//           { name: dto.name },
//           { nat: dto.nat },
//         ]
//       }]
//     },
//     create: { 
//       ...payload,
//       pos,
//       game: {
//         connect: {
//           id: gameId
//         }
//       },
//       club: { 
//         connect: { 
//           id: clubId 
//         } 
//       } 
//     },
//     update: { ...payload, pos, clubId },
//   });
// }