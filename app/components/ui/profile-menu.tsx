"use client";

import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FunnelIcon,
  FunnelX,
  FunnelXIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
  UserRoundXIcon,
  VolumeOffIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { signOut } from "next-auth/react";

export function ProfileMenu({ user }: { user: any }) {
  if (!user) {
    return null;
  }

  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-lg" aria-label="Profile menu">
            <Avatar>
              <AvatarImage src={user.image} />
              <AvatarFallback className="w-8 p-2 border-1 rounded-full ">
                {user?.name?.split(/\s+/).map((s) => s[0])}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
