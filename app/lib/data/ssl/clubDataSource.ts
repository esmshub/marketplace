import * as cheerio from "cheerio"
import { DataSource } from "../dataSource";
import CsvPlayerDataSource from "../csvPlayerDataSource";
import { IterableItem } from "@/lib/domain/dataImporter";
import { ClubData } from "@/lib/domain/club";

function normalizeWhitespace(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ");
}

export default class SslClubDataSource implements DataSource<AsyncIterable<IterableItem<ClubData>>> {
  constructor(
    private readonly sourceUrl: string
  ) {
  }

  getData(): AsyncIterable<IterableItem<ClubData>> {
    if (!this.sourceUrl) {
      throw new Error("Missing SSL sourceUrl");
    }

    async function* scrapeClubs(clubsUrl: string): AsyncIterable<IterableItem<ClubData>> {
      console.log("Sraping club data...");
      const res = await fetch(clubsUrl);
      // return empty response with error
      if (!res.ok) return { errors: [new Error(`${res.status} - ${res.statusText}`)], data: (async function* () {})() };

      let lastModified: Date;
      if (res.headers.has('Last-Modified')) {
        lastModified = new Date(res.headers.get('Last-Modified')!);
      }
      const url = new URL(clubsUrl);
      const rootUrl = `${url.protocol}//${url.host}`;

      const teamsHtml = await res.text();
      const $ = cheerio.load(teamsHtml);
      const $rows = $("table").last().find("tr");

      for (let i = 0; i < $rows.length; i++) {
        const $row = $rows.eq(i)
        const fields = $row.children("td");
        if (fields.length !== 6 || !$(fields.get(2)).find("a")?.attr("href")?.endsWith(".txt")) {
          console.warn(`Row does not contain manager info: ${$row.html()}, skipping.`);
          continue;
        }

        try {
          const seniorRosterFile = $(fields.get(2))?.find("a")?.attr("href")?.trim() as string;
          const seniorRosterUrl = `${rootUrl}/${seniorRosterFile}`;
          const youthRosterFile = $(fields.get(4))?.find("a")?.attr("href")?.trim() as string;
          const youthRosterUrl = `${rootUrl}/${youthRosterFile}`;
          const clubName = normalizeWhitespace($(fields.get(0))?.text());
          const managerName = $(fields.get(5))?.find("u")?.text().trim().replace(/_+II$/i, "")
          const managerEmail = $(fields.get(5))?.find("a")?.attr("href")?.trim()?.replace("mailto:", "") as string

          // fetch senior club
          const seniorClubData = {
            name: clubName,
            shortCode: $(fields.get(2))?.text().trim().toUpperCase(),
            leagueName: normalizeWhitespace($(fields.get(1))?.text()),
            managerName,
            managerEmail,
            rosterUrl: seniorRosterUrl,
            lastUpdated: lastModified!,
          }

          try {
            console.log(`Sraping roster data for ${seniorClubData.name}...`);
            const rosterDs = new CsvPlayerDataSource(seniorRosterUrl);
            const players = await rosterDs.getData();
            yield { value: { ...seniorClubData, players }, ok: true };
          } catch (e) {
            console.debug(`Row data: ${$row.html()}`);
            yield { ok: false, error: e as Error };
          }

          // fetch youth club
          const youthClubData = {
            name: `${clubName} Youth`,
            shortCode: $(fields.get(4))?.text().trim().toUpperCase(),
            leagueName: `Youth ${normalizeWhitespace($(fields.get(3))?.text())}`,
            managerName,
            managerEmail,
            rosterUrl: youthRosterUrl,
            lastUpdated: lastModified!,
          };

          try {
            console.log(`Sraping roster data for ${youthClubData.name}...`);
            const rosterDs = new CsvPlayerDataSource(youthRosterUrl);
            const players = await rosterDs.getData();
            yield { value: { ...youthClubData, players }, ok: true };
          } catch (e) {
            console.debug(`Row data: ${$row.html()}`);
            yield { ok: false, error: e as Error };
          }

        } catch (e) {
          console.debug(`Row data: ${$row.html()}`);
          yield { ok: false, error: e as Error };
        }
      }
    }

    return scrapeClubs(this.sourceUrl);
  }
}