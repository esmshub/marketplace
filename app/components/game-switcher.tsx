"use client";

import { ChevronsUpDown, Plus, VolleyballIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { GameDto } from "@/lib/domain/game";
import { useGames } from "./game-provider";

export function GameSwitcher({ allowCreate }: { allowCreate?: boolean }) {
  const games = useGames();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState<GameDto | undefined>(games[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {/* <activeTeam.logo className="size-4" /> */}
                {/* <NameAvatar initials={activeTeam.name} className="size-4" /> */}
                <VolleyballIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Game</span>
                <span className="truncate text-xs">
                  {activeTeam?.displayName}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Games
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeTeam?.code}
              onValueChange={(code) =>
                setActiveTeam(games.find((g) => g.code === code))
              }
            >
              {games.map((game, index) => (
                <DropdownMenuRadioItem key={index} value={game.code}>
                  {game.displayName}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            {allowCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add game
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
