import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function NotFoundRoutePage() {
  return (
    <RoutePlaceholder
      path="/404"
      hint="Unknown route. Real not-found UI ships in phase 7."
    />
  );
}
