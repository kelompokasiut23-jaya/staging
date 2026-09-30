"use client"

import Link from "next/link"
import { ClipboardListIcon, PackageIcon } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { NewOrderDialog } from "@/components/new-order-dialog"
import { Button } from "@/components/ui/button"
import { useOrders, useProducts } from "@/lib/store"

export default function OrdersPage() {
  const orders = useOrders()
  const products = useProducts()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Catat order masuk dan perbarui tahap produksinya. Klik sebuah order
        untuk melihat detail dan mengubah kondisi terkininya.
      </p>

      {orders.length > 0 ? (
        <DataTable orders={orders} />
      ) : (
        <div className="px-4 lg:px-6">
          {products.length === 0 ? (
            <EmptyState
              icon={PackageIcon}
              title="Belum ada produk, jadi order belum bisa dicatat"
              description="Setiap order harus dikaitkan dengan produk. Tambahkan dulu produk yang Anda buat di menu Produk, lalu kembali ke halaman ini untuk mencatat order."
            >
              <NewOrderDialog align="start" />
              <Button
                render={<Link href="/produk" />}
                className="w-full sm:w-auto"
              >
                Buka menu Produk
              </Button>
            </EmptyState>
          ) : (
            <EmptyState
              icon={ClipboardListIcon}
              title="Belum ada order"
              description="Klik tombol di bawah untuk mencatat order pertama. Setelah tercatat, Anda bisa memperbarui tahap pengerjaannya kapan saja dengan mengklik order tersebut."
            >
              <NewOrderDialog />
            </EmptyState>
          )}
        </div>
      )}
    </div>
  )
}
