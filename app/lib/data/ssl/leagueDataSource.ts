import { LeagueData } from "@/lib/domain/league";
import { DataSource } from "../dataSource";
import { SslLeagueConfig } from "./dataSource";
import CsvLeagueDataSource from "../csvLeagueDataSource";

type ParsedFixture = {
  homeClub: string
  awayClub: string
  homeGoals?: number
  awayGoals?: number
}

type ParsedRound = {
  round: number
  fixtures: ParsedFixture[]
}

function parseFixtureLine(line: string): ParsedFixture {
  const playedMatch = line.match(/^(.+?)\s+(\d+)\s+([^\w\s])\s+(\d+)\s+(.+)$/);
  if (playedMatch) {
    const [, homeClub, homeGoals, , awayGoals, awayClub] = playedMatch;
    return {
      homeClub: homeClub.trim(),
      awayClub: awayClub.trim(),
      homeGoals: parseInt(homeGoals, 10),
      awayGoals: parseInt(awayGoals, 10),
    };
  }

  const pendingMatch = line.match(/^(.+?)\s+-\s+(.+)$/);
  if (pendingMatch) {
    const [, homeClub, awayClub] = pendingMatch;
    return {
      homeClub: homeClub.trim(),
      awayClub: awayClub.trim(),
    };
  }

  throw new Error(`Unable to parse fixture line: "${line}"`);
}

function parseFixtures(text: string): ParsedRound[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const rounds: ParsedRound[] = [];
  let currentRound: ParsedRound | null = null;

  for (const line of lines) {
    if (!line) {
      continue;
    }

    const roundMatch = line.match(/^(\d+)\.\s*$/);
    if (roundMatch) {
      if (currentRound) {
        rounds.push(currentRound);
      }

      currentRound = {
        round: parseInt(roundMatch[1], 10),
        fixtures: [],
      };
      continue;
    }

    if (!currentRound) {
      // Ignore text before first explicit round header.
      continue;
    }

    currentRound.fixtures.push(parseFixtureLine(line));
  }

  if (currentRound) {
    rounds.push(currentRound);
  }

  return rounds;
}

export default class SslLeagueDataSource implements DataSource<Promise<LeagueData>> {
  constructor(
    private readonly config: SslLeagueConfig
  ) {
  }

  async getData(): Promise<LeagueData> {
    const result: LeagueData = {
      name: "",
      currentSeason: this.config.currentSeason,
      clubStats: [],
      fixtures: []
    };

    if (this.config.tableUrl) {
      const csvDs = new CsvLeagueDataSource(this.config.tableUrl);
      result.clubStats = await csvDs.getData();
    } else {
      console.warn("Unable to load table data: missing tableUrl");
    }

    if (this.config.fixturesUrl) {
      console.log("Scraping league fixture data...");
      const res = await fetch(this.config.fixturesUrl);
      if (!res.ok) {
        console.error(`${res.status} - ${res.statusText}`);
        throw new Error(`Failed to fetch fixture data from URL: ${this.config.fixturesUrl}`);
      }

      const fixtureText = await res.text();
      result.fixtures = parseFixtures(fixtureText);
    } else {
      console.warn("Unable to load fixture data: missing fixturesUrl");
    }

    return result;
  }
}
