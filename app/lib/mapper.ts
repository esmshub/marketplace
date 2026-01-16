import { 
  ClubGetPayload, 
  GameGetPayload,
  LeagueGetPayload, 
  UserGetPayload, 
  PlayerGetPayload, 
  DataSyncGetPayload,
} from "./generated/prisma/models";
import { Club } from "./domain/club";
import { Game, GameDto } from "./domain/game";
import { League } from "./domain/league";
import { User } from "./domain/user";
import { Player } from "./domain/player";
import { DataSync, DataSyncDto } from "./domain/dataSync";
import { ClubDto, PlayerDto } from "./data/dataSource";

type GameWithDataSyncs = GameGetPayload<{ include: { dataSyncs: true } }>;
type PlayerWithGame = PlayerGetPayload<{ include: { game: true } }>;
type PlayerWithClub = PlayerGetPayload<{ include: { club: true } }>;
type LeagueWithClubs = LeagueGetPayload<{ include: { clubs: true } }>;
type ClubWithPlayers = ClubGetPayload<{ include: { players: true } }>;
type ClubWithManager = ClubGetPayload<{ include: { manager: true } }>;
type ClubWithLeague = ClubGetPayload<{ include: { league: true } }>;
type ClubWithGame = ClubGetPayload<{ include: { game: true } }>;


export function mapToClub(entity: ClubGetPayload<null>): Club {
  const club = new Club(entity.id);
  club.name = entity.name;
  club.shortCode = entity.shortCode;
  club.createdAt = entity.createdAt;
  club.updatedAt = entity.updatedAt;
  club.game = (entity as ClubWithGame).game ? mapToGame((entity as ClubWithGame).game) : null;
  club.league = (entity as ClubWithLeague).league ? mapToLeague((entity as ClubWithLeague).league!) : null;
  club.manager = (entity as ClubWithManager).manager ? mapToUser((entity as ClubWithManager).manager!) : null;
  club.players = (entity as ClubWithPlayers).players?.map(mapToPlayer) ?? [];
  return club;
}

export function mapToClubDto(club: Club): ClubDto {
  return {
    id: club.id,
    gameId: club.game?.id,
    leagueId: club.league?.id,
    name: club.name!,
    shortCode: club.shortCode!,
    players: club.players?.map(mapToPlayerDto) ?? [],
  };
}

export function mapToLeague(entity: LeagueGetPayload<null>): League {
  const league = new League(entity.id);
  league.name = entity.name;
  league.synonyms = entity.synonyms;
  league.clubs = (entity as LeagueWithClubs).clubs?.map(mapToClub) ?? [];
  return league;
}

export function mapToPlayer(entity: PlayerGetPayload<null>): Player {
  const player = new Player(entity.id);
  player.name = entity.name;
  player.age = entity.age;
  player.nat = entity.nat;
  player.pos = entity.pos;
  player.st = entity.st;
  player.tk = entity.tk;
  player.ps = entity.ps;
  player.sh = entity.sh;
  player.ag = entity.ag;
  player.kab = entity.kab;
  player.tab = entity.tab;
  player.pab = entity.pab;
  player.sab = entity.sab;
  player.inj = entity.inj;
  player.sus = entity.sus;
  player.marketValue = entity.marketValue;
  player.transferStatus = entity.transferStatus;
  player.createdAt = entity.createdAt;
  player.updatedAt = entity.updatedAt;
  player.game = (entity as PlayerWithGame).game ? mapToGame((entity as PlayerWithGame).game) : undefined;
  player.club = (entity as PlayerWithClub).club ? mapToClub((entity as PlayerWithClub).club!) : null;
  return player;
}

export function mapToPlayerDto(player: Player): PlayerDto {
  return {
    id: player.id,
    gameId: player.game?.id,
    name: player.name!,
    age: player.age!,
    nat: player.nat!,
    pos: player.pos!,
    st: player.st!,
    tk: player.tk!,
    ps: player.ps!,
    sh: player.sh!,
    ag: player.ag!,
    kab: player.kab!,
    tab: player.tab!,
    pab: player.pab!,
    sab: player.sab!,
    inj: player.inj!,
    sus: player.sus!,
    club: player.club ? mapToClubDto(player.club) : null,
  };
}

export function mapToGame(entity: GameGetPayload<null>): Game {
  return new Game(
    entity.id, 
    entity.code, 
    entity.displayName,
    JSON.parse(entity.settings ?? '{}'),
    (entity as GameWithDataSyncs).dataSyncs ? (entity as GameWithDataSyncs).dataSyncs?.map(mapToDataSync<null>) : [],
  );
}

export function mapToGameDto(game: Game): GameDto {
  return {
    id: game.id,
    code: game.code,
    displayName: game.displayName,
    settings: game.settings,
    lastSync: game.dataSyncs[0] ? mapToDataSyncDto(game.dataSyncs[0]) : null,
    isSyncing: game.isSyncing,
  };
}

export function mapToDataSyncDto(dataSync: DataSync): DataSyncDto {
  return {
    id: dataSync.id,
    userId: dataSync.userId,
    startTime: dataSync.startTime,
    endTime: dataSync.endTime,
    status: dataSync.status,
    metadata: dataSync.metadata,
  };
}

export function mapToDataSync<T>(entity: DataSyncGetPayload<null>): DataSync<T> {
  const sync = new DataSync<T>();
  sync.id = entity.id;
  sync.userId = entity.userId;
  sync.startTime = entity.startTime;
  sync.endTime = entity.endTime;
  sync.status = entity.status;
  sync.metadata = entity.metadata ? JSON.parse(entity.metadata) : null;
  return sync;
}

export function mapToUser(entity: UserGetPayload<null>): User {
  const user = new User(entity.id);
  user.fullName = entity.fullName;
  user.emailAddress = entity.emailAddress;
  user.provider = entity.provider;
  user.providerAccountId = entity.providerAccountId;
  user.createdAt = entity.createdAt;
  user.clubs = (entity as UserGetPayload<{ include: { clubs: true } }>).clubs?.map(mapToClub);
  return user;
}