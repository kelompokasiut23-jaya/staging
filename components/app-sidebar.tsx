"use client"

import * as React from "react"
import Link from "next/link"
import {
  ClipboardCheckIcon,
  ListChecksIcon,
  PackagePlusIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { NavMain, type NavItem } from "@/components/nav-main"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { resetSampleData, useCurrentUser } from "@/lib/qc-store"

// Menu yang boleh diakses setiap role.
const NAV: Record<Role, NavItem[]> = {
  qc: [
    {
      title: "Tugas Saya",
      url: "/qc/",
      icon: <ClipboardCheckIcon />,
      also: ["/qc/tugas"],
    },
  ],
  admin: [
    {
      title: "Daftar Barang",
      url: "/admin/",
      icon: <ListChecksIcon />,
      also: ["/admin/tugas"],
    },
    {
      title: "Tambah Barang",
      url: "/admin/tugas/baru/",
      icon: <PackagePlusIcon />,
    },
    { title: "Pengguna QC", url: "/admin/qc/", icon: <UsersIcon /> },
  ],
}

const HOME: Record<Role, string> = { qc: "/qc/", admin: "/admin/" }

export function AppSidebar({
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & { role: Role }) {
  const user = useCurrentUser(role)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={HOME[role]} />}
            >
              <ShieldCheckIcon className="size-5!" />
              <span className="text-base font-semibold">
                Monitoring QC
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {ROLE_LABEL[role]}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={NAV[role]} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger
                render={<SidebarMenuButton tooltip="Muat ulang data contoh" />}
              >
                <RotateCcwIcon />
                <span>Muat ulang data contoh</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Muat ulang data contoh?</DialogTitle>
                  <DialogDescription>
                    Semua barang, akun QC, dan angka yang sudah diisi akan
                    kembali seperti semula. Ini hanya untuk mencoba tampilan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Batal
                  </DialogClose>
                  <DialogClose
                    render={
                      <Button
                        onClick={() => {
                          resetSampleData()
                          toast.success("Data contoh dimuat ulang")
                        }}
                      />
                    }
                  >
                    Ya, muat ulang
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
          {user && (
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
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
