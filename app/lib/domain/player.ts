import { Club } from "./club"
import { Game } from "./game"

export class Player {
  constructor(
    public readonly id: number
  ) {}

  public name?: string
  public age?: number
  public nat?: string
  public pos?: string
  public st?: number
  public tk?: number  
  public ps?: number
  public sh?: number
  public ag?: number
  public kab?: number
  public tab?: number
  public pab?: number
  public sab?: number
  public inj?: number
  public sus?: number
  public marketValue?: number | null
  public transferStatus?: string | null
  public createdAt?: Date
  public updatedAt?: Date | null
  public game?: Game
  public club?: Club | null
}