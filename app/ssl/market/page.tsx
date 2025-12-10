import { columns } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "@/auth";
import { getTransfers } from "@/lib/transfers";
import { ProfileMenu } from "@/components/ui/profile-menu";
import type { DefaultUser } from "@auth/core/types";

export default async function TransfersPage() {
  const session = await auth();
  const user = session?.user as DefaultUser & {
    hasRole: boolean;
    isMember: boolean;
  };

  const data = user?.hasRole ? await getTransfers() : [];

  return (
    <div className="flex flex-col container mx-auto py-10 gap-y-4">
      <div className="flex justify-between">
        <h1>SSL Transfer Market</h1>
        <ProfileMenu user={user} />
      </div>
      <div>
        <DataTable columns={columns} data={data} user={user} />
      </div>
    </div>
  );
}
