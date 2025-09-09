"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

// Define the type for our table data
export type TableData = {
  [key: string]: any;
};

// Create dynamic columns based on the data structure
export const createColumns = (headers: string[]): ColumnDef<TableData>[] => {
  return headers.map((header) => ({
    accessorKey: header,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {header}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(header);
      return (
        <div className="max-w-[200px] truncate">{value?.toString() ?? ""}</div>
      );
    },
  }));
};
