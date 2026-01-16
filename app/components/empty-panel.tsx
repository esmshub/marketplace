import {
  ListXIcon,
  LockIcon,
  SearchXIcon,
  ShieldUserIcon,
  UserLockIcon,
} from "lucide-react";

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

export function EmptyPanel({
  title,
  description,
  icon,
  children,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon ?? <SearchXIcon />}</EmptyMedia>
        <EmptyTitle>{title ?? "No results"}</EmptyTitle>
        <EmptyDescription>
          {description ?? "No results found."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
    </Empty>
  );
}
