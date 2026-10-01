import type { Metadata } from "next"

import { RoleShell } from "@/components/role-shell"

export const metadata: Metadata = { title: "QC" }

export default function QcLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>
}
