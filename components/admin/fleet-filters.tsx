"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TemplateWithUsage,
  User,
  VMStatus,
} from "@/lib/domain/types";

const STATUS_OPTIONS: VMStatus[] = [
  "running",
  "stopped",
  "starting",
  "stopping",
  "error",
];

const STATUS_LABEL: Record<VMStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  starting: "Starting",
  stopping: "Stopping",
  error: "Error",
};

const ANY = "__any__";

export type FleetFiltersValue = {
  search: string;
  status: VMStatus | "";
  templateId: string;
  ownerId: string;
  idleOnly: boolean;
};

export function FleetFilters({
  value,
  onChange,
  onReset,
  templates,
  users,
}: {
  value: FleetFiltersValue;
  onChange: (next: FleetFiltersValue) => void;
  onReset: () => void;
  templates: TemplateWithUsage[] | undefined;
  users: User[] | undefined;
}) {
  const [search, setSearch] = useState(value.search);

  // Debounce search to avoid one query per keystroke.
  useEffect(() => {
    if (search === value.search) return;
    const id = window.setTimeout(() => {
      onChange({ ...value, search });
    }, 220);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setSearch(value.search);
  }, [value.search]);

  const hasFilters =
    Boolean(value.search) ||
    Boolean(value.status) ||
    Boolean(value.templateId) ||
    Boolean(value.ownerId) ||
    value.idleOnly;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border-default bg-surface-elevated px-3 py-2.5">
      <div className="relative flex min-w-[200px] flex-1 items-center">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 size-4 text-text-tertiary"
          strokeWidth={1.5}
        />
        <Input
          aria-label="Search workspaces"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, owner, template…"
          className="h-9 pl-8"
        />
      </div>
      <FilterSelect
        ariaLabel="Status"
        placeholder="Any status"
        value={value.status}
        onChange={(next) =>
          onChange({ ...value, status: (next as VMStatus) || "" })
        }
        options={STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
      />
      <FilterSelect
        ariaLabel="Template"
        placeholder="Any template"
        value={value.templateId}
        onChange={(next) => onChange({ ...value, templateId: next })}
        options={(templates ?? []).map((t) => ({ value: t.id, label: t.name }))}
      />
      <FilterSelect
        ariaLabel="Owner"
        placeholder="Any owner"
        value={value.ownerId}
        onChange={(next) => onChange({ ...value, ownerId: next })}
        options={(users ?? []).map((u) => ({ value: u.id, label: u.name }))}
      />
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border-default px-3 text-sm">
        <input
          type="checkbox"
          checked={value.idleOnly}
          onChange={(e) => onChange({ ...value, idleOnly: e.target.checked })}
          className="size-3.5 accent-accent-coral"
        />
        Idle only
      </label>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}

function FilterSelect({
  ariaLabel,
  placeholder,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select
      value={value || ANY}
      onValueChange={(next) => onChange(next === ANY ? "" : next)}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel} className="min-w-[140px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
