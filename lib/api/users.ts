import { z } from "zod";

import { userSchema } from "@/lib/domain/schemas";
import type { User } from "@/lib/domain/types";

import { apiGet } from "./client";

const usersListSchema = z.array(userSchema);

export function fetchCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiGet("/api/me", userSchema, { signal });
}

export function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  return apiGet("/api/admin/users", usersListSchema, { signal });
}
