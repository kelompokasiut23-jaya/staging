"use client"

import * as React from "react"
import Link from "next/link"
import {
  ClipboardListIcon,
  FactoryIcon,
  LayoutDashboardIcon,
  PackageIcon,
  Trash2Icon,
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
import { clearAllData, useOrders, useProducts } from "@/lib/store"

const NAV = [
  { title: "Dashboard", url: "/", icon: <LayoutDashboardIcon /> },
  { title: "Produk", url: "/produk", icon: <PackageIcon /> },
  { title: "Daftar Order", url: "/orders", icon: <ClipboardListIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const hasData = useProducts().length + useOrders().length > 0

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <FactoryIcon className="size-5!" />
              <span className="text-base font-semibold">
                Monitoring Produksi
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={NAV} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger
                disabled={!hasData}
                render={
                  <SidebarMenuButton
                    tooltip="Hapus semua data"
                    aria-disabled={!hasData}
                    className="data-disabled:pointer-events-none data-disabled:opacity-50"
                  />
                }
              >
                <Trash2Icon />
                <span>Hapus semua data</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hapus semua data?</DialogTitle>
                  <DialogDescription>
                    Semua produk dan order akan dihapus dari browser ini dan
                    tidak bisa dikembalikan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Batal
                  </DialogClose>
                  <DialogClose
                    render={
                      <Button
                        variant="destructive"
                        onClick={() => {
                          clearAllData()
                          toast.success("Semua data sudah dihapus")
                        }}
                      />
                    }
                  >
                    Ya, hapus semua
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {!hasData && (
              <p className="px-2 pt-1 text-xs text-muted-foreground">
                Aktif setelah ada data.
              </p>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
