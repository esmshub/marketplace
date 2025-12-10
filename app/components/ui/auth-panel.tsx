import { LockIcon, ShieldUserIcon, UserLockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import DiscordLogo from "@/img/discord.svg";
import Image from "next/image";

export function AuthPanel({ user }: { user: any }) {
  if (user?.hasRole) {
    return null;
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {!user ? <LockIcon /> : <UserLockIcon />}
        </EmptyMedia>
        <EmptyTitle>
          {user ? "Insufficient Permissions" : "Unlock Access"}
        </EmptyTitle>
        <EmptyDescription>
          You must be a member of the ESMS Hub Discord server and have the{" "}
          <Badge
            className="rounded-sm bg-slate-600 dark:text-white"
            variant="default"
          >
            <ShieldUserIcon className="w-10" />
            Moderator
          </Badge>{" "}
          role assigned to access this tool.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          {!user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn("discord")}
            >
              <Image
                src={DiscordLogo}
                alt="Discord"
                className="mr-2 h-4 w-4 dark:invert"
              />
              Sign in to verify
            </Button>
          )}
          {/* <Button>Create Project</Button> */}
          {/* <Button variant="outline">Import Project</Button> */}
        </div>
      </EmptyContent>
      {/* <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="#">
          Learn More <ArrowUpRightIcon />
        </a>
      </Button> */}
    </Empty>
  );
}
