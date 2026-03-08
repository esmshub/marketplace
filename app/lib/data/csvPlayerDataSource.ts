import { DataSource, DataSourceResponse, PlayerDto } from "./dataSource";

function normalizeWhitespace(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ");
}

function getPosition(player: PlayerDto): string {
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

export default class CsvPlayerDataSource implements DataSource<Promise<PlayerDto[]>> {
  constructor(
    private readonly sourceUrl: string
  ) {
  }

  async getData(): Promise<PlayerDto[]> {
    if (!this.sourceUrl) {
      throw new Error("Missing SSL sourceUrl");
    }

    console.log("Sraping player data...");
    // TODO: move URL to config somewhere...
    const res = await fetch(this.sourceUrl);
    if (!res.ok) {
      console.error(`${res.status} - ${res.statusText})`);
      throw new Error(`Failed to fetch player data from URL: ${this.sourceUrl}`);
    }
  
    let lastModified: Date;
    if (res.headers.has('Last-Modified')) {
      lastModified = new Date(res.headers.get('Last-Modified')!);
    }

    const rosterData = await res.text();
    const lines = rosterData.toString().split(/\r?\n/);

    const results: PlayerDto[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('---') || trimmed === '') {
        continue;
      }

      // Split by whitespace
      const fields = trimmed.split(/\s+/);
      if (fields[0] === 'Name') {
        // skip header row
        continue;
      }

      const dto: PlayerDto = {
        name: fields[0],
        age: parseInt(fields[1].trim()),
        nat: fields[2],
        pos: "",
        st: parseInt(fields[3].trim()),
        tk: parseInt(fields[4].trim()),
        ps: parseInt(fields[5].trim()),
        sh: parseInt(fields[6].trim()),
        ag: parseInt(fields[7].trim()),
        kab: parseInt(fields[8].trim()),
        tab: parseInt(fields[9].trim()),
        pab: parseInt(fields[10].trim()),
        sab: parseInt(fields[11].trim()),
        inj: parseInt(fields[fields.length-2]),
        sus: parseInt(fields[fields.length-1]),
        updatedAt: lastModified!,
        club: null,
      };
      dto.pos = getPosition(dto);
      results.push(dto);
    }

    return results
  }
}