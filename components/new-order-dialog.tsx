"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

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
import { addOrder, useToday } from "@/lib/store"

const STAGE_ITEMS = STAGES.filter((s) => s.key !== "selesai").map((s) => ({
  value: s.key,
  label: s.label,
}))
const PRIORITY_ITEMS = PRIORITIES.map((p) => ({ value: p.key, label: p.label }))

interface FormState {
  customer: string
  product: string
  quantity: string
  dueDate: string
  priority: PriorityKey
  stage: StageKey
  produced: string
  notes: string
}

const EMPTY: FormState = {
  customer: "",
  product: "",
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
}: {
  onCreated?: (orderId: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const today = useToday()

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
    if (!form.product.trim()) next.product = "Nama produk wajib diisi"
    if (!Number.isInteger(quantity) || quantity <= 0)
      next.quantity = "Jumlah harus bilangan bulat lebih dari 0"
    if (!form.dueDate) next.dueDate = "Tanggal deadline wajib diisi"
    if (!Number.isInteger(produced) || produced < 0 || produced > quantity)
      next.produced = "Harus antara 0 dan jumlah order"

    setErrors(next)
    if (Object.keys(next).length > 0) return

    const order = addOrder({
      customer: form.customer.trim(),
      product: form.product.trim(),
      quantity,
      produced,
      dueDate: form.dueDate,
      priority: form.priority,
      stage: form.stage,
      notes: form.notes.trim(),
    })
    toast.success(`Order ${order.id} berhasil dicatat`)
    setOpen(false)
    onCreated?.(order.id)
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
            Isi data order dan tahap produksi saat ini agar sesuai dengan kondisi
            aktual di lapangan.
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

          <Field label="Produk" htmlFor="product" error={errors.product}>
            <Input
              id="product"
              placeholder="Contoh: Kursi Kantor Ergonomis"
              value={form.product}
              onChange={(e) => set("product", e.target.value)}
              aria-invalid={!!errors.product}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jumlah order (unit)" htmlFor="quantity" error={errors.quantity}>
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
            <Field label="Deadline" htmlFor="dueDate" error={errors.dueDate}>
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
            label="Sudah diproduksi (unit)"
            htmlFor="produced"
            error={errors.produced}
            hint="Isi jika order sudah mulai dikerjakan."
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

          <Field label="Catatan (opsional)" htmlFor="notes">
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
