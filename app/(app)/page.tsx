"use client"

import { useState } from "react"
import { CheckIcon } from "lucide-react"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { NewOrderDialog } from "@/components/new-order-dialog"
import { NewProductDialog } from "@/components/new-product-dialog"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { SectionCards } from "@/components/section-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useOrders, useProducts } from "@/lib/store"

export default function DashboardPage() {
  const orders = useOrders()
  const products = useProducts()
  const [selected, setSelected] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="flex max-w-3xl flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Selamat datang
          </h2>
          <p className="text-sm text-muted-foreground">
            Di sini Anda bisa melihat ringkasan order dan tahap produksi.
          </p>
        </div>
        <GettingStarted
          hasProducts={products.length > 0}
          onCreated={setSelected}
        />
        <OrderDetailSheet
          orderId={selected}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable orders={orders} />
    </div>
  )
}

function GettingStarted({
  hasProducts,
  onCreated,
}: {
  hasProducts: boolean
  onCreated: (orderId: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mulai dari sini</CardTitle>
        <CardDescription>
          Belum ada data. Ikuti dua langkah berikut secara berurutan, lalu
          ringkasan produksi akan muncul di halaman ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Step
          number={1}
          done={hasProducts}
          title="Tambah produk"
          description="Tulis nama barang yang Anda produksi, misalnya “Kursi Kantor”."
        >
          {hasProducts ? (
            <p className="text-sm text-muted-foreground">
              Sudah selesai. Produk sudah ada.
            </p>
          ) : (
            <NewProductDialog className="w-full sm:w-auto" />
          )}
        </Step>

        <Step
          number={2}
          done={false}
          disabled={!hasProducts}
          title="Catat order pertama"
          description="Isi siapa yang memesan, berapa jumlahnya, kapan batas waktunya, dan tahap produksi yang sedang berjalan."
        >
          <NewOrderDialog
            onCreated={onCreated}
            className="w-full sm:w-auto"
            align="start"
            disabledReason="Selesaikan langkah 1 dulu agar tombol ini aktif."
          />
        </Step>
      </CardContent>
    </Card>
  )
}

function Step({
  number,
  done,
  disabled = false,
  title,
  description,
  children,
}: {
  number: number
  done: boolean
  disabled?: boolean
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className={"flex gap-3 " + (disabled ? "opacity-80" : "")}>
      <div
        className={
          "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium " +
          (done
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-muted")
        }
      >
        {done ? <CheckIcon className="size-4" /> : number}
      </div>
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-1.5 sm:items-start">{children}</div>
      </div>
    </div>
  )
}
