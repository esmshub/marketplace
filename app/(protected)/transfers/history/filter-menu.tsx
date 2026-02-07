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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export function FilterMenu({
  filtersVisible,
  directSalesOnly,
  setFiltersVisible,
  setDirectSalesOnly,
  clearFilters,
  enabled,
}: {
  filtersVisible: boolean;
  directSalesOnly: boolean;
  setFiltersVisible: (func: (v: boolean) => boolean) => void;
  setDirectSalesOnly: (v: boolean) => void;
  clearFilters: () => void;
  enabled?: boolean;
}) {
  return (
    <ButtonGroup>
      <Button
        variant={filtersVisible ? "default" : "outline"}
        onClick={() => setFiltersVisible((v: boolean) => !v)}
        disabled={!enabled}
      >
        <FunnelIcon />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="More Options"
            disabled={!enabled}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuCheckboxItem
            checked={directSalesOnly}
            onCheckedChange={setDirectSalesOnly}
          >
            Direct sales only
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator /> */}
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
