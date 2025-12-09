"use client";

import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FunnelIcon,
  FunnelX,
  FunnelXIcon,
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
import { useState } from "react";

export function FilterMenu({
  filtersVisible,
  setFiltersVisible,
  clearFilters,
}: {
  filtersVisible: boolean;
  setFiltersVisible: (func: (v: boolean) => boolean) => void;
  clearFilters: () => void;
}) {
  return (
    <ButtonGroup>
      <Button
        variant={filtersVisible ? "default" : "outline"}
        onClick={() => setFiltersVisible((v: boolean) => !v)}
      >
        <FunnelIcon />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => clearFilters()}>
              <FunnelXIcon />
              Clear filters
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
