"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface ColumnDef<T> {
  id: string;
  header: ReactNode;
  /** Cell renderer or path string (e.g. "user.full_name"). */
  cell: (row: T) => ReactNode;
  /** Optional value extractor for sorting + searching. */
  accessor?: (row: T) => string | number | null | undefined;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: readonly T[];
  /** Stable row identifier; defaults to JSON.stringify(row). */
  rowKey?: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  bulkActions?: (selected: T[]) => ReactNode;
  initialSortId?: string;
  /** Optional per-row className for highlighting. */
  rowClassName?: (row: T) => string | undefined;
  /** Optional mobile (<md) per-row card renderer. When set, the table is hidden under md and replaced with a card list. */
  mobileCard?: (row: T) => ReactNode;
}

/** Generic filterable, sortable, optionally bulk-selectable table.
 *  Replaces ~10 inline tables across the legacy admin pages. */
export function DataTable<T>({
  columns,
  rows,
  rowKey = (r) => JSON.stringify(r),
  searchPlaceholder = "Search…",
  emptyMessage = "Nothing here yet.",
  bulkActions,
  initialSortId,
  rowClassName,
  mobileCard,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(
    initialSortId ? { id: initialSortId, dir: "asc" } : null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      columns.some((c) => {
        const v = c.accessor?.(r);
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.accessor) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [filtered, columns, sort]);

  const allSelected = bulkActions && sorted.length > 0 && sorted.every((r) => selected.has(rowKey(r)));
  const selectedRows = sorted.filter((r) => selected.has(rowKey(r)));

  const tableWrapperClass = mobileCard
    ? "border-line hidden overflow-hidden rounded-lg border md:block"
    : "border-line overflow-hidden rounded-lg border";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {bulkActions && selectedRows.length > 0 && (
          <div className="text-muted flex items-center gap-2 text-sm">
            <span>{selectedRows.length} selected</span>
            {bulkActions(selectedRows)}
          </div>
        )}
      </div>
      <div className={tableWrapperClass}>
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-muted text-xs uppercase">
            <tr>
              {bulkActions && (
                <th className="w-8 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(sorted.map(rowKey)));
                      else setSelected(new Set());
                    }}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((c) => {
                const sortable = !!c.accessor;
                const sortDir = sort?.id === c.id ? sort.dir : null;
                return (
                  <th
                    key={c.id}
                    style={{ width: c.width }}
                    className={cn("px-3 py-3 text-left font-medium", c.className)}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort((prev) =>
                            prev?.id === c.id
                              ? { id: c.id, dir: prev.dir === "asc" ? "desc" : "asc" }
                              : { id: c.id, dir: "asc" },
                          )
                        }
                        className="hover:text-ink inline-flex items-center gap-1"
                      >
                        {c.header}
                        <span aria-hidden>{sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "↕"}</span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="text-muted px-3 py-12 text-center text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const k = rowKey(row);
                const isSelected = selected.has(k);
                return (
                  <tr
                    key={k}
                    className={cn(
                      "border-line border-t",
                      isSelected ? "bg-bg-soft" : "hover:bg-bg-soft/40",
                      rowClassName?.(row),
                    )}
                  >
                    {bulkActions && (
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(k);
                            else next.delete(k);
                            setSelected(next);
                          }}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.id} className={cn("px-3 py-2.5", c.className)}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {mobileCard && (
        <div className="space-y-2 md:hidden">
          {sorted.length === 0 ? (
            <div className="border-line bg-card text-muted rounded-lg border p-4 text-center text-sm">
              {emptyMessage}
            </div>
          ) : (
            sorted.map((row) => {
              const k = rowKey(row);
              const isSelected = selected.has(k);
              return (
                <div
                  key={k}
                  className={cn(
                    "border-line bg-card flex items-start gap-3 rounded-lg border p-3",
                    isSelected && "ring-accent/40 ring-2",
                    rowClassName?.(row),
                  )}
                >
                  {bulkActions && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(k);
                        else next.delete(k);
                        setSelected(next);
                      }}
                      aria-label="Select row"
                      className="mt-1"
                    />
                  )}
                  <div className="min-w-0 flex-1">{mobileCard(row)}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
