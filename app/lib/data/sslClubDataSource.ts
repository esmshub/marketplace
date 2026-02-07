import * as cheerio from "cheerio"
import { DataSource, DataSourceResponse } from "./dataSource";

export interface ClubData {
  name: string
  shortCode: string
  managerName: string
  managerEmail: string
  leagueName: string
  rosterUrl: string
  lastUpdated?: Date
  gameId?: number
  leagueId?: number
}

function normalizeWhitespace(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ");
}

export default class SslClubDataSource implements DataSource<ClubData[]> {
  constructor(
    private readonly sourceUrl: string
  ) {
  }

  async load(): Promise<DataSourceResponse<ClubData[]>> {
    if (!this.sourceUrl) {
      throw new Error("Missing SSL sourceUrl");
    }

    console.log("Sraping club data...");
    // TODO: move URL to config somewhere...
    const res = await fetch(this.sourceUrl);
    if (!res.ok) {
      return { errors: [new Error(`${res.status} - ${res.statusText}`)], data: [] };
    }
    let lastModified: Date;
    if (res.headers.has('Last-Modified')) {
      lastModified = new Date(res.headers.get('Last-Modified')!);
    }
    const url = new URL(this.sourceUrl);
    const rootUrl = `${url.protocol}//${url.host}`;

    const teamsHtml = await res.text();
    const $ = cheerio.load(teamsHtml);

    const data: ClubData[] = [];
    const errors: Error[] = [];
    $("table").last().find("tr").each((_, element) => {
      const fields = $(element).children("td");
      if (fields.length !== 6 || !$(fields.get(2)).find("a")?.attr("href")?.endsWith(".txt")) {
        console.warn(`Row does not contain manager info: ${$(element).html()}, skipping.`);
        return
      }

      try {
        const seniorRosterFile = $(fields.get(2))?.find("a")?.attr("href")?.trim() as string;
        const seniorRosterUrl = `${rootUrl}/${seniorRosterFile}`;
        const youthRosterFile = $(fields.get(4))?.find("a")?.attr("href")?.trim() as string;
        const youthRosterUrl = `${rootUrl}/${youthRosterFile}`;
        const clubName = normalizeWhitespace($(fields.get(0))?.text());
        const managerName = $(fields.get(5))?.find("u")?.text().trim().replace(/_+II$/i, "")
        const managerEmail = $(fields.get(5))?.find("a")?.attr("href")?.trim()?.replace("mailto:", "") as string

        data.push({
          name: clubName,
          shortCode: $(fields.get(2))?.text().trim().toUpperCase(),
          leagueName: normalizeWhitespace($(fields.get(1))?.text()),
          managerName,
          managerEmail,
          rosterUrl: seniorRosterUrl,
          lastUpdated: lastModified,
        });
        data.push({
          name: `${clubName} Youth`,
          shortCode: $(fields.get(4))?.text().trim().toUpperCase(),
          leagueName: `Youth ${normalizeWhitespace($(fields.get(3))?.text())}`,
          managerName,
          managerEmail,
          rosterUrl: youthRosterUrl,
          lastUpdated: lastModified,
        });
      } catch (e) {
        console.debug(`Row data: ${$(element).html()}`);
        errors.push(e as Error); 
        return
      }

      // const seniorLeague = leagues.find((l) => l.synonyms?.includes(seniorLeagueName))
      // if (!seniorLeague) {
      //   console.warn(`League does not exist: "${seniorLeagueName}", skipping.`);
      // }

      // const youthLeague = leagues.find((l) => l.synonyms?.includes(youthLeagueName));
      // if (!youthLeague) {
      //   console.warn(`League does not exist: "${youthLeagueName}", skipping.`);
      //   return;
      // }

      // const req = Promise.allSettled([
      //   seniorLeague ? scrapeRoster(seniorRosterUrl) : Promise.reject("No senior league"),
      //   youthLeague ? scrapeRoster(youthRosterUrl) : Promise.reject("No youth league"),
      // ]).then(([seniorRoster, youthRoster]) => {
      //   const upserts: Promise<ClubEntity>[] = [];

      //   if (seniorRoster.status === "fulfilled") {     
      //     upserts.push(
      //       createOrUpdate({
      //         name: normalizeWhitespace($(fields.get(0))?.text()),
      //         gameId: 'ssl',
      //         shortCode: $(fields.get(2))?.text().trim().toUpperCase(),
      //         leagueId: seniorLeague ? seniorLeague.id : -1, 
      //         manager: {
      //           gameId: 'ssl',
      //           fullName: $(fields.get(5))?.find("u")?.text().trim().replace(/_+II$/i, ""),
      //           emailAddress: $(fields.get(5))?.find("a")?.attr("href")?.trim()?.replace("mailto:", "") as string,
      //         },
      //         players: seniorRoster.value
      //       })
      //     );
      //   } else {
      //     console.warn(`Failed to scrape Senior roster: ${seniorRoster.reason}`);
      //   }

      //   if (youthRoster.status === "fulfilled") {
      //     upserts.push(
      //       createOrUpdate({
      //         name: `${normalizeWhitespace($(fields.get(0))?.text())} Youth`,
      //         gameId: 'ssl',
      //         shortCode: $(fields.get(4))?.text().trim().toUpperCase(),
      //         leagueId: seniorLeague ? seniorLeague.id : -1, 
      //         manager: {
      //           gameId: 'ssl',
      //           fullName: $(fields.get(5))?.text().trim(),
      //           emailAddress: $(fields.get(5))?.find("a")?.attr("href")?.trim()?.replace("mailto:", "") as string,
      //         },
      //         players: youthRoster.value
      //       })
      //     );
      //   } else {
      //     console.warn(`Failed to scrape Youth roster: ${youthRoster.reason}`);
      //   }

      //   return Promise.allSettled(upserts);

      // }).then(([seniorClub, youthClub]) => {
      //   const results = [];

      //   if (seniorClub.status === "fulfilled") {
      //     results.push(seniorClub.value);
      //   } else {
      //     console.warn(`Failed to create Senior club: ${seniorClub.reason}`);
      //   }

      //   if (youthClub.status === "fulfilled") {
      //     results.push(youthClub.value);
      //   } else {
      //     console.warn(`Failed to create Youth club: ${youthClub.reason}`);
      //   }

      //   return results;
      // })

      // clubs.push(req);
    });

    return { errors, data };
  }
}