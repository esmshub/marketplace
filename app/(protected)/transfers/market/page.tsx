import { auth } from "@/auth";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClubInfoSheet } from "@/components/club-info";
import { redirect } from "next/navigation";
import PageContent from "@/components/page-content";
import { getPlayers } from "./actions";
import { Card, CardContent } from "@/components/ui/card";

export default async function TransferMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ clubId: string }>;
}) {
  const queryParams = await searchParams;
  const session = await auth();

  const players = await getPlayers();

  const handleClubOverflowClosed = () => {
    const { clubId, ...updatedParams } = queryParams;
    redirect(`?${updatedParams.toString()}`);
  };

  return (
    <PageContent title="Transfer Market">
      <Card>
        <CardContent>
          <DataTable columns={columns} data={players} user={session!.user} />
          {queryParams.clubId && <ClubInfoSheet />}
        </CardContent>
      </Card>
    </PageContent>
  );
}
