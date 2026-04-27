"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export function UserMenu({
  email,
  fullName,
}: {
  email: string;
  fullName?: string | null;
}) {
  const initial = (fullName ?? email).slice(0, 1).toUpperCase();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="User menu"
          className="bg-bg-soft text-ink hover:bg-card hover:border-accent/30 border-line inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
        >
          {initial}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="bg-card border-line z-50 min-w-56 rounded-md border p-1 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-ink text-sm font-medium">{fullName || email}</p>
            {fullName && <p className="text-muted text-xs">{email}</p>}
          </div>
          <DropdownMenu.Separator className="bg-line my-1 h-px" />
          <DropdownMenu.Item asChild>
            <Link
              href="/settings/profile"
              className="text-ink hover:bg-bg-soft focus:bg-bg-soft flex items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors"
            >
              <User size={14} /> Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="bg-line my-1 h-px" />
          <form action={signOut}>
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="text-ink hover:bg-bg-soft focus:bg-bg-soft flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
