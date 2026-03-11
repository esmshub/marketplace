import { redirect } from "next/navigation";
import { LeagueSnapshotsView } from "../league-snapshots-view";

export default async function LeagueTablesPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const params = await searchParams;
  if (!params.league) {
    redirect("/leagues/tables?league=prem");
  }

  return (
    <LeagueSnapshotsView
      title="League Tables"
      mode="table"
      basePath="/leagues/tables"
      selectedLeagueKey={params.league}
    />
  );
}
