import { redirect } from "next/navigation";

// Role-gated redirect — admin lands on /admin, engineer on /workspaces.
// Phase 1 hardcodes the acting role to "admin"; phase 3 reads /api/me.
const ACTING_ROLE: "admin" | "engineer" = "admin";

export default function RootPage() {
  redirect(ACTING_ROLE === "admin" ? "/admin" : "/workspaces");
}
