import { ManagerDto } from "../domain/club"

export interface DataSourceResponse<T> {
  errors: Error[]
  data: T
}

export interface DataSource<T> {
  getData(): T
}

export interface ClubDto {
  id?: number
  gameId?: number
  shortCode: string
  name: string
  manager?: ManagerDto
  leagueId?: number
  updatedAt?: Date
}

export interface PlayerDto {
  id?: number
  gameId?: number
  clubId?: number
  name: string
  age: number
  nat: string
  pos: string
  st: number
  tk: number
  ps: number
  sh: number
  ag: number
  kab: number
  tab: number
  pab: number
  sab: number
  inj: number
  sus: number
  transferStatus?: string
  marketValue?: number
  updatedAt?: Date
  club: ClubDto | null
}

export interface LeagueClubStats {
  clubName: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
  updatedAt?: Date
}

export interface LeagueDto {
  table: LeagueClubStats[]
}