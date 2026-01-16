import { createGame, updateGame } from "../repos/game";
import { DataSync, DataSyncDto } from "./dataSync";
import { InvalidStateError } from "./errors";

export interface GameDto {
  id: number;
  code: string;
  displayName: string;
  settings: { sourceUrl: string };
  isSyncing: boolean;
  lastSync: DataSyncDto | null;
}

interface GameSettings {
  sourceUrl: string;
}

const SYNC_COOLING_OFF_PERIOD = 30000;

export class Game {
  constructor(
    public id: number,
    public code: string,
    public displayName: string,
    public settings: GameSettings,
    public readonly dataSyncs: DataSync[]
  ) {
    this.dataSyncs.sort((a, b) => {
      if (!a.endTime && !b.endTime) return 0;
      if (!a.endTime) return 1;
      if (!b.endTime) return -1;

      return b.endTime.getTime() - a.endTime.getTime();
    });
  }

  get lastSyncTime(): Date {
    return this.dataSyncs[0]?.endTime ?? new Date(0);
  }

  get isSyncing(): boolean {
    return this.dataSyncs.some((sync) => !sync.endTime);
  }

  async startSync(userId: number): Promise<DataSync> {
    if (this.lastSyncTime) {
      const diff = Date.now() - this.lastSyncTime.getTime();
      if (diff < SYNC_COOLING_OFF_PERIOD) {
        throw new InvalidStateError(`Still inside cooling off period, try again in ${Math.ceil(diff / 1000)}s`);
      }
    }

    const newSync = new DataSync();
    newSync.userId = userId;
    newSync.gameId = this.id;
    newSync.status = "started";
    newSync.startTime = new Date();
    await newSync.save();
    this.dataSyncs.push(newSync);
    return newSync;
  }

  async endSync(sync: DataSync): Promise<DataSync> {
    sync.endTime = new Date();
    await sync.save();
    return sync;
  }

    async save(): Promise<void> {
      const settings = this.settings ? JSON.stringify(this.settings) : null
      if (this.id) {
        await updateGame(this.id, {
          code: this.code,
          displayName: this.displayName,
          settings,
        });
      } else {
        const result = await createGame({
          code: this.code,
          displayName: this.displayName,
          settings
        });
        this.id = result.id;
      }
    }
}