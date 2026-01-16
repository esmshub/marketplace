import { useActiveGame } from "@/components/game-provider";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CloudSyncIcon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { syncGameData } from "./actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SyncResult from "./sync-result";

export default function DataSyncItem() {
  const [activeGame] = useActiveGame();
  const [state, formAction, pending] = useActionState(syncGameData, {});

  const failed = "error" in state;
  const hasResult = !failed && !pending && Object.keys(state).length;
  const syncResult = hasResult ? state : activeGame?.lastSync;

  useEffect(() => {
    if ("error" in state) {
      toast.error(state.error);
    }
  }, [state, hasResult]);

  return (
    <Item>
      <ItemMedia variant="icon">
        <CloudSyncIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Data sync</ItemTitle>
        <ItemDescription className="pb-2">
          <span>Import game data from an external source.</span>
        </ItemDescription>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex w-full items-end gap-2">
            <div className="grid w-full items-center">
              <Input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                placeholder="Enter source URL"
                defaultValue={activeGame!.settings?.sourceUrl}
                disabled={activeGame!.isSyncing || pending}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={activeGame!.isSyncing || pending}
            >
              {(activeGame!.isSyncing || pending) && <Spinner />}
              {activeGame!.isSyncing || pending ? "Syncing" : "Sync"}
            </Button>
          </div>
          <Input type="hidden" name="gameId" value={activeGame!.id} />
        </form>
        {syncResult && <SyncResult data={syncResult} />}
      </ItemContent>
    </Item>
  );
}
