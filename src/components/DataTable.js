"use client";

import { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ArrowDownAZ, ArrowUpAZ, Loader2, FolderOpen } from "lucide-react";

const DataTable = ({
  data = [],
  columns = [],
  rowKey = "id",
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
  isLoading = false,
  pagination,
  rowActions,
  dir = "ltr",
  pageSize = null,
  actionsLabel = "Actions",
  enableColumnSearch = false,
  error = null,
  stickyHeader = false,
  zebra = false,
  density = "normal", // "normal" | "compact"
}) => {
  const [sortState, setSortState] = useState({ id: null, direction: "asc" });
  const [searchTerms, setSearchTerms] = useState({});
  const [searchInputValues, setSearchInputValues] = useState({}); // Local state for immediate feedback
  const [internalPage, setInternalPage] = useState(1);

  // Debounce search input updates to prevent massive table re-renders on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerms(searchInputValues);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInputValues]);

  const searchableColumns = useMemo(() => 
    enableColumnSearch ? columns.filter((col) => col.searchable) : [],
    [enableColumnSearch, columns]
  );
  
  const hasRowActions = typeof rowActions === "function";

  const getValue = (row, column) => {
    if (typeof column.accessor === "function") return column.accessor(row);
    if (column.accessor) return row[column.accessor];
    return row[column.id];
  };

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Column-level filtering
    if (searchableColumns.length > 0) {
      result = result.filter((row) => {
        return searchableColumns.every((col) => {
          const term = (searchTerms[col.id] || "").toString().toLowerCase().trim();
          if (!term) return true;
          const val = getValue(row, col);
          const text = (val ?? "").toString().toLowerCase();
          return text.includes(term);
        });
      });
    }

    // Sorting
    if (sortState.id) {
      const col = columns.find((c) => c.id === sortState.id);
      if (col) {
        result.sort((a, b) => {
          const aVal = getValue(a, col);
          const bVal = getValue(b, col);

          if (aVal === undefined || aVal === null) return 1;
          if (bVal === undefined || bVal === null) return -1;

          if (aVal < bVal) return sortState.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortState.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, searchableColumns, searchTerms, sortState, columns]);

  const effectivePageSize = pageSize || filteredData.length;
  const totalPagesInternal = Math.max(1, Math.ceil(filteredData.length / effectivePageSize));
  const currentPage = pagination?.page || internalPage;
  const totalPages = pagination?.totalPages || (pageSize ? totalPagesInternal : 1);

  const paginatedData = useMemo(() => {
    if (pagination) return filteredData;
    if (!pageSize) return filteredData;
    const start = (internalPage - 1) * effectivePageSize;
    return filteredData.slice(start, start + effectivePageSize);
  }, [filteredData, pagination, pageSize, internalPage, effectivePageSize]);

  const handleSort = (column) => {
    if (!column.sortable) return;
    setSortState((prev) => {
      if (prev.id === column.id) {
        return { id: column.id, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { id: column.id, direction: "asc" };
    });
  };

  const renderSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortState.id !== column.id) return <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />;
    return sortState.direction === "asc" ? (
      <ArrowUpAZ className="h-3.5 w-3.5 text-muted-foreground" />
    ) : (
      <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    const maxButtons = 5;
    const showEllipsis = totalPages > maxButtons;
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <PaginationItem key={i}>
          <Button
            variant={i === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-[36px]"
            onClick={() => {
              if (pagination?.onPageChange) {
                pagination.onPageChange(i);
              } else {
                setInternalPage(i);
              }
            }}
          >
            {i}
          </Button>
        </PaginationItem>
      );
    }

    return (
      <Pagination className={cn("")}>
        <PaginationContent className="flex items-center gap-1">
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => {
                if (pagination?.onPrevious) {
                  pagination.onPrevious();
                } else if (pagination?.onPageChange) {
                  pagination.onPageChange(Math.max(1, currentPage - 1));
                } else {
                  setInternalPage((p) => Math.max(1, p - 1));
                }
              }}
            />
          </PaginationItem>

          {showEllipsis && startPage > 1 && <PaginationEllipsis />}

          {pageButtons}

          {showEllipsis && endPage < totalPages && <PaginationEllipsis />}

          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={() => {
                if (pagination?.onNext) {
                  pagination.onNext();
                } else if (pagination?.onPageChange) {
                  pagination.onPageChange(Math.min(totalPages, currentPage + 1));
                } else {
                  setInternalPage((p) => Math.min(totalPagesInternal, p + 1));
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  const rowPadding = density === "compact" ? "py-2 px-3" : "py-3 px-4";

  return (
    <div className="space-y-3" aria-busy={isLoading}>
      {enableColumnSearch && searchableColumns.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {searchableColumns.map((col) => (
              <Input
                key={col.id}
                placeholder={col.searchPlaceholder || col.header}
                value={searchInputValues[col.id] || ""}
                onChange={(e) => setSearchInputValues((prev) => ({ ...prev, [col.id]: e.target.value }))}
              />
            ))}
        </div>
      )}

      <div className={cn("border rounded-lg", stickyHeader ? "overflow-clip" : "overflow-hidden")}>
        <div className={cn(!stickyHeader && "overflow-x-auto")}>
          <Table dir={dir} wrapperClassName={stickyHeader ? "overflow-visible" : ""}>
            <TableHeader className={stickyHeader ? "sticky top-0 z-30 bg-background shadow-sm ring-1 ring-border/50" : undefined}>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      column.headerClassName,
                      density === "compact" ? "py-2 px-3" : undefined,
                      stickyHeader ? "bg-background" : undefined
                    )}
                    onClick={() => handleSort(column)}
                    role={column.sortable ? "button" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {renderSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
                {hasRowActions && (
                  <TableHead className={cn(
                    "text-center", 
                    density === "compact" ? "py-2 px-3" : undefined, 
                    "w-[120px]", 
                    stickyHeader ? "bg-background" : undefined
                  )}>
                    {actionsLabel}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(5, Math.max(3, pageSize || columns.length || 3)) }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    {columns.map((column, colIdx) => (
                      <TableCell key={`sk-${colIdx}`} className={cn(column.cellClassName, rowPadding)}>
                        <Skeleton className="h-4 w-full max-w-[180px]" />
                      </TableCell>
                    ))}
                    {hasRowActions && (
                      <TableCell className={cn("text-center", rowPadding, "w-[120px]")}>
                        <div className="flex justify-center">
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (hasRowActions ? 1 : 0)} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in duration-300">
                      <div className="rounded-full bg-muted/50 p-4 ring-1 ring-border/50 shadow-inner">
                        <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-foreground/80">{emptyMessage}</p>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                          {dir === "rtl" 
                            ? "لم نجد أي نتائج تطابق بحثك حالياً." 
                            : "We couldn't find any results matching your search at the moment."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow
                    key={row[rowKey] ?? row.id}
                    className={cn(
                      density === "compact" ? "text-sm" : undefined,
                      zebra && idx % 2 === 1 ? "bg-muted/30" : undefined,
                      "animate-in fade-in-50"
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id} className={cn(column.cellClassName, rowPadding)}>
                        {column.cell ? column.cell(row) : getValue(row, column)}
                      </TableCell>
                    ))}
                    {hasRowActions && (
                      <TableCell className={cn("text-center", rowPadding, "w-[120px]")}>
                        {rowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {renderPagination()}
    </div>
  );
};

export default DataTable;
