import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function NotFound() {
  return (
    <RoutePlaceholder
      path="not-found"
      hint="The page you tried to reach doesn't exist."
    />
  );
}
