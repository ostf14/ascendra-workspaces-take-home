import type { ReactNode } from "react";

import { AdminSubNav } from "@/components/admin/admin-sub-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminSubNav />
      {children}
    </>
  );
}
