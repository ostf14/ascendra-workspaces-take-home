"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentUser } from "@/lib/api/users";

import { currentUserKeys } from "./keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKeys.all,
    queryFn: ({ signal }) => fetchCurrentUser(signal),
    staleTime: 5 * 60_000,
  });
}
