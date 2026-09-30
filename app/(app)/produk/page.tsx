"use client"

import { PackageIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { NewProductDialog } from "@/components/new-product-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteProduct, useOrders, useProducts } from "@/lib/store"

export default function ProductsPage() {
  const products = useProducts()
  const orders = useOrders()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground">
            Daftar barang yang Anda produksi. Tambahkan di sini dulu sebelum
            mencatat order.
          </p>
        </div>
        {products.length > 0 && (
          <NewProductDialog className="w-full sm:w-auto" />
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="Belum ada produk"
          description="Daftarkan dulu barang yang Anda produksi, misalnya “Kursi Kantor” atau “Meja Lipat”. Setelah itu Anda bisa mencatat order untuk produk tersebut."
        >
          <NewProductDialog
            label="Tambah Produk Pertama"
            className="w-full sm:w-auto"
          />
        </EmptyState>
      ) : (
        <ul className="grid gap-3">
          {products.map((product) => {
            const used = orders.filter((o) => o.productId === product.id).length
            return (
              <li key={product.id}>
                <Card size="sm">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.note || "Tanpa keterangan"} ·{" "}
                        {used > 0
                          ? `Dipakai di ${used} order`
                          : "Belum dipakai di order"}
                      </p>
                      {used > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tidak bisa dihapus karena masih dipakai di order.
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={used > 0}
                      aria-label={`Hapus produk ${product.name}`}
                      onClick={() => {
                        if (deleteProduct(product.id)) {
                          toast.success(`Produk "${product.name}" dihapus`)
                        }
                      }}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Hapus
                    </Button>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
