import type { ZodType } from "zod";

import { apiErrorSchema } from "@/lib/domain/schemas";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  signal?: AbortSignal;
};

const ACTING_USER_STORAGE_KEY = "ascendra-acting-user";
const ACTING_USER_HEADER = "x-acting-user";

// Reviewers can preview the engineer surface without rebuilding: in DevTools,
// localStorage.setItem("ascendra-acting-user", "user-sam") and reload. The
// mock backend reads this header and serves /api/me + own workspaces accordingly.
function injectActingUser(init: HeadersInit | undefined): HeadersInit | undefined {
  if (typeof window === "undefined") return init;
  let acting: string | null = null;
  try {
    acting = window.localStorage.getItem(ACTING_USER_STORAGE_KEY);
  } catch {
    // Storage may be disabled (e.g. cross-origin sandbox). Treat as default.
  }
  if (!acting) return init;
  const headers = new Headers(init ?? {});
  headers.set(ACTING_USER_HEADER, acting);
  return headers;
}

async function readErrorBody(response: Response): Promise<ApiError> {
  let payload: unknown = undefined;
  try {
    payload = await response.json();
  } catch {
    // Body was empty or non-JSON. Fall through to a generic message.
  }
  const parsed = apiErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new ApiError(response.status, parsed.data.message, parsed.data.code);
  }
  return new ApiError(response.status, `Request failed (${response.status})`);
}

async function parseResponse<T>(response: Response, schema: ZodType<T>): Promise<T> {
  if (!response.ok) throw await readErrorBody(response);
  const body = (await response.json()) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Mock drifted from the contract. Better to fail loudly than render garbage.
    // eslint-disable-next-line no-console
    console.error("Response failed validation", parsed.error);
    throw new ApiError(500, "Response validation failed");
  }
  return parsed.data;
}

export async function apiGet<T>(
  path: string,
  schema: ZodType<T>,
  options?: RequestOptions
): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: injectActingUser(undefined),
    signal: options?.signal,
  });
  return parseResponse(res, schema);
}

export async function apiPost<T>(
  path: string,
  schema: ZodType<T>,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const baseHeaders: HeadersInit | undefined =
    body !== undefined ? { "content-type": "application/json" } : undefined;
  const res = await fetch(path, {
    method: "POST",
    headers: injectActingUser(baseHeaders),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return parseResponse(res, schema);
}

export async function apiPatch<T>(
  path: string,
  schema: ZodType<T>,
  body: unknown,
  options?: RequestOptions
): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: injectActingUser({ "content-type": "application/json" }),
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  return parseResponse(res, schema);
}

export async function apiDelete(path: string, options?: RequestOptions): Promise<void> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: injectActingUser(undefined),
    signal: options?.signal,
  });
  if (!res.ok) throw await readErrorBody(res);
}
