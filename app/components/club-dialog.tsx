import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TagsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SquadList } from "./squad-list";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Card } from "./ui/card";
import { Club, League, Player, User } from "@/lib/generated/prisma/client";
import { PlayerDto } from "@/lib/data/dataSource";

const TransferListItem = ({ player }: { player: PlayerDto }) => (
  <div className="flex">
    <div>{player.name}</div>
    <div>{player.transferStatus}</div>
    <div>{player.marketValue}</div>
  </div>
);

function TransferList({ players }: { players: PlayerDto[] }) {
  const listed = players.filter((p) => p.transferStatus === "listed");
  if (!listed.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TagsIcon />
          </EmptyMedia>
          <EmptyTitle>List is empty</EmptyTitle>
          <EmptyDescription>No players have been listed.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex">
      {listed.map((player) => (
        <TransferListItem key={`tfl-${player.id}`} player={player} />
      ))}
    </div>
  );
}

export function ClubDialog({
  club,
  onOpenChange,
}: {
  club: (Club & { manager: User; players: PlayerDto[]; league: League }) | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!club) return null;

  return (
    <Dialog open={!!club} defaultOpen={false} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px] min-w-1/2">
          <DialogHeader>
            <DialogTitle>Club Profile - {club?.name}</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Manager</Label>
              <span id="manager-name">{club.manager?.fullName}</span>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Email</Label>
              <span id="manager-email">{club.manager?.emailAddress}</span>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="league">Current League</Label>
              <span id="league">{club.league?.name}</span>
            </div>
            <Card className="grid col-span-full p-2">
              <Tabs defaultValue="squad">
                <TabsList>
                  <TabsTrigger value="squad">Transfer list</TabsTrigger>
                  <TabsTrigger value="password">Squad</TabsTrigger>
                </TabsList>
                <TabsContent className="p-2" value="squad">
                  <TransferList players={club.players} />
                </TabsContent>
                <TabsContent className="p-2" value="password">
                  <SquadList players={club.players} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
