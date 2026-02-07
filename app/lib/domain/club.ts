import { Game } from "./game";
import { League } from "./league";
import { User } from "./user";
import { Player } from "./player";

export class Club {
  constructor(
    public readonly id: number,
  ) {
  }

  public name?: string
  public shortCode?: string
  public createdAt?: Date
  public updatedAt?: Date | null

  public game?: Game | null
  public league?: League | null
  public manager?: User | null
  public players?: Player[]

  async save(): Promise<void> {

  }
}
