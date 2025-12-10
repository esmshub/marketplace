// import { promises as fs } from 'fs';
import { createReadStream, promises as fs } from "node:fs";
import path from "path";
import readline from "node:readline";
import { columns, Transfer } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ui/profile-menu";
import type { DefaultUser } from "@auth/core/types";

const transferRegex =
  /^(\w+\s+\d+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+([0-9][0-9,]*)(?:k)?$/;

const transfers: Transfer[] = [];

async function getData(): Promise<Transfer[]> {
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

    for await (const line of rl) {
      if (line === "" || line.startsWith("---")) {
        // console.log("Ignored line:",line);
        continue;
      }

      const match = line.match(transferRegex);

      if (match) {
        const transfer: Transfer = {
          season: fileName.replace(path.extname(file), ""),
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
        transfers.push(transfer);
      }
    }
  }

  return transfers;
}

export default async function TransfersPage() {
  const session = await auth();
  const user = session?.user as DefaultUser & {
    hasRole: boolean;
    isMember: boolean;
  };

  const data = user?.hasRole ? await getData() : [];

  return (
    <div className="flex flex-col container mx-auto py-10 gap-y-4">
      <div className="flex justify-between">
        <h1>SSL Transfer Market</h1>
        <ProfileMenu user={user} />
      </div>
      <div>
        <DataTable columns={columns} data={data} user={user} />
      </div>
    </div>
  );
}
