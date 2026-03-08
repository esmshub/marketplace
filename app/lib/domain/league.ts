import { Club } from "./club"

export interface LeagueData {
  name: string
  currentSeason?: number
  fixtures: LeagueFixtureData[],
  clubStats: LeagueClubStats[],
}

export interface LeagueFixtureData {
  [key: string]: unknown
}

export interface LeagueClubStats {
  clubName: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
}

export class League {
  constructor(
    public readonly id: number
  ) {}

  public name?: string
  public synonyms?: string | null
  public currentSeason?: number
  public clubs?: Club[] | null
  public clubStats?: LeagueClubStats[]
  public fixtures?: LeagueFixtureData[]
}
