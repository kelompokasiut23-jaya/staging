"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, PlusIcon, Trash2Icon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { DisabledReason, EmptyState } from "@/components/empty-state"
import { RoleGate } from "@/components/role-gate"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { formatNumber } from "@/lib/qc"
import { addTask, useTasks, useUsers } from "@/lib/qc-store"

export default function NewTaskPage() {
  return <RoleGate roles={["super_admin"]}>{() => <NewTaskForm />}</RoleGate>
}

interface SizeRow {
  key: number
  size: string
  target: string
}

type Errors = Partial<
  Record<
    "brand" | "item" | "color" | "assignedTo" | "deadline" | "sizes",
    string
  >
>

function todayInJakarta() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date()
  )
}

function NewTaskForm() {
  const router = useRouter()
  const users = useUsers() ?? []
  const tasks = useTasks() ?? []
  const qcUsers = users.filter((u) => u.role === "qc" && u.active)
  const clients = Array.from(new Set(tasks.map((t) => t.brand))).sort()

  const [brand, setBrand] = useState("")
  const [item, setItem] = useState("")
  const [color, setColor] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [date, setDate] = useState(todayInJakarta)
  const [time, setTime] = useState("")
  const [note, setNote] = useState("")
  const [rows, setRows] = useState<SizeRow[]>([
    { key: 1, size: "S", target: "" },
    { key: 2, size: "M", target: "" },
    { key: 3, size: "L", target: "" },
  ])
  const [submitted, setSubmitted] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)

  const qc = qcUsers.find((u) => u.id === assignedTo)
  const qcItems = qcUsers.map((u) => ({
    value: u.id,
    label: `${u.name} · ${u.line}`,
  }))
  const total = rows.reduce((sum, r) => sum + (Number(r.target) || 0), 0)

  function updateRow(key: number, field: "size" | "target", value: string) {
    setRows((current) =>
      current.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    )
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        key: Math.max(0, ...current.map((r) => r.key)) + 1,
        size: "",
        target: "",
      },
    ])
  }

  // Pesan error dihitung ulang setiap kali isian berubah, jadi langsung hilang begitu diperbaiki.
  function validate() {
    const next: Errors = {}
    if (!brand.trim()) next.brand = "Nama client wajib diisi"
    if (!item.trim()) next.item = "Nama item wajib diisi"
    if (!color.trim()) next.color = "Warna wajib diisi"
    if (!qc) next.assignedTo = "Pilih QC yang akan memeriksa"
    if (!date || !time) next.deadline = "Isi tanggal dan jam batas selesai"

    const sizes = rows.map((r) => ({
      size: r.size.trim().toUpperCase(),
      target: Number(r.target),
    }))
    const names = sizes.map((s) => s.size)
    if (sizes.length === 0) next.sizes = "Tambahkan minimal satu ukuran"
    else if (names.some((n) => !n))
      next.sizes = "Setiap baris harus punya nama ukuran"
    else if (new Set(names).size !== names.length)
      next.sizes = "Ada nama ukuran yang sama"
    else if (sizes.some((s) => !Number.isInteger(s.target) || s.target <= 0))
      next.sizes = "Jumlah setiap ukuran harus angka bulat lebih dari 0"

    return { next, sizes }
  }

  const { next: liveErrors, sizes } = validate()
  const errors: Errors = submitted
    ? { ...liveErrors, ...(saveError ? { assignedTo: saveError } : {}) }
    : {}

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setSaveError("")
    if (Object.keys(liveErrors).length > 0 || !qc) return

    setSaving(true)
    const { task, error } = await addTask({
      brand: brand.trim(),
      item: item.trim(),
      color: color.trim(),
      assignedTo: qc.id,
      deadline: new Date(`${date}T${time}:00+07:00`).toISOString(),
      sizes,
      note: note.trim(),
    })
    setSaving(false)
    if (!task) {
      setSaveError(error ?? "Gagal menyimpan, coba lagi")
      return
    }
    toast.success(`${task.brand} · ${task.item} dikirim ke ${qc.name}`)
    router.push("/admin/")
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        render={<Link href="/admin/" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Kembali ke Daftar Barang
      </Button>

      {qcUsers.length === 0 ? (
        <EmptyState
          icon={UserPlusIcon}
          title="Belum ada QC yang bisa ditugaskan"
          description="Setiap barang harus diperiksa oleh satu QC. Tambahkan akun QC dulu di menu Pengguna, lalu kembali ke sini."
        >
          <Button render={<Link href="/admin/pengguna/" />}>
            Buka Pengguna
          </Button>
        </EmptyState>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Barang yang masuk</CardTitle>
              <CardDescription>
                Data ini yang akan dilihat QC di halamannya.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field
                label="Client / nama perusahaan"
                htmlFor="brand"
                error={errors.brand}
              >
                <Input
                  id="brand"
                  list="client-list"
                  placeholder="Contoh: Aruna Wear"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  aria-invalid={!!errors.brand}
                />
                <datalist id="client-list">
                  {clients.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Item" htmlFor="item" error={errors.item}>
                  <Input
                    id="item"
                    placeholder="Contoh: Kaos Polo Pria"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    aria-invalid={!!errors.item}
                  />
                </Field>
                <Field label="Warna" htmlFor="color" error={errors.color}>
                  <Input
                    id="color"
                    placeholder="Contoh: Navy"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-invalid={!!errors.color}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jumlah per ukuran</CardTitle>
              <CardDescription>
                Total {formatNumber(total)} barang. QC akan mengisi lolos dan
                defect untuk setiap ukuran ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_1.4fr_auto] items-end gap-2"
                >
                  <div className="grid gap-1.5">
                    {index === 0 && (
                      <Label htmlFor={`size-${row.key}`}>Ukuran</Label>
                    )}
                    <Input
                      id={`size-${row.key}`}
                      placeholder="Contoh: XL"
                      value={row.size}
                      onChange={(e) =>
                        updateRow(row.key, "size", e.target.value)
                      }
                      aria-label={`Ukuran baris ${index + 1}`}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    {index === 0 && (
                      <Label htmlFor={`target-${row.key}`}>Jumlah (pcs)</Label>
                    )}
                    <Input
                      id={`target-${row.key}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="0"
                      value={row.target}
                      onChange={(e) =>
                        updateRow(row.key, "target", e.target.value)
                      }
                      aria-label={`Jumlah ukuran baris ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus baris ${index + 1}`}
                    disabled={rows.length === 1}
                    onClick={() =>
                      setRows((r) => r.filter((x) => x.key !== row.key))
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              {errors.sizes && (
                <p className="text-xs text-destructive">{errors.sizes}</p>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={addRow}
              >
                <PlusIcon data-icon="inline-start" />
                Tambah ukuran
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Penugasan</CardTitle>
              <CardDescription>
                Siapa yang memeriksa dan kapan harus selesai.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field
                label="Diperiksa oleh QC"
                htmlFor="assignedTo"
                error={errors.assignedTo}
              >
                <Select
                  value={assignedTo || null}
                  items={qcItems}
                  onValueChange={(v) => v && setAssignedTo(v)}
                >
                  <SelectTrigger
                    id="assignedTo"
                    className="w-full"
                    aria-invalid={!!errors.assignedTo}
                  >
                    <SelectValue placeholder="Pilih QC" />
                  </SelectTrigger>
                  <SelectContent>
                    {qcItems.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {qc && (
                  <DisabledReason>
                    Barang akan diperiksa di {qc.line}, tempat {qc.name}{" "}
                    bertugas.
                  </DisabledReason>
                )}
              </Field>
              <Field
                label="Batas selesai"
                htmlFor="deadline-date"
                error={errors.deadline}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="deadline-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Tanggal batas selesai"
                    aria-invalid={!!errors.deadline}
                  />
                  <Input
                    id="deadline-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    aria-label="Jam batas selesai"
                    aria-invalid={!!errors.deadline}
                  />
                </div>
              </Field>
              <Field
                label="Catatan untuk QC (boleh dikosongkan)"
                htmlFor="note"
              >
                <Textarea
                  id="note"
                  rows={2}
                  placeholder="Contoh: cek jahitan kerah dan posisi logo"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              render={<Link href="/admin/" />}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              Simpan dan kirim ke QC
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
