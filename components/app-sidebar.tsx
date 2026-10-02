"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ClipboardCheckIcon,
  KeyRoundIcon,
  LayoutListIcon,
  ListChecksIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { NavMain, type NavItem } from "@/components/nav-main"
import { homeOf } from "@/components/role-gate"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROLE_LABEL, type Role } from "@/lib/qc"
import { changePassword, signOut, useAuth } from "@/lib/qc-store"

const ITEMS = {
  items: {
    title: "Daftar Barang",
    url: "/admin/",
    icon: <ListChecksIcon />,
    also: ["/admin/tugas", "/admin/tugas/baru"],
  },
  lines: { title: "Line", url: "/admin/line/", icon: <LayoutListIcon /> },
  users: { title: "Pengguna", url: "/admin/pengguna/", icon: <UsersIcon /> },
  myTasks: {
    title: "Tugas Saya",
    url: "/qc/",
    icon: <ClipboardCheckIcon />,
    also: ["/qc/tugas"],
  },
} satisfies Record<string, NavItem>

// Menu yang boleh diakses setiap role.
const NAV: Record<Role, NavItem[]> = {
  super_admin: [ITEMS.lines, ITEMS.items, ITEMS.users],
  admin: [ITEMS.items],
  qc: [ITEMS.myTasks],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth()
  const user = auth.status === "signedIn" ? auth.user : null
  const [passwordOpen, setPasswordOpen] = useState(false)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={user ? homeOf(user.role) : "/"} />}
            >
              <ShieldCheckIcon className="size-5!" />
              <span className="text-base font-semibold">Monitoring QC</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {user && <NavMain items={NAV[user.role]} />}
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 rounded-md p-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                  {user.name.charAt(0)}
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABEL[user.role]}
                    {user.line ? ` · ${user.line}` : ""}
                  </span>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setPasswordOpen(true)}>
                <KeyRoundIcon />
                <span>Ganti password</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => void signOut()}>
                <LogOutIcon />
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </Sidebar>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next) {
      setPassword("")
      setConfirm("")
      setError("")
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 6) return setError("Password minimal 6 karakter")
    if (password !== confirm) return setError("Kedua password tidak sama")
    setBusy(true)
    const message = await changePassword(password)
    setBusy(false)
    if (message) return setError(message)
    onOpenChange(false)
    toast.success("Password berhasil diganti")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ganti password</DialogTitle>
          <DialogDescription>
            Password baru berlaku saat Anda masuk berikutnya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="new-password">Password baru</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirm-password">Ulangi password baru</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={busy}>
              Simpan password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
