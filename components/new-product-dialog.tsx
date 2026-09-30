"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Field } from "@/components/new-order-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addProduct, useProducts } from "@/lib/store"

export function NewProductDialog({
  label = "Tambah Produk",
  variant = "default",
  className,
}: {
  label?: string
  variant?: "default" | "outline"
  className?: string
}) {
  const products = useProducts()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setName("")
      setNote("")
      setError("")
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Nama produk wajib diisi")
      return
    }
    if (products.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Produk dengan nama ini sudah ada")
      return
    }
    addProduct({ name: trimmed, note: note.trim() })
    toast.success(`Produk "${trimmed}" ditambahkan`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant={variant} className={className} />}
      >
        <PlusIcon data-icon="inline-start" />
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah produk</DialogTitle>
          <DialogDescription>
            Tulis nama barang yang Anda produksi. Produk ini nanti bisa dipilih
            saat mencatat order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field label="Nama produk" htmlFor="product-name" error={error}>
            <Input
              id="product-name"
              placeholder="Contoh: Kursi Kantor"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              aria-invalid={!!error}
              autoFocus
            />
          </Field>
          <Field label="Keterangan (boleh dikosongkan)" htmlFor="product-note">
            <Textarea
              id="product-note"
              rows={2}
              placeholder="Contoh: warna hitam, sandaran jaring"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit">Simpan Produk</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
