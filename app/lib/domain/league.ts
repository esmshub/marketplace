import { Club } from "./club"

export class League {
  constructor(
    public readonly id: number
  ) {}

  public name?: string
  public synonyms?: string | null
  public clubs?: Club[] | null
}