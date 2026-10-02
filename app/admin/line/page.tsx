"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutListIcon,
  PackagePlusIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DisabledReason, EmptyState } from "@/components/empty-state"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_LABEL, formatNumber, type User } from "@/lib/qc"
import {
  createLine,
  deleteLine,
  renameLine,
  setUserLine,
  useLines,
  useTasks,
  useUsers,
} from "@/lib/qc-store"

export default function LinesPage() {
  return <RoleGate roles={["super_admin"]}>{() => <Lines />}</RoleGate>
}

function Lines() {
  const lines = useLines() ?? []
  const users = (useUsers() ?? []).filter((u) => u.role !== "super_admin")
  const tasks = useTasks() ?? []
  const [nameDialog, setNameDialog] = useState<
    { mode: "new" } | { mode: "rename"; line: string } | null
  >(null)
  const [membersOf, setMembersOf] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const unassigned = users.filter((u) => !u.line && u.active)

  async function remove(name: string) {
    setBusy(name)
    const error = await deleteLine(name)
    setBusy(null)
    if (error) return toast.error(error)
    toast.success(`${name} dihapus`)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Buat line produksi, tempatkan admin dan QC di dalamnya, lalu kirim
          barang yang harus diperiksa ke line tersebut. Semua QC di sebuah line
          bisa mengisi hasil barang di line itu.
        </p>
        <Button
          onClick={() => setNameDialog({ mode: "new" })}
          className="w-full sm:w-auto"
        >
          <PlusIcon data-icon="inline-start" />
          Tambah line
        </Button>
      </div>

      {unassigned.length > 0 && lines.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="font-medium">
            {unassigned.length} pengguna belum ditempatkan di line:
          </span>{" "}
          {unassigned
            .map((u) => `${u.name} (${ROLE_LABEL[u.role]})`)
            .join(", ")}
          . Buka <span className="font-medium">Atur anggota</span> di salah satu
          line untuk menempatkan mereka.
        </div>
      )}

      {lines.length === 0 ? (
        <EmptyState
          icon={LayoutListIcon}
          title="Belum ada line"
          description="Mulai dengan membuat line pertama, misalnya “Line 1”. Setelah itu tempatkan admin dan QC di line tersebut, lalu barang bisa dikirim ke sana."
        >
          <Button onClick={() => setNameDialog({ mode: "new" })}>
            Tambah line pertama
          </Button>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 @3xl/main:grid-cols-2">
          {lines.map((line) => {
            const members = users.filter((u) => u.line === line.name)
            const admins = members.filter((u) => u.role === "admin")
            const qcs = members.filter((u) => u.role === "qc")
            const lineTasks = tasks.filter((t) => t.line === line.name)
            const open = lineTasks.filter((t) => t.status !== "selesai").length
            const canDelete = members.length === 0 && lineTasks.length === 0
            return (
              <li key={line.name}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{line.name}</CardTitle>
                    <CardDescription>
                      {formatNumber(qcs.length)} QC ·{" "}
                      {formatNumber(admins.length)} admin · {formatNumber(open)}{" "}
                      barang sedang berjalan
                    </CardDescription>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ganti nama ${line.name}`}
                        onClick={() =>
                          setNameDialog({ mode: "rename", line: line.name })
                        }
                      >
                        <PencilIcon />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <MemberGroup
                      title="Admin (penanggung jawab)"
                      people={admins}
                      empty="Belum ada admin"
                    />
                    <MemberGroup
                      title="QC"
                      people={qcs}
                      empty="Belum ada QC. Barang di line ini belum bisa diperiksa."
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMembersOf(line.name)}
                      >
                        <UsersIcon data-icon="inline-start" />
                        Atur anggota
                      </Button>
                      <Button
                        size="sm"
                        render={
                          <Link
                            href={`/admin/tugas/baru/?line=${encodeURIComponent(line.name)}`}
                          />
                        }
                      >
                        <PackagePlusIcon data-icon="inline-start" />
                        Tambah barang
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!canDelete || busy === line.name}
                        onClick={() => remove(line.name)}
                      >
                        <Trash2Icon data-icon="inline-start" />
                        Hapus
                      </Button>
                    </div>
                    {!canDelete && (
                      <DisabledReason>
                        Line hanya bisa dihapus jika sudah tidak ada anggota dan
                        barang di dalamnya.
                      </DisabledReason>
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <LineNameDialog
        state={nameDialog}
        existing={lines.map((l) => l.name)}
        onClose={() => setNameDialog(null)}
      />
      <MembersDialog
        line={membersOf}
        users={users}
        onClose={() => setMembersOf(null)}
      />
    </div>
  )
}

function MemberGroup({
  title,
  people,
  empty,
}: {
  title: string
  people: User[]
  empty: string
}) {
  return (
    <div className="grid gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {people.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {people.map((u) => (
            <Badge key={u.id} variant={u.active ? "secondary" : "outline"}>
              {u.name}
              {!u.active && " (nonaktif)"}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function LineNameDialog({
  state,
  existing,
  onClose,
}: {
  state: { mode: "new" } | { mode: "rename"; line: string } | null
  existing: string[]
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState("")
  const [openFor, setOpenFor] = useState<typeof state>(null)

  // Isi ulang form setiap kali dialog dibuka.
  if (state !== openFor) {
    setOpenFor(state)
    setName(state?.mode === "rename" ? state.line : "")
    setSubmitted(false)
    setServerError("")
  }

  const original = state?.mode === "rename" ? state.line : ""
  const trimmed = name.trim()
  let error = ""
  if (!trimmed) error = "Nama line wajib diisi"
  else if (
    trimmed.toLowerCase() !== original.toLowerCase() &&
    existing.some((l) => l.toLowerCase() === trimmed.toLowerCase())
  )
    error = "Nama line ini sudah dipakai"

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (error || !state) return
    if (state.mode === "rename" && trimmed === original) return onClose()
    setBusy(true)
    const message =
      state.mode === "new"
        ? await createLine(trimmed)
        : await renameLine(original, trimmed)
    setBusy(false)
    if (message) return setServerError(message)
    toast.success(
      state.mode === "new"
        ? `${trimmed} dibuat`
        : `Nama diganti menjadi ${trimmed}`
    )
    onClose()
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "rename" ? "Ganti nama line" : "Tambah line"}
          </DialogTitle>
          <DialogDescription>
            {state?.mode === "rename"
              ? "Nama baru langsung dipakai di semua barang dan pengguna di line ini."
              : "Contoh: Line 1, Line Jahit A, atau Gedung B Lantai 2."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="line-name">Nama line</Label>
            <Input
              id="line-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setServerError("")
              }}
              aria-invalid={submitted && !!error}
              autoFocus
            />
            {submitted && error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            {serverError && (
              <p className="text-xs text-destructive">{serverError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {state?.mode === "rename" ? "Simpan nama" : "Buat line"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MembersDialog({
  line,
  users,
  onClose,
}: {
  line: string | null
  users: User[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openFor, setOpenFor] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (line !== openFor) {
    setOpenFor(line)
    setSelected(
      new Set(users.filter((u) => line && u.line === line).map((u) => u.id))
    )
  }

  const candidates = [...users].sort(
    (a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)
  )
  const toAdd = candidates.filter((u) => selected.has(u.id) && u.line !== line)
  const toRemove = candidates.filter(
    (u) => !selected.has(u.id) && u.line === line
  )
  const moved = toAdd.filter((u) => u.line)

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function save() {
    if (!line) return
    setBusy(true)
    for (const u of toAdd) {
      const error = await setUserLine(u.id, line)
      if (error) {
        setBusy(false)
        return toast.error(`${u.name}: ${error}`)
      }
    }
    for (const u of toRemove) {
      const error = await setUserLine(u.id, null)
      if (error) {
        setBusy(false)
        return toast.error(`${u.name}: ${error}`)
      }
    }
    setBusy(false)
    toast.success(`Anggota ${line} diperbarui`)
    onClose()
  }

  return (
    <Dialog open={line !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anggota {line}</DialogTitle>
          <DialogDescription>
            Centang admin dan QC yang bertugas di line ini. Setiap orang hanya
            bisa berada di satu line.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada pengguna. Buat akun admin atau QC dulu di menu Pengguna.
          </p>
        ) : (
          <ul className="grid gap-1">
            {candidates.map((u) => {
              const checked = selected.has(u.id)
              const elsewhere = u.line && u.line !== line
              return (
                <li key={u.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-primary"
                      checked={checked}
                      onChange={() => toggle(u.id)}
                      disabled={!u.active && !checked}
                    />
                    <span className="grid flex-1 gap-0.5 text-sm">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium">
                        {u.name}
                        <Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge>
                        {!u.active && <Badge variant="outline">Nonaktif</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {elsewhere
                          ? checked
                            ? `Akan dipindah dari ${u.line}`
                            : `Saat ini di ${u.line}`
                          : u.line === line
                            ? checked
                              ? "Anggota line ini"
                              : "Akan dikeluarkan dari line ini"
                            : "Belum ditempatkan di line"}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        {moved.length > 0 && (
          <DisabledReason>
            {moved.map((u) => u.name).join(", ")} akan dipindah ke {line} dan
            tidak lagi melihat barang di line sebelumnya.
          </DisabledReason>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
          <Button
            onClick={save}
            disabled={busy || (toAdd.length === 0 && toRemove.length === 0)}
          >
            Simpan anggota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
