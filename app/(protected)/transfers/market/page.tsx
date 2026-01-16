import { auth } from "@/auth";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClubDialog } from "@/components/club-dialog";
import { ClubInfoSheet } from "@/components/club-info";
import { redirect } from "next/navigation";
import PageContent from "@/components/page-content";
import { getGame } from "@/lib/repos/game";
import { getClubs } from "@/lib/repos/club";
import { mapToPlayer, mapToPlayerDto } from "@/lib/mapper";
import { Player } from "@/lib/domain/player";
import { unstable_cache } from "next/cache";

const getCachedClubs = unstable_cache(
  async () => {
    console.log("Fetching clubs from Database...");
    return getClubs({ players: true });
  },
  undefined,
  {
    tags: ["clubs"],
    revalidate: 86400, // 1hr
  }
);

export default async function TransferMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ clubId: string }>;
}) {
  const queryParams = await searchParams;

  const session = await auth();
  const data = await getCachedClubs();
  const players = data.flatMap(
    (c) => c.players?.map((p) => mapToPlayerDto({ ...p, club: c })) ?? []
  );
  players.sort((a, b) => {
    const surnameA = a?.name.split("_").pop();
    const surnameB = b?.name.split("_").pop();
    return surnameA!.localeCompare(surnameB!);
  });

  const handleClubOverflowClosed = () => {
    const { clubId, ...updatedParams } = queryParams;
    redirect(`?${updatedParams.toString()}`);
  };

  return (
    // <div className="flex flex-col container mx-auto py-10 gap-y-4">
    // <div>
    <PageContent title="Transfer Market">
      <DataTable columns={columns} data={players} user={session!.user} />
      {queryParams.clubId && (
        <ClubInfoSheet />
        // <ClubDialog
        //   club={null}
        //   // clubId={clubId}
        //   onOpenChange={(open) => {}}
        // />
      )}
    </PageContent>
    // </div>
    // </div>
  );
}
