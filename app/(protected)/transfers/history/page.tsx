import { auth } from "@/auth";
import { getCachedTransfers } from "@/lib/transfers";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import PageContent from "@/components/page-content";

export const metadata = {
  title: "Transfer History",
};

export default async function TransferHistoryPage() {
  const session = await auth();
  const data = await getCachedTransfers();

  return (
    <PageContent title="Transfer History">
      <DataTable columns={columns} data={data} user={session?.user} />
    </PageContent>
  );
}
