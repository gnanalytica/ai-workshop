"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export interface FilterBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onExport?: () => void;
}

/** Search + status select + export button used across admin tables. */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  onExport,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {onSearchChange !== undefined && (
        <Input
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
      )}
      {children}
      <div className="flex-1" />
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          Export CSV
        </Button>
      )}
    </div>
  );
}
