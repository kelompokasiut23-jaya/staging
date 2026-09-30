"use client"

import { useState } from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { DisabledReason } from "@/components/empty-state"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  PRIORITIES,
  STAGES,
  type PriorityKey,
  type StageKey,
} from "@/lib/production"
import { addOrder, useProducts, useToday } from "@/lib/store"

const STAGE_ITEMS = STAGES.filter((s) => s.key !== "selesai").map((s) => ({
  value: s.key,
  label: s.label,
}))
const PRIORITY_ITEMS = PRIORITIES.map((p) => ({ value: p.key, label: p.label }))

interface FormState {
  customer: string
  productId: string
  quantity: string
  dueDate: string
  priority: PriorityKey
  stage: StageKey
  produced: string
  notes: string
}

const EMPTY: FormState = {
  customer: "",
  productId: "",
  quantity: "",
  dueDate: "",
  priority: "normal",
  stage: "diterima",
  produced: "0",
  notes: "",
}

type Errors = Partial<Record<keyof FormState, string>>

export function NewOrderDialog({
  onCreated,
  className,
  align = "end",
  disabledReason,
}: {
  onCreated?: (orderId: string) => void
  className?: string
  align?: "start" | "end"
  disabledReason?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const today = useToday()
  const products = useProducts()
  const productItems = products.map((p) => ({ value: p.id, label: p.name }))

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setForm(EMPTY)
      setErrors({})
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const quantity = Number(form.quantity)
    const produced = Number(form.produced || 0)
    const next: Errors = {}

    if (!form.customer.trim()) next.customer = "Nama pelanggan wajib diisi"
    if (!form.productId) next.productId = "Pilih produk terlebih dahulu"
    if (!Number.isInteger(quantity) || quantity <= 0)
      next.quantity = "Jumlah harus bilangan bulat lebih dari 0"
    if (!form.dueDate) next.dueDate = "Batas waktu wajib diisi"
    if (!Number.isInteger(produced) || produced < 0 || produced > quantity)
      next.produced = "Harus antara 0 dan jumlah order"

    setErrors(next)
    if (Object.keys(next).length > 0) return

    const order = addOrder({
      customer: form.customer.trim(),
      productId: form.productId,
      quantity,
      produced,
      dueDate: form.dueDate,
      priority: form.priority,
      stage: form.stage,
      notes: form.notes.trim(),
    })
    if (!order) {
      setErrors({ productId: "Produk tidak ditemukan, pilih ulang" })
      return
    }
    toast.success(`Order ${order.id} berhasil dicatat`)
    setOpen(false)
    onCreated?.(order.id)
  }

  if (products.length === 0) {
    return (
      <div
        className={
          "flex flex-col gap-1.5 " +
          (align === "end" ? "sm:items-end" : "sm:items-start")
        }
      >
        <Button disabled className={className}>
          <PlusIcon data-icon="inline-start" />
          Catat Order
        </Button>
        <DisabledReason>
          {disabledReason ?? (
            <>
              Belum bisa dipakai. Tambahkan produk dulu di menu{" "}
              <Link
                href="/produk"
                className="font-medium text-foreground underline underline-offset-2"
              >
                Produk
              </Link>
              .
            </>
          )}
        </DisabledReason>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className={className} />}>
        <PlusIcon data-icon="inline-start" />
        Catat Order
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Catat order masuk</DialogTitle>
          <DialogDescription>
            Isi data order, lalu pilih tahap produksi yang sedang berjalan
            sekarang agar sama dengan kondisi di lapangan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field label="Pelanggan" htmlFor="customer" error={errors.customer}>
            <Input
              id="customer"
              placeholder="Contoh: PT Sinar Abadi"
              value={form.customer}
              onChange={(e) => set("customer", e.target.value)}
              aria-invalid={!!errors.customer}
            />
          </Field>

          <Field label="Produk" htmlFor="product" error={errors.productId}>
            <Select
              value={form.productId || null}
              items={productItems}
              onValueChange={(v) => v && set("productId", v)}
            >
              <SelectTrigger
                id="product"
                className="w-full"
                aria-invalid={!!errors.productId}
              >
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {productItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Jumlah yang dipesan (unit)"
              htmlFor="quantity"
              error={errors.quantity}
            >
              <Input
                id="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                aria-invalid={!!errors.quantity}
              />
            </Field>
            <Field label="Batas waktu" htmlFor="dueDate" error={errors.dueDate}>
              <Input
                id="dueDate"
                type="date"
                min={today}
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                aria-invalid={!!errors.dueDate}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prioritas" htmlFor="priority">
              <Select
                value={form.priority}
                items={PRIORITY_ITEMS}
                onValueChange={(v) => v && set("priority", v as PriorityKey)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tahap saat ini" htmlFor="stage">
              <Select
                value={form.stage}
                items={STAGE_ITEMS}
                onValueChange={(v) => v && set("stage", v as StageKey)}
              >
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Sudah jadi (unit)"
            htmlFor="produced"
            error={errors.produced}
            hint="Isi jika order sudah mulai dikerjakan. Kosongkan (0) jika belum."
          >
            <Input
              id="produced"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.produced}
              onChange={(e) => set("produced", e.target.value)}
              aria-invalid={!!errors.produced}
            />
          </Field>

          <Field label="Catatan (boleh dikosongkan)" htmlFor="notes">
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
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
            <Button type="submit">Simpan Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
