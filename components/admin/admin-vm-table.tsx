"use client";

import { useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/workspace/status-badge";
import type {
  FleetInventoryItem,
  FleetSortKey,
  SortOrder,
} from "@/lib/domain/types";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Column = {
  key: FleetSortKey;
  label: string;
  align?: "left" | "right";
};

const COLUMNS: Column[] = [
  { key: "name", label: "Name" },
  { key: "owner", label: "Owner" },
  { key: "template", label: "Template" },
  { key: "status", label: "Status" },
  { key: "cpu", label: "CPU", align: "right" },
  { key: "memory", label: "RAM", align: "right" },
  { key: "disk", label: "Disk", align: "right" },
  { key: "lastActiveAt", label: "Last active", align: "right" },
];

function compareValues(
  a: FleetInventoryItem,
  b: FleetInventoryItem,
  key: FleetSortKey
): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "owner":
      return a.ownerName.localeCompare(b.ownerName);
    case "template":
      return a.templateName.localeCompare(b.templateName);
    case "status":
      return a.status.localeCompare(b.status);
    case "cpu":
      return a.cpu - b.cpu;
    case "memory":
      return a.memory - b.memory;
    case "disk":
      return a.disk - b.disk;
    case "lastActiveAt":
      return (
        new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime()
      );
    case "hourlyCost":
      return a.hourlyCost - b.hourlyCost;
    default:
      return 0;
  }
}

export function AdminVMTable({
  rows,
  selected,
  onToggleRow,
  onToggleAll,
  sort,
  order,
  onSortChange,
  onAction,
  activeId,
  onSelectRow,
}: {
  rows: FleetInventoryItem[];
  selected: Set<string>;
  onToggleRow: (id: string, next: boolean) => void;
  onToggleAll: (next: boolean) => void;
  sort: FleetSortKey;
  order: SortOrder;
  onSortChange: (key: FleetSortKey) => void;
  onAction: (action: "start" | "stop" | "restart" | "delete", id: string) => void;
  activeId?: string;
  onSelectRow?: (id: string) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id)) && !allSelected;

  const sorted = useMemo(() => {
    const cmp = (a: FleetInventoryItem, b: FleetInventoryItem) =>
      compareValues(a, b, sort) * (order === "asc" ? 1 : -1);
    return [...rows].sort(cmp);
  }, [rows, sort, order]);

  return (
    <div className="rounded-lg border border-border-default bg-surface-elevated">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[36px]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[13%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[13%]" />
            <col className="w-[44px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border-default text-[13px] font-medium text-text-tertiary">
              <th className="px-3 py-2 text-left">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(next) => onToggleAll(Boolean(next))}
                  aria-label="Select all rows"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2 whitespace-nowrap",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                  scope="col"
                >
                  <button
                    type="button"
                    onClick={() => onSortChange(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-text-primary",
                      sort === col.key && "text-text-primary"
                    )}
                  >
                    {col.label}
                    <SortIcon
                      active={sort === col.key}
                      order={order}
                    />
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const checked = selected.has(row.id);
              const active = activeId === row.id;
              return (
                <tr
                  key={row.id}
                  data-selected={checked || undefined}
                  data-active={active || undefined}
                  onClick={() => onSelectRow?.(row.id)}
                  className={cn(
                    "h-9 cursor-pointer border-b border-border-subtle text-[13px] leading-none text-text-primary transition-colors",
                    "hover:bg-surface-secondary",
                    checked && !active && "bg-accent-coral/5",
                    active &&
                      "bg-[color:color-mix(in_oklab,var(--accent)_5%,transparent)]"
                  )}
                  style={
                    active
                      ? { boxShadow: "inset 2px 0 0 var(--accent)" }
                      : undefined
                  }
                >
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => onToggleRow(row.id, Boolean(next))}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-mono">
                    <span className="block truncate">{row.name}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-baseline gap-1.5 leading-none">
                      <span className="truncate">{row.ownerName}</span>
                      <span className="truncate text-xs text-text-tertiary">
                        {row.ownerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{row.templateName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatPercent(row.cpu)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatPercent(row.memory)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatPercent(row.disk)}
                  </td>
                  <td className="px-3 py-2 text-right text-text-secondary">
                    {formatDistanceToNow(parseISO(row.lastActiveAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td
                    className="px-3 py-2 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label={`Actions for ${row.name}`}
                        >
                          <MoreHorizontal className="size-4" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {row.status === "running" ? (
                          <>
                            <DropdownMenuItem onClick={() => onAction("stop", row.id)}>
                              Stop
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onAction("restart", row.id)}
                            >
                              Restart
                            </DropdownMenuItem>
                          </>
                        ) : null}
                        {row.status === "stopped" || row.status === "error" ? (
                          <DropdownMenuItem onClick={() => onAction("start", row.id)}>
                            Start
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-status-error focus:bg-status-error/10 focus:text-status-error data-[highlighted]:bg-status-error/10 data-[highlighted]:text-status-error"
                          onClick={() => onAction("delete", row.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="size-3" strokeWidth={1.5} />;
  return order === "asc" ? (
    <ArrowUp className="size-3" strokeWidth={1.5} />
  ) : (
    <ArrowDown className="size-3" strokeWidth={1.5} />
  );
}
