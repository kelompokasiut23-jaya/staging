"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  /** Halaman lain yang juga menandai menu ini aktif. */
  also?: string[]
}

const clean = (path: string) => path.replace(/\/+$/, "") || "/"

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = clean(usePathname())
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={[item.url, ...(item.also ?? [])]
                  .map(clean)
                  .includes(pathname)}
                render={
                  <Link href={item.url} onClick={() => setOpenMobile(false)} />
                }
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
