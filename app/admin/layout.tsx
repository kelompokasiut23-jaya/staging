import type { Metadata } from "next"

import { RoleShell } from "@/components/role-shell"

export const metadata: Metadata = { title: "Admin" }

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleShell role="admin">{children}</RoleShell>
}
