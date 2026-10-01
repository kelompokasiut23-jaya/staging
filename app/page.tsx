import Link from "next/link"
import { ClipboardCheckIcon, ShieldCheckIcon, UserCogIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Halaman sementara. Nanti diganti halaman login yang mengarahkan sesuai role.
const ENTRIES = [
  {
    href: "/admin/",
    icon: UserCogIcon,
    title: "Admin",
    description:
      "Tambah barang yang masuk, tugaskan ke QC, kelola akun QC, dan lihat laporan.",
  },
  {
    href: "/qc/",
    icon: ClipboardCheckIcon,
    title: "QC",
    description:
      "Lihat barang yang harus diperiksa, isi jumlah lolos dan defect, lalu tandai selesai.",
  },
]

export default function EntryPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheckIcon className="size-5" />
          </div>
          <h1 className="text-xl font-semibold">Monitoring QC</h1>
          <p className="text-sm text-muted-foreground">
            Pilih halaman yang ingin dibuka. Halaman ini nanti diganti dengan
            halaman login.
          </p>
        </div>
        {ENTRIES.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="transition-colors hover:bg-muted/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <e.icon className="size-4" />
                  Masuk sebagai {e.title}
                </CardTitle>
                <CardDescription>{e.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
