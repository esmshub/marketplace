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

const squadStatuses = ["Not for sale", "Offers invited", "Listed"];

export function FilterMenu({
  filtersVisible,
  // statuses,
  setFiltersVisible,
  // setStatuses,
  clearFilters,
  enabled,
}: {
  filtersVisible: boolean;
  // statuses: string[];
  setFiltersVisible: (func: (v: boolean) => boolean) => void;
  // setStatuses: (v: string[]) => void;
  clearFilters: () => void;
  enabled: boolean;
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
          </DropdownMenuCheckboxItem> */}
          {/* <DropdownMenuSeparator /> */}
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
