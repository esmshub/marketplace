import { BookmarkIcon, HeartIcon, StarIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export interface StaticToggleOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export function StaticToggleMenu({
  options,
  value,
  onValueChange,
}: {
  options: StaticToggleOption[];
  value?: string[];
  onValueChange: (value: string[]) => void;
}) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      spacing={1}
      onValueChange={onValueChange}
      value={value}
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={`Toggle ${opt.label}`}
          className="rounded-full h-7 text-xs data-[state=off]:bg-transparent data-[state=on]:bg-slate-200 data-[state=on]:font-bold data-[state=on]:dark:bg-slate-500 data-[state=on]:dark:text-black"
        >
          {opt.icon}
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
