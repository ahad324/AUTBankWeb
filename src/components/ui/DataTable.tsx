import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/TablePagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowClassName?: string;
  enablePagination?: boolean;
  initialPageSize?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  manualPagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowClassName,
  enablePagination = false,
  initialPageSize = 10,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  manualPagination = false,
  pageCount,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enablePagination && !manualPagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    state: { pagination },
    onPaginationChange: (updater) => {
      setPagination(updater);
      if (onPaginationChange) {
        const newPagination =
          typeof updater === "function" ? updater(pagination) : updater;
        onPaginationChange(newPagination);
      }
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
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
                className={cn(rowClassName)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {enablePagination && (
        <TablePagination
          table={table}
          showPageSizeSelector={showPageSizeSelector}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}