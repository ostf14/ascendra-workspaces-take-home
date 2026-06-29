import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function ForbiddenPage() {
  return (
    <RoutePlaceholder
      path="/403"
      hint="Returned when an engineer hits any /admin/* route. Real gating arrives in phase 3."
    />
  );
}
