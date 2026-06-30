import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CenteredCard } from "@/components/layout/centered-card";

// Sign-in is out of scope for the exercise — the mock seeds an acting user so
// both surfaces are demonstrable on first load. This screen documents the
// future flow without claiming functionality the API doesn't have.
export default function LoginPage() {
  return (
    <CenteredCard
      icon={<KeyRound className="size-4" strokeWidth={1.5} />}
      eyebrow="Sign in"
      title="Use your work account to continue."
      description="SSO and email-link sign-in arrive with the account surface. For this exercise the acting user is seeded — open the app to land on your home."
    >
      <Button asChild>
        <Link href="/">Continue to Ascendra</Link>
      </Button>
    </CenteredCard>
  );
}
