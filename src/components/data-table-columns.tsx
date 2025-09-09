"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { EditableCell } from "@/components/editable-cell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the type for our table data
export type TableData = {
  [key: string]: any;
};

// Define the type for editing state
export type EditingState = {
  [rowId: string]: {
    [columnId: string]: boolean;
  };
};

// Define the type for dirty changes
export type DirtyChanges = {
  [rowId: string]: {
    [columnId: string]: {
      originalValue: any;
      newValue: any;
    };
  };
};

// Helper function to determine column size based on column name
const getColumnSize = (header: string): number => {
  const lowerHeader = header.toLowerCase();

  // ID columns are usually smaller
  if (lowerHeader.includes("id") || lowerHeader === "id") {
    return 80;
  }

  // Common small columns
  if (
    lowerHeader.includes("age") ||
    lowerHeader.includes("count") ||
    lowerHeader.includes("status")
  ) {
    return 90;
  }

  // Email columns are medium
  if (lowerHeader.includes("email")) {
    return 150;
  }

  // Name columns are medium
  if (lowerHeader.includes("name") || lowerHeader.includes("title")) {
    return 120;
  }

  // Date columns
  if (
    lowerHeader.includes("date") ||
    lowerHeader.includes("time") ||
    lowerHeader.includes("created") ||
    lowerHeader.includes("updated")
  ) {
    return 110;
  }

  // Default size for other columns
  return 100;
};

// Create dynamic columns based on the data structure
export const createColumns = (
  headers: string[],
  editingState: EditingState,
  dirtyChanges: DirtyChanges,
  onStartEdit: (rowId: string, columnId: string) => void,
  onSaveEdit: (rowId: string, columnId: string, newValue: any) => void,
  onCancelEdit: (rowId: string, columnId: string) => void,
): ColumnDef<TableData>[] => {
  return headers.map((header) => ({
    accessorKey: header,
    size: getColumnSize(header),
    minSize: 80,
    maxSize: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-6 px-1 text-xs"
        >
          {header}
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(header);
      const rowId = row.id;
      const columnId = header;
      const isEditing = editingState[rowId]?.[columnId] || false;
      const isDirty = dirtyChanges[rowId]?.[columnId] !== undefined;

      return (
        <EditableCell
          value={value}
          onSave={(newValue) => onSaveEdit(rowId, columnId, newValue)}
          onCancel={() => onCancelEdit(rowId, columnId)}
          onStartEdit={() => onStartEdit(rowId, columnId)}
          isEditing={isEditing}
          className={cn(
            isDirty && "bg-yellow-50 border border-yellow-200",
            isEditing && "bg-blue-50 border border-blue-200",
          )}
        />
      );
    },
  }));
};
