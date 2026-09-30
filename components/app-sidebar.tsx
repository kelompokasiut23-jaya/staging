"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardListIcon,
  FactoryIcon,
  LayoutDashboardIcon,
  PackageIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { clearAllData, useOrders, useProducts } from "@/lib/store"

const NAV = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Produk", href: "/produk", icon: PackageIcon },
  { title: "Daftar Order", href: "/orders", icon: ClipboardListIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const hasData = useProducts().length + useOrders().length > 0

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" onClick={() => setOpenMobile(false)} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FactoryIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  Monitoring Produksi
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Catat dan pantau produksi
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    render={
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
              <p className="px-2 pt-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                Aktif setelah ada data.
              </p>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
