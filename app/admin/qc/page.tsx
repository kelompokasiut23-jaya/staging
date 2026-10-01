"use client"

import { useState } from "react"
import {
  CopyIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DisabledReason, EmptyState } from "@/components/empty-state"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LINES, generatePassword, type User } from "@/lib/qc"
import {
  addQcUser,
  isUsernameTaken,
  setPassword,
  setUserActive,
  useTasks,
  useUsers,
} from "@/lib/qc-store"

export default function QcUsersPage() {
  return <RoleGate role="admin">{() => <QcUsers />}</RoleGate>
}

interface Credentials {
  name: string
  username: string
  password: string
  isNew: boolean
}

function QcUsers() {
  const users = (useUsers() ?? []).filter((u) => u.role === "qc")
  const tasks = useTasks() ?? []
  const [addOpen, setAddOpen] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  const openTasks = (u: User) =>
    tasks.filter((t) => t.assignedTo === u.id && t.status !== "selesai").length

  async function resetPassword(user: User) {
    const password = generatePassword()
    await setPassword(user.id, password)
    setCredentials({
      name: user.name,
      username: user.username,
      password,
      isNew: false,
    })
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="text-sm text-muted-foreground">
          Akun untuk petugas QC. Setiap QC masuk dengan username dan password
          dari Anda, lalu hanya melihat barang yang ditugaskan kepadanya.
        </p>
        <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
          <UserPlusIcon data-icon="inline-start" />
          Tambah QC
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        {users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Belum ada akun QC"
            description="Tambahkan petugas QC beserta line tempat ia bertugas. Anda akan mendapat username dan password untuk diberikan kepadanya."
          >
            <Button onClick={() => setAddOpen(true)}>Tambah QC pertama</Button>
          </EmptyState>
        ) : (
          <ul className="grid gap-3 @3xl/main:grid-cols-2">
            {users.map((u) => {
              const open = openTasks(u)
              return (
                <li key={u.id}>
                  <Card size="sm" className={u.active ? "" : "opacity-70"}>
                    <CardContent className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5 font-medium">
                            {u.name}
                            {!u.active && (
                              <Badge variant="outline">Nonaktif</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {u.line} · username{" "}
                            <span className="font-mono">{u.username}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {open > 0
                              ? `${open} tugas belum selesai`
                              : "Tidak ada tugas berjalan"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetPassword(u)}
                          disabled={!u.active}
                        >
                          <KeyRoundIcon data-icon="inline-start" />
                          Buat password baru
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={u.active && open > 0}
                          onClick={() => {
                            setUserActive(u.id, !u.active)
                            toast.success(
                              u.active
                                ? `${u.name} tidak bisa masuk lagi`
                                : `${u.name} bisa masuk lagi`
                            )
                          }}
                        >
                          {u.active ? "Nonaktifkan" : "Aktifkan lagi"}
                        </Button>
                      </div>
                      {u.active && open > 0 && (
                        <DisabledReason>
                          Belum bisa dinonaktifkan karena masih punya {open}{" "}
                          tugas belum selesai.
                        </DisabledReason>
                      )}
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AddQcDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(c) => setCredentials(c)}
      />
      <CredentialsDialog
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </div>
  )
}

function suggestUsername(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
}

function AddQcDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (c: Credentials) => void
}) {
  const [name, setName] = useState("")
  const [line, setLine] = useState("")
  const [username, setUsername] = useState("")
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [password, setPasswordValue] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next) {
      setName("")
      setLine("")
      setUsername("")
      setUsernameEdited(false)
      setPasswordValue(generatePassword())
      setSubmitted(false)
    }
  }

  // Dihitung ulang setiap kali isian berubah, jadi pesan langsung hilang begitu diperbaiki.
  const u = username.trim().toLowerCase()
  const next: Record<string, string> = {}
  if (!name.trim()) next.name = "Nama wajib diisi"
  if (!line) next.line = "Pilih line tempat QC bertugas"
  if (!/^[a-z0-9._]{3,}$/.test(u))
    next.username =
      "Minimal 3 karakter: huruf kecil, angka, titik, atau garis bawah"
  else if (isUsernameTaken(u)) next.username = "Username ini sudah dipakai"
  if (password.length < 6) next.password = "Password minimal 6 karakter"
  const errors = submitted && !saving ? next : {}

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    await addQcUser({ name: name.trim(), line, username: u, password })
    setSaving(false)
    onOpenChange(false)
    onCreated({ name: name.trim(), username: u, password, isNew: true })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah QC</DialogTitle>
          <DialogDescription>
            Setelah disimpan, berikan username dan password ini kepada petugas
            QC.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field label="Nama lengkap" htmlFor="qc-name" error={errors.name}>
            <Input
              id="qc-name"
              placeholder="Contoh: Siti Aminah"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!usernameEdited)
                  setUsername(suggestUsername(e.target.value))
              }}
              aria-invalid={!!errors.name}
            />
          </Field>
          <Field label="Bertugas di" htmlFor="qc-line" error={errors.line}>
            <Select
              value={line || null}
              items={LINES.map((l) => ({ value: l, label: l }))}
              onValueChange={(v) => v && setLine(v)}
            >
              <SelectTrigger
                id="qc-line"
                className="w-full"
                aria-invalid={!!errors.line}
              >
                <SelectValue placeholder="Pilih line" />
              </SelectTrigger>
              <SelectContent>
                {LINES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Username" htmlFor="qc-username" error={errors.username}>
            <Input
              id="qc-username"
              autoCapitalize="none"
              autoComplete="off"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameEdited(true)
              }}
              aria-invalid={!!errors.username}
            />
          </Field>
          <Field label="Password" htmlFor="qc-password" error={errors.password}>
            <div className="flex gap-2">
              <Input
                id="qc-password"
                autoComplete="off"
                className="font-mono"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Buat password acak"
                onClick={() => setPasswordValue(generatePassword())}
              >
                <RefreshCwIcon />
              </Button>
            </div>
          </Field>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={saving}>
              Simpan akun
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: Credentials | null
  onClose: () => void
}) {
  async function copy() {
    if (!credentials) return
    const text = `Akun QC ${credentials.name}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Disalin")
    } catch {
      toast.error("Tidak bisa menyalin. Catat secara manual.")
    }
  }

  return (
    <Dialog
      open={credentials !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        {credentials && (
          <>
            <DialogHeader>
              <DialogTitle>
                {credentials.isNew
                  ? "Akun QC sudah dibuat"
                  : "Password baru sudah dibuat"}
              </DialogTitle>
              <DialogDescription>
                Berikan data ini kepada {credentials.name}. Password hanya
                ditampilkan sekali, jadi catat atau salin sekarang.
                {!credentials.isNew && " Password lama sudah tidak berlaku."}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-2 rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Username</dt>
                <dd className="font-mono font-medium">
                  {credentials.username}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Password</dt>
                <dd className="font-mono font-medium">
                  {credentials.password}
                </dd>
              </div>
            </dl>
            <DialogFooter>
              <Button variant="outline" onClick={copy}>
                <CopyIcon data-icon="inline-start" />
                Salin
              </Button>
              <DialogClose render={<Button />}>Sudah saya catat</DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
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
