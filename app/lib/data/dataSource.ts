export interface DataSourceResponse<T> {
  errors: Error[]
  data: T
}

export interface DataSource<T> {
  load(): Promise<DataSourceResponse<T>>
}

export interface UserDto {
  id?: number
  fullName: string
  emailAddress: string
}

export interface ClubDto {
  id?: number
  gameId?: number
  shortCode: string
  name: string
  manager?: UserDto
  leagueId?: number
  updatedAt?: Date
  players: PlayerDto[]
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