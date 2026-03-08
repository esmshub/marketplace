import { DataSource, LeagueClubStats } from "./dataSource";

export default class CsvLeagueDataSource implements DataSource<Promise<LeagueClubStats[]>> {
  constructor(
    private readonly sourceUrl: string
  ) {
  }

  async getData(): Promise<LeagueClubStats[]> {
    if (!this.sourceUrl) {
      throw new Error("Missing SSL sourceUrl");
    }

    console.log("Sraping league data...");
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

    const results: LeagueClubStats[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('---') || trimmed === '') {
        continue;
      }

      // Split by whitespace
      const fields = trimmed.split(/\s+/);
      if (fields[0] === 'Pl') {
        // skip header row
        continue;
      }

      const dto: LeagueClubStats = {
        clubName: fields[1].trim(),
        played: parseInt(fields[2]),
        won: parseInt(fields[3].trim()),
        drawn: parseInt(fields[4].trim()),
        lost: parseInt(fields[5].trim()),
        gf: parseInt(fields[6].trim()),
        ga: parseInt(fields[7].trim()),
        gd: parseInt(fields[8].trim()),
        pts: parseInt(fields[9].trim()),
        updatedAt: lastModified!,
      };
      results.push(dto);
    }

    return results
  }
}