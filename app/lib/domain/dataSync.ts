import { createDataSync, updateDataSync } from "../repos/dataSync"

export interface DataSyncSuccessfulMetadata {
  clubs: {
    updated: number;
    inserted: number;
    failed: number;
  },
  players: {
    updated: number;
    inserted: number;
    failed: number;
  }
}

export interface DataSyncFailedMetadata {
  error: string;
}

export interface DataSyncDto<T = DataSyncSuccessfulMetadata | DataSyncFailedMetadata | null> {
  id?: number
  userId?: number
  startTime?: Date
  endTime?: Date | null
  status?: string
  metadata?: T
}

export class DataSync<T = DataSyncSuccessfulMetadata | DataSyncFailedMetadata | null> {
  
  constructor() {}

  public id?: number
  public userId?: number
  public gameId?: number
  public startTime?: Date
  public endTime?: Date | null
  public status?: string
  public metadata?: T

  async save(): Promise<void> {
    const metadata = this.metadata ? JSON.stringify(this.metadata) : null
    if (this.id) {
      await updateDataSync(this.id, {
        ...this,
        metadata
      });
    } else {
      const result = await createDataSync({
        userId: this.userId!,
        gameId: this.gameId!,
        startTime: this.startTime!,
        endTime: this.endTime,
        status: this.status!,
        metadata
      });
      this.id = result.id;
    }
  }
}