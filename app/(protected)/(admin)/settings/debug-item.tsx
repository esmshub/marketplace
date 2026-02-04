import { useActiveGame } from "@/components/game-provider";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { BugIcon, CloudSyncIcon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { invalidateCache, syncGameData } from "./actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function DebugItem() {
  const [activeGame] = useActiveGame();
  const [state, formAction, pending] = useActionState(invalidateCache, {});

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
        <BugIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Debug</ItemTitle>
        <ItemDescription></ItemDescription>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex w-full items-end gap-2">
            <Button type="submit" variant="outline">
              Invalidate Cache
            </Button>
          </div>
        </form>
      </ItemContent>
    </Item>
  );
}
