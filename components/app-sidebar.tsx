"use client"

import * as React from "react"
import Link from "next/link"
import {
  ClipboardCheckIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { NavMain } from "@/components/nav-main"
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
import { CURRENT_USER } from "@/lib/qc"
import { resetSampleData } from "@/lib/qc-store"

// Menu yang boleh diakses oleh role QC.
const QC_NAV = [{ title: "Tugas Saya", url: "/", icon: <ClipboardCheckIcon /> }]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = CURRENT_USER

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <ShieldCheckIcon className="size-5!" />
              <span className="text-base font-semibold">Monitoring QC</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={QC_NAV} />
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
                    Semua angka yang sudah Anda isi akan hilang dan tugas
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
          <SidebarMenuItem>
            <div className="flex items-center gap-2 rounded-md p-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  QC · {user.line}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
