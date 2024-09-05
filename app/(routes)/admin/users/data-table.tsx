"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MobileCard } from "./MobileCard";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const actionColumn = columns.find((col) => col.id === "actions");
  const dataColumns = columns.filter((col) => col.id !== "actions");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-center items-center py-4 gap-4 ">
        <Input
          placeholder="Filter SchoolId..."
          value={
            (table.getColumn("schoolId")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("schoolId")
              ?.setFilterValue(value !== "" ? Number(value) : undefined);
          }}
          className=""
        />
        <Input
          placeholder="Filter SchoolName..."
          value={
            (table.getColumn("schoolName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("schoolName")?.setFilterValue(event.target.value)
          }
        />
        <Input
          placeholder="Filter Contact Number..."
          value={
            (table.getColumn("contactNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("contactNumber")?.setFilterValue(event.target.value)
          }
        />
      </div>
      <div className="hidden md:block">
        <div className="shadow-md bg-slate-200 sm:rounded-b-lg border">
          <Table>
            <TableHeader className="table-header">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-white text-center uppercase">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="even:text-purple-500 text-center  odd:text-slate-800" // Add this class
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className=" font-semibold text-[15px] uppercase ">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="block md:hidden">
        {table.getRowModel().rows.map((row) => (
          <MobileCard
            key={row.id}
            data={row.original}
            columns={dataColumns as { accessorKey: string; header: string }[]}
            actionColumn={actionColumn}
          />
        ))}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
