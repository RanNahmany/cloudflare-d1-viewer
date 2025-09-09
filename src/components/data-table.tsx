"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  Save,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSaveChanges?: (changes: any) => Promise<void>;
  hasUnsavedChanges?: boolean;
  dirtyChanges?: {
    [rowId: string]: {
      [columnId: string]: { originalValue: any; newValue: any };
    };
  };
  onRevertEdit?: () => void;
  onTableSwitch?: () => void;
  onCancelTableSwitch?: () => void;
  showTableSwitchDialog?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSaveChanges,
  hasUnsavedChanges = false,
  dirtyChanges = {},
  onRevertEdit,
  onTableSwitch,
  onCancelTableSwitch,
  showTableSwitchDialog = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = React.useState(false);

  React.useEffect(() => {
    if (showTableSwitchDialog) {
      setShowSwitchDialog(true);
    }
  }, [showTableSwitchDialog]);
  const [isSaving, setIsSaving] = React.useState(false);

  // Format changes for display with enhanced structure
  const formatChangesList = () => {
    const changesList: Array<{
      rowNumber: number;
      columnId: string;
      originalValue: string;
      newValue: string;
    }> = [];

    Object.entries(dirtyChanges).forEach(([rowId, columnChanges]) => {
      const rowIndex = parseInt(rowId);
      const rowNumber = rowIndex + 1; // Display as 1-based row number

      Object.entries(columnChanges).forEach(([columnId, change]) => {
        const originalValue = change.originalValue?.toString() ?? "null";
        const newValue = change.newValue?.toString() ?? "null";
        changesList.push({
          rowNumber,
          columnId,
          originalValue,
          newValue,
        });
      });
    });

    return changesList;
  };

  const handleSaveChanges = async () => {
    if (!onSaveChanges) return;

    setIsSaving(true);
    try {
      await onSaveChanges({});
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmTableSwitch = () => {
    setShowSwitchDialog(false);
    if (onTableSwitch) {
      onTableSwitch();
    }
  };

  const cancelSwitch = () => {
    setShowSwitchDialog(false);
    if (onCancelTableSwitch) {
      onCancelTableSwitch();
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                onClick={onRevertEdit}
              >
                Cancel
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Save Changes Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    Are you sure you want to save all your changes? This will
                    update the database with your modifications.
                  </p>
                </div>
              </div>

              {Object.keys(dirtyChanges).length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">
                      Changes to be saved ({formatChangesList().length}{" "}
                      modification{formatChangesList().length !== 1 ? "s" : ""})
                    </h4>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {formatChangesList().map((change) => (
                      <div
                        key={`${change.rowNumber}-${change.columnId}`}
                        className="bg-white rounded-md p-3 border border-blue-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {change.rowNumber}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Row {change.rowNumber} • {change.columnId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-red-50 border border-red-200 rounded px-2 py-1">
                            <span className="text-red-700 font-mono text-xs">
                              {change.originalValue}
                            </span>
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                          <div className="flex-1 bg-green-50 border border-green-200 rounded px-2 py-1">
                            <span className="text-green-700 font-mono text-xs">
                              {change.newValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      💡 Tip: Review each change carefully before saving to the
                      database.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Table Switch Warning Dialog */}
      <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you switch tables now, your changes
              will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSwitch}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTableSwitch}
              className="bg-red-600 hover:bg-red-700"
            >
              I'm Sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
