"use client";

import PageContent from "@/components/page-content";
import DataSyncItem from "./data-sync-item";
import DebugItem from "./debug-item";

export default function SettingsPage() {
  return (
    <PageContent title="Settings">
      <div className="flex flex-col container max-w-2xl gap-4">
        <DataSyncItem />
        <DebugItem />
      </div>
    </PageContent>
  );
}
