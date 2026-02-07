import { Club } from "./club"
import { Game } from "./game"

export class User {
  constructor(
    public readonly id: number
  ) {}

  public fullName?: string
  public emailAddress?: string
  public provider?: string | null
  public providerAccountId?: string | null
  public createdAt?: Date;
  public clubs?: Club[] | null
}