"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ArrowDownAZ, ArrowUpAZ, Loader2 } from "lucide-react";

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
}) => {
  const [sortState, setSortState] = useState({ id: null, direction: "asc" });
  const [searchTerms, setSearchTerms] = useState({});
  const [internalPage, setInternalPage] = useState(1);

  const searchableColumns = enableColumnSearch ? columns.filter((col) => col.searchable) : [];
  const hasRowActions = typeof rowActions === "function";

  const getValue = (row, column) => {
    if (typeof column.accessor === "function") return column.accessor(row);
    if (column.accessor) return row[column.accessor];
    return row[column.id];
  };

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Column-level filtering
    result = result.filter((row) => {
      return searchableColumns.every((col) => {
        const term = (searchTerms[col.id] || "").toString().toLowerCase().trim();
        if (!term) return true;
        const val = getValue(row, col);
        const text = (val ?? "").toString().toLowerCase();
        return text.includes(term);
      });
    });

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
      <Pagination className={cn(dir === "rtl" ? "flex-row-reverse" : "")}>
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

  return (
    <div className="space-y-3">
      {enableColumnSearch && searchableColumns.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {searchableColumns.map((col) => (
            <Input
              key={col.id}
              placeholder={col.searchPlaceholder || col.header}
              value={searchTerms[col.id] || ""}
              onChange={(e) => setSearchTerms((prev) => ({ ...prev, [col.id]: e.target.value }))}
            />
          ))}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={dir}>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(column.headerClassName)}
                    onClick={() => handleSort(column)}
                    role={column.sortable ? "button" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {renderSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
                {hasRowActions && <TableHead className="text-center">{actionsLabel}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasRowActions ? 1 : 0)} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{loadingMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasRowActions ? 1 : 0)} className="text-center py-10">
                    <span className="text-muted-foreground">{emptyMessage}</span>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow key={row[rowKey] ?? row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.id} className={cn(column.cellClassName)}>
                        {column.cell ? column.cell(row) : getValue(row, column)}
                      </TableCell>
                    ))}
                    {hasRowActions && (
                      <TableCell className="text-center">
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
