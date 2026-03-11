import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContent from "@/components/page-content";
import { getLeagueSnapshots } from "./actions";
import { FixturesScrollPane } from "./fixtures-scroll-pane";
import { LeagueTableWithZones } from "./league-table-with-zones";

export type LeagueViewMode = "table" | "fixtures";

export async function LeagueSnapshotsView({
  title,
  mode,
  basePath,
  selectedLeagueKey,
}: {
  title: string;
  mode: LeagueViewMode;
  basePath: string;
  selectedLeagueKey?: string;
}) {
  const leagueSnapshots = await getLeagueSnapshots();

  if (leagueSnapshots.length === 0) {
    return (
      <PageContent title={title}>
        <Card>
          <CardHeader>
            <CardTitle>No league data</CardTitle>
            <CardDescription>
              Run a data sync to populate league tables and fixtures.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContent>
    );
  }

  const firstLeague = leagueSnapshots[0];
  const selectedLeague =
    leagueSnapshots.find((league) => league.leagueKey === selectedLeagueKey)
    ?? firstLeague;
  const zoneConfigByLeagueName: Record<
    string,
    { promotionLine?: number; playoffLine?: number; relegationStart?: number }
  > = {
    Premiership: {
      relegationStart: 12,
    },
    "Division 1": { promotionLine: 2, playoffLine: 6, relegationStart: 10 },
    "Division 2": { promotionLine: 2, playoffLine: 6 },
    "Youth Division 1": { relegationStart: 16 },
    "Youth Division 2": { promotionLine: 4, playoffLine: 8 },
  };

  return (
    <PageContent title={title}>
      <Tabs value={selectedLeague.leagueKey}>
        <TabsList className="flex h-auto w-full flex-wrap">
          {leagueSnapshots.map((league) => (
            <TabsTrigger key={league.leagueId} value={league.leagueKey} asChild>
              <Link href={`${basePath}?league=${league.leagueKey}`}>{league.leagueName}</Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedLeague.leagueKey}>
          <Card>
            <CardHeader>
              <CardTitle>{selectedLeague.leagueName}</CardTitle>
              <CardDescription>Season {selectedLeague.currentSeason}</CardDescription>
            </CardHeader>
            <CardContent>
              {mode === "table" && (
                <div className="pt-1">
                  <LeagueTableWithZones
                    rows={selectedLeague.table}
                    zones={zoneConfigByLeagueName[selectedLeague.leagueName]}
                  />
                </div>
              )}

              {mode === "fixtures" && (
                <div className="pt-1">
                  <FixturesScrollPane rounds={selectedLeague.fixtures} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContent>
  );
}
