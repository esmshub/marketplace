"use client";

import { ColumnDef, flexRender, Header } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  GripVerticalIcon,
  ListTreeIcon,
  ArrowRightIcon,
  BandageIcon,
  AmbulanceIcon,
  BanIcon,
  ShieldBanIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fragment } from "react/jsx-runtime";
import Link from "next/link";
import { PlayerDto } from "@/lib/data/dataSource";

export const columns: ColumnDef<PlayerDto>[] = [
  {
    accessorKey: "inf",
    header: "INF",
    enableColumnFilter: false,
    filterFn: (row, id, filterValue) => {
      if (filterValue.length === 0) return true;

      return (
        (filterValue.includes("inj") && row.original.inj > 0) ||
        (filterValue.includes("sus") && row.original.sus > 0) ||
        (filterValue.includes("listed") &&
          row.original.transferStatus === "listed")
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      return (
        rowA.original.inj -
        rowB.original.inj +
        rowA.original.sus -
        rowB.original.sus
      );
    },
    cell: ({ row }) => {
      if (row.original.sus > 0) {
        return (
          <Badge
            variant="destructive"
            title="Suspension time"
            // className="bg-blue-500 text-white dark:bg-blue-600"
          >
            <BanIcon />
            {row.original.sus} week{row.original.sus > 1 && "s"}
          </Badge>
        );
      } else if (row.original.inj > 0) {
        return (
          <Badge
            variant="secondary"
            className="bg-orange-500 text-white dark:bg-orange-600"
            title="Injury time"
          >
            <AmbulanceIcon />
            {row.original.inj} week{row.original.inj > 1 && "s"}
          </Badge>
        );
      } else {
        return <Badge variant="secondary">Available</Badge>;
      }
    },
  },
  {
    accessorKey: "name",
    header: "Player",
    // cell: ({ row }) => (
    //   <div className="flex items-center gap-2">
    //     <div className="font-medium leading-none">{row.getValue("player")}</div>
    //     <div className="text-sm text-muted-foreground">
    //       {row.original.fromClub}
    //     </div>
    //   </div>
    // ),
    // filterFn: (row, id, value) => {
    //   return row.getValue<string>(id).toLowerCase().includes(value.toLowerCase()) || row.original.fromClub.toLowerCase().startsWith(value.toLowerCase());
    // },
    // enableColumnFilter: true,
  },
  {
    accessorKey: "club",
    header: "Club",
    filterFn: (row, id, value) => {
      return (row.original.club?.name ?? "Free agent")
        .toLowerCase()
        .startsWith(value.toLowerCase());
    },
    sortingFn: (rowA, rowB, columnId) => {
      return (rowA.original.club?.name ?? "Free agent").localeCompare(
        rowB.original.club?.name ?? "Free agent",
      );
    },
    cell: ({ row }) =>
      // <Link
      //   href={{ query: { clubId: row.original.club!.id } }}
      //   className="hover:underline"
      // >
      //   {row.original.club?.name ?? "Free agent"}
      // </Link>
      row.original.club?.name ?? "Free agent",
  },
  {
    header: "Pos",
    accessorKey: "pos",
  },
  {
    accessorKey: "age",
    header: "Age",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "st",
    header: "ST",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "tk",
    header: "TK",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "ps",
    header: "PS",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "sh",
    header: "SH",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "ag",
    header: "AG",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "kab",
    header: "KAb",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "tab",
    header: "TAb",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "pab",
    header: "PAb",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "sab",
    header: "SAb",
    enableColumnFilter: false,
    aggregatedCell: () => {},
  },
  {
    accessorKey: "status",
    header: "Squad status",
    cell: ({ getValue }) => getValue() ?? "Not set",
    enableColumnFilter: false,
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      if (value === undefined) {
        return "Not set";
      } else if (value >= 1000) {
        return value / 1000 + "m";
      } else {
        return value + "k";
      }
    },
    aggregatedCell: ({ getValue }) => {
      const aggValue = getValue<number>();
      if (aggValue >= 1000) {
        return aggValue / 1000 + "m";
      } else {
        return aggValue + "k";
      }
    },
    enableColumnFilter: false,
    aggregationFn: "sum",
  },
  // {
  // id: "actions",
  // cell: ({ row }) => {
  //   const payment = row.original

  //   return (
  //     <DropdownMenu>
  //       <DropdownMenuTrigger asChild>
  //         <Button variant="ghost" className="h-8 w-8 p-0">
  //           <span className="sr-only">Open menu</span>
  //           <MoreHorizontal className="h-4 w-4" />
  //         </Button>
  //       </DropdownMenuTrigger>
  //       <DropdownMenuContent align="end">
  //         <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //         <DropdownMenuItem
  //           onClick={() => navigator.clipboard.writeText(payment.id)}
  //         >
  //           Copy payment ID
  //         </DropdownMenuItem>
  //         <DropdownMenuSeparator />
  //         <DropdownMenuItem>View customer</DropdownMenuItem>
  //         <DropdownMenuItem>View payment details</DropdownMenuItem>
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   )
  // },
  // }
];

export function ColumnHeader({
  header,
  enabled,
}: {
  header: Header<unknown, unknown>;
  enabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: header.id,
    data: header.column,
    disabled: !enabled,
  });
  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(transform),
  };

  return (
    <TableHead key={header.id}>
      {header.isPlaceholder ? null : (
        <div
          ref={setNodeRef}
          style={style}
          {...{
            className: header.column.getCanSort()
              ? "flex items-center cursor-pointer select-none"
              : "",
            onClick: header.column.getToggleSortingHandler(),
          }}
        >
          {header.column.getCanGroup() && !header.column.getIsGrouped() && (
            <div {...attributes} {...listeners}>
              <GripVerticalIcon
                size={16}
                className="text-muted-foreground cursor-grab active:cursor-grabbing"
              />
            </div>
          )}
          {flexRender(header.column.columnDef.header, header.getContext())}
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[header.column.getIsSorted() as string] ?? null}
          {/* {header.column.getCanGroup() ? (
                // If the header can be grouped, let's add a toggle
                <button
                  {...{
                    onClick: header.column.getToggleGroupingHandler(),
                    style: {
                      cursor: 'pointer',
                    },
                  }}
                >
                  {header.column.getIsGrouped()
                    // ? <XIcon size={16} />
                    ? null
                    :  <PlusIcon size={16} />}
                </button>
              ) : null} */}
        </div>
      )}
    </TableHead>
  );
}

type RemoveGroupFunction = (group: string) => void;

export function GroupToolbar({
  groups,
  removeGroup,
}: {
  groups: string[];
  removeGroup: RemoveGroupFunction;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "group-dz",
  });
  // const style = {
  //   opacity: isOver ? 1 : 0.5,
  // };

  return (
    <div
      ref={setNodeRef}
      className="flex items-center space-x-2 text-muted-foreground text-xs"
    >
      <ListTreeIcon size={16} />
      {groups?.length === 0 && !isOver && (
        <span className="italic">Drag a column to group</span>
      )}
      {groups.map((g, i) => (
        <Fragment key={`g${i}`}>
          <Badge variant="secondary" className="pl-3">
            {g}{" "}
            <Button
              className="h-5 w-5 p-2 text-gray-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 hover:dark:bg-slate-900 cursor-pointer"
              onClick={() => removeGroup(g)}
            >
              x
            </Button>
          </Badge>
          {i !== groups.length - 1 && <ArrowRightIcon size={16} />}
        </Fragment>
      ))}
      {isOver && <span className="italic">Drop to add</span>}
    </div>
  );
}
