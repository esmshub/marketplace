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
  const [state, formAction, pending] = useActionState(invalidateCache, {});

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
