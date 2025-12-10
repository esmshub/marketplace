import { createReadStream, promises as fs } from "node:fs";
import path from "path";
import readline from "node:readline";

export type Transfer = {
  season: number;
  date: string;
  player: string;
  age: number;
  pos: string;
  st: number;
  tk: number;
  ps: number;
  sh: number;
  ag: number;
  fromClub: string;
  toClub: string;
  fee: number;
};

const transferRegex =
  /^(\w+\s+\d+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+([0-9][0-9,]*)(?:k)?$/;

const transfers: Transfer[] = [];

export async function getTransfers(): Promise<Transfer[]> {
  if (transfers.length > 0) {
    return transfers;
  }

  const dir = path.join(process.cwd(), "app/data");
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fileName = path.basename(file);
    const stream = createReadStream("app/data/" + fileName, {
      encoding: "utf8",
    });

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity, // Handle all CRLF/CR line endings safely
    });

    const season_transfers = [];

    for await (const line of rl) {
      if (line === "" || line.startsWith("---")) {
        // console.log("Ignored line:",line);
        continue;
      }

      const match = line.match(transferRegex);

      if (match) {
        const transfer: Transfer = {
          season: parseInt(fileName.replace(path.extname(file), "")),
          date: match[1],
          player: match[2],
          age: parseInt(match[3]),
          pos: "",
          st: parseInt(match[4]),
          tk: parseInt(match[5]),
          ps: parseInt(match[6]),
          sh: parseInt(match[7]),
          ag: parseInt(match[8]),
          fromClub: match[9],
          toClub: match[10],
          fee: parseInt(match[11].replace(",", "")),
        };
        const skills = [
          { name: "st", fee: transfer.st },
          { name: "tk", fee: transfer.tk },
          { name: "ps", fee: transfer.ps },
          { name: "sh", fee: transfer.sh },
        ].sort((a, b) => b.fee - a.fee);
        if (skills[0].name === "st") {
          transfer.pos = "GK";
        } else if (skills[0].name === "tk") {
          transfer.pos = "DF";
        } else if (skills[0].name === "ps") {
          transfer.pos = "MF";
          if (
            skills[1].name === "tk" &&
            skills[1].fee > 14 &&
            (skills[2].name !== "sh" || skills[2].fee < skills[1].fee)
          ) {
            transfer.pos = "DM";
          } else if (
            skills[1].name === "sh" &&
            skills[1].fee > 14 &&
            (skills[2].name !== "tk" || skills[2].fee < skills[1].fee)
          ) {
            transfer.pos = "AM";
          }
        } else if (skills[0].name === "sh") {
          transfer.pos = "FW";
        }
        season_transfers.unshift(transfer);
      }
    }

    transfers.push(...season_transfers)
  }

  transfers.sort((a, b) => b.season - a.season)
  return transfers;
}