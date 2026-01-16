"use client";

import { EmptyPanel } from "@/components/empty-panel";
import { EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { ShieldAlertIcon, UserLockIcon } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();

  if (!session?.user?.isAdmin) {
    return (
      <EmptyPanel
        icon={<UserLockIcon />}
        title="403 - Access Restricted"
        description="This area is off-limits with your current permissions."
      />
    );
  }

  return children;
}
