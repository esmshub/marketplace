import { redirect } from "next/navigation";
import { LeagueSnapshotsView } from "../league-snapshots-view";

export default async function LeagueFixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const params = await searchParams;
  if (!params.league) {
    redirect("/leagues/fixtures?league=prem");
  }

  return (
    <LeagueSnapshotsView
      title="League Fixtures"
      mode="fixtures"
      basePath="/leagues/fixtures"
      selectedLeagueKey={params.league}
    />
  );
}
