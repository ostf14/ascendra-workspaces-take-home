"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchUsers } from "@/lib/api/users";

import { adminKeys } from "./keys";

export function useUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 5 * 60_000,
  });
}
