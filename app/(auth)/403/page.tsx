import Link from "next/link";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CenteredCard } from "@/components/layout/centered-card";

// Returned when an engineer hits any /admin/* route. The route shouldn't appear
// to exist for them, so the copy intentionally avoids saying "admin".
export default function ForbiddenPage() {
  return (
    <CenteredCard
      icon={<ShieldOff className="size-4" strokeWidth={1.5} />}
      eyebrow="403"
      title="You don't have access to this page."
      description="If you think that's wrong, ask an admin on your team to grant access."
    >
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/workspaces">Back to workspaces</Link>
        </Button>
      </div>
    </CenteredCard>
  );
}
