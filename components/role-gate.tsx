"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_LABEL, type Role, type User } from "@/lib/qc"
import { useAuth } from "@/lib/qc-store"

export function homeOf(role: Role) {
  return role === "qc" ? "/qc/" : "/admin/"
}

function Loading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

/** Menampilkan isi halaman hanya untuk role yang diizinkan. */
export function RoleGate({
  roles,
  children,
}: {
  roles: Role[]
  children: (user: User) => React.ReactNode
}) {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.status === "signedOut") router.replace("/")
  }, [auth.status, router])

  if (auth.status !== "signedIn") return <Loading />

  const { user } = auth
  if (!roles.includes(user.role)) {
    return (
      <div>
        <EmptyState
          icon={LockIcon}
          title="Anda tidak punya akses ke halaman ini"
          description={`Anda masuk sebagai ${user.name} (${ROLE_LABEL[user.role]}). Halaman ini khusus ${roles.map((r) => ROLE_LABEL[r]).join(" dan ")}.`}
        >
          <Button render={<Link href={homeOf(user.role)} />}>
            Buka halaman saya
          </Button>
        </EmptyState>
      </div>
    )
  }

  return <>{children(user)}</>
}
