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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fragment } from "react/jsx-runtime";
import { Transfer } from "@/lib/transfers";

export const columns: ColumnDef<Transfer>[] = [
  {
    accessorKey: "season",
    header: "Season",
    aggregatedCell: () => {},
    filterFn: (row, id, value) => {
      return row.getValue<string>(id).startsWith(value);
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    enableColumnFilter: false,
    enableGrouping: false,
  },
  {
    accessorKey: "player",
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
    accessorKey: "fromClub",
    header: "From",
    // filterFn: (row, id, value) => {
    //   return row.getValue<string>(id).toLowerCase().startsWith(value.toLowerCase());
    // },
    // enableColumnFilter: true,
  },
  {
    accessorKey: "toClub",
    header: "To",
    // filterFn: (row, id, value) => {
    //   return row.getValue<string>(id).toLowerCase().startsWith(value.toLowerCase());
    // },
    // enableColumnFilter: true,
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => {
      if (row.original.fee >= 1000) {
        return row.original.fee / 1000 + "m";
      } else {
        return row.original.fee + "k";
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

export function ColumnHeader<TData>({
  header,
  enabled,
}: {
  header: Header<TData, unknown>;
  enabled?: boolean;
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
