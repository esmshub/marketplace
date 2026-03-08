import SslClubDataSource from "./clubDataSource";
import { GameDataSource, IterableItem } from "../../domain/dataImporter";
import { ClubData } from "@/lib/domain/club";
import SslLeagueDataSource from "./leagueDataSource";
import { LeagueData } from "@/lib/domain/league";

export interface SslLeagueConfig {
  tableUrl: string
  fixturesUrl: string
  currentSeason?: number
}

export interface SslDataSourceConfig {
  clubsUrl: string
  leagues: Record<string, SslLeagueConfig>
}

export interface SslData {
  clubs: AsyncIterable<IterableItem<ClubData>>,
  leagues: AsyncIterable<IterableItem<LeagueData>>,
}

export default class SslDataSource implements GameDataSource {
  constructor(
    private readonly config: SslDataSourceConfig
  ) {
    if (!config) throw new Error("Missing SSL config");
  }

  async *_emptyIterable<T>(): AsyncIterable<IterableItem<T>>{
    return {};
  }

  clubs(): AsyncIterable<IterableItem<ClubData>> {
    if (this.config.clubsUrl) {
      const clubDs = new SslClubDataSource(this.config.clubsUrl);
      return clubDs.getData();
    } else {
      console.warn("Unable to load club data: missing clubsUrl");
      return this._emptyIterable<ClubData>();
    }
  }

  async *leagues(): AsyncIterable<IterableItem<LeagueData>> {
    if (this.config.leagues) {
      for (const leagueName of Object.keys(this.config.leagues)) {
        try {
          const leagueDs = new SslLeagueDataSource(this.config.leagues[leagueName]);
          const value = await leagueDs.getData();
          yield { value: { ...value, name: leagueName }, ok: true };
        } catch (e) {
          console.error(e)
          yield { error: e as Error, ok: false };
        }
      }
    } else {
      console.warn("Unable to load league data: missing leagues config");
      return this._emptyIterable<LeagueData>();
    }
  }
}
