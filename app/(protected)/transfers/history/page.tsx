import { auth } from "@/auth";
import { getCachedTransfers } from "@/lib/transfers";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import PageContent from "@/components/page-content";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Transfer History",
};

export default async function TransferHistoryPage() {
  const session = await auth();
  const data = await getCachedTransfers();

  return (
    <PageContent title="Transfer History">
      <Card>
        <CardContent>
          <DataTable columns={columns} data={data} user={session?.user} />
        </CardContent>
      </Card>
    </PageContent>
  );
}
