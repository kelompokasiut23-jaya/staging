"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const TITLES: Record<string, string> = {
  "/qc": "Tugas Saya",
  "/qc/tugas": "Detail Tugas",
  "/admin": "Daftar Barang",
  "/admin/tugas": "Laporan QC",
  "/admin/tugas/baru": "Tambah Barang",
  "/admin/pengguna": "Pengguna",
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-card transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 sm:px-6 lg:gap-2 lg:px-10">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">
          {TITLES[pathname.replace(/\/+$/, "") || "/"] ?? "Monitoring QC"}
        </h1>
      </div>
    </header>
  )
}
