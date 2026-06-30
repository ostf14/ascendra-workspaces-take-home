import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CenteredCard } from "@/components/layout/centered-card";

export default function NotFoundRoutePage() {
  return (
    <CenteredCard
      icon={<Compass className="size-4" strokeWidth={1.5} />}
      eyebrow="404"
      title="We couldn't find that page."
      description="The link may be old, or the workspace may have been deleted."
    >
      <Button asChild>
        <Link href="/">Take me home</Link>
      </Button>
    </CenteredCard>
  );
}
