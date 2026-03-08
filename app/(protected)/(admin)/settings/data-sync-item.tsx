import { useActiveGame } from "@/components/game-provider";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CloudSyncIcon } from "lucide-react";
import { useActionState, useCallback, useEffect, useState } from "react";
import { syncGameData } from "./actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SyncResult from "./sync-result";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { useTheme } from "next-themes";

// TODO: fix two scenarios
// 1. If page is refreshed during sync, button shows still syncing but when it's finished we get no update
// 2. If first sync and in progress, don't show anything (otherwise trying to expand throws error)

export default function DataSyncItem() {
  const [activeGame] = useActiveGame();
  const [state, formAction, pending] = useActionState(syncGameData, {});
  const [config, setConfig] = useState(
    activeGame!.settings["dataSource"] ?? {},
  );
  const { theme } = useTheme();

  const failed = "error" in state;
  const hasResult = !failed && !pending && Object.keys(state).length;
  const syncResult = hasResult ? state : activeGame?.lastSync;

  useEffect(() => {
    if ("error" in state) {
      toast.error(state.error);
    }
  }, [state, hasResult]);

  const onConfigChange = useCallback(
    (v: string) => setConfig(JSON.parse(v)),
    [],
  );

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
          <CodeMirror
            value={JSON.stringify(config, null, 2)}
            onChange={onConfigChange}
            extensions={[json()]}
            maxHeight="400px"
            readOnly={activeGame!.isSyncing || pending}
            theme={theme === "system" ? undefined : (theme as "light" | "dark")}
          />
          <div className="grid grid-cols-5 gap-3 items-top">
            <Button
              type="submit"
              variant="outline"
              disabled={activeGame!.isSyncing || pending}
            >
              {(activeGame!.isSyncing || pending) && <Spinner />}
              {activeGame!.isSyncing || pending ? "Syncing" : "Sync"}
            </Button>
            <div className="col-span-4">
              {syncResult && syncResult.status !== "running" && (
                <SyncResult data={syncResult} />
              )}
            </div>
          </div>
          <Input type="hidden" name="gameId" value={activeGame!.id} />
          <Input type="hidden" name="config" value={JSON.stringify(config)} />
        </form>
      </ItemContent>
    </Item>
  );
}
