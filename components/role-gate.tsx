"use client"

import { LockIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_LABEL, type Role, type User } from "@/lib/qc"
import { useCurrentUser } from "@/lib/qc-store"

/** Menampilkan isi halaman hanya untuk role yang diizinkan. */
export function RoleGate({
  role,
  children,
}: {
  role: Role
  children: (user: User) => React.ReactNode
}) {
  const user = useCurrentUser(role)

  if (user === undefined) {
    return (
      <div className="grid gap-4 px-4 py-4 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="px-4 py-4 md:py-6 lg:px-6">
        <EmptyState
          icon={LockIcon}
          title="Akun tidak bisa dipakai"
          description={`Akun ${ROLE_LABEL[role]} untuk halaman ini tidak ditemukan atau sudah dinonaktifkan. Hubungi admin.`}
        />
      </div>
    )
  }

  return <>{children(user)}</>
}

export function homeOf(user: User) {
  return user.role === "admin" ? "/admin/" : "/qc/"
}
