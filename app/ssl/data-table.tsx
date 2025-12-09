"use client";

import {
  ColumnDef,
  flexRender,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  useReactTable,
  ColumnFiltersState,
  GroupingState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { DndContext } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ChevronRight,
  ChevronLeft,
  ArrowDownIcon,
  ArrowRightIcon,
  FunnelIcon,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ColumnHeader, GroupToolbar } from "./columns";
import { FilterMenu } from "./filter-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      grouping,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // needed for client-side filtering
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });

  const handleDragEnd = ({ over, active }: { over: any; active: any }) => {
    if (over?.id === "group-dz") {
      active.data?.current.toggleGrouping();
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex mb-2 space-x-2 justify-end">
        <FilterMenu
          filtersVisible={showFilters}
          setFiltersVisible={setShowFilters}
          clearFilters={table.resetColumnFilters}
        />
        <ModeToggle />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow key="group-toolbar" className="hover:bg-inherit">
              <TableHead colSpan={columns.length}>
                <GroupToolbar
                  groups={grouping}
                  removeGroup={(group) =>
                    setGrouping(grouping.filter((g) => g !== group))
                  }
                />
              </TableHead>
            </TableRow>
            {showFilters &&
              table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-inherit">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ||
                        !header.column.getCanFilter() ? null : (
                          <DebouncedInput
                            // className="w-36 border shadow rounded"
                            className="w-full border rounded text-xs p-1"
                            onChange={(value) =>
                              header.column.setFilterValue(value)
                            }
                            placeholder={`Search ${header.column.columnDef.header}...`}
                            type="text"
                            value={
                              (header.column.getFilterValue() ?? "") as string
                            }
                          />
                        )}
                        {!header.column.getCanFilter() &&
                          header.column.getIndex() == 0 && (
                            <FunnelIcon
                              size={16}
                              className="text-muted-foreground"
                            />
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-inherit">
                {headerGroup.headers.map((h) => (
                  <ColumnHeader key={h.id} header={h} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? "pointer"
                                  : "normal",
                              },
                            }}
                          >
                            <div className="flex items-center">
                              {row.getIsExpanded() ? (
                                <ArrowDownIcon size={16} />
                              ) : (
                                <ArrowRightIcon size={16} />
                              )}{" "}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}{" "}
                              ({row.subRows.length})
                            </div>
                          </button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center">
        <div className="flex space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeftToLineIcon />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRightToLineIcon />
          </Button>
        </div>
      </div>
    </DndContext>
  );
}
