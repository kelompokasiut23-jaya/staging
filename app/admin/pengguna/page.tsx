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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LINES, ROLE_LABEL, generatePassword, type User } from "@/lib/qc"
import {
  createUser,
  setUserActive,
  setUserPassword,
  useTasks,
  useUsers,
} from "@/lib/qc-store"

export default function UsersPage() {
  return <RoleGate roles={["super_admin"]}>{() => <Users />}</RoleGate>
}

type NewRole = "admin" | "qc"

const ROLE_HELP: Record<NewRole, string> = {
  admin:
    "Penanggung jawab line. Hanya bisa melihat barang dan hasil QC di line-nya, tidak bisa mengubah apa pun.",
  qc: "Petugas pemeriksa. Hanya melihat barang yang ditugaskan kepadanya, lalu mengisi lolos dan defect.",
}

interface Credentials {
  name: string
  username: string
  password: string
  isNew: boolean
}

function Users() {
  const users = (useUsers() ?? []).filter((u) => u.role !== "super_admin")
  const tasks = useTasks() ?? []
  const [filter, setFilter] = useState<"semua" | NewRole>("semua")
  const [addOpen, setAddOpen] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const openTasks = (u: User) =>
    u.role === "qc"
      ? tasks.filter((t) => t.assignedTo === u.id && t.status !== "selesai")
          .length
      : 0

  const visible = users
    .filter((u) => filter === "semua" || u.role === filter)
    .sort(
      (a, b) =>
        a.line.localeCompare(b.line) ||
        a.role.localeCompare(b.role) ||
        a.name.localeCompare(b.name)
    )

  async function resetPassword(user: User) {
    setBusyId(user.id)
    const password = generatePassword()
    const error = await setUserPassword(user.id, password)
    setBusyId(null)
    if (error) return toast.error(error)
    setCredentials({
      name: user.name,
      username: user.username,
      password,
      isNew: false,
    })
  }

  async function toggleActive(user: User) {
    setBusyId(user.id)
    const error = await setUserActive(user.id, !user.active)
    setBusyId(null)
    if (error) return toast.error(error)
    toast.success(
      user.active
        ? `${user.name} tidak bisa masuk lagi`
        : `${user.name} bisa masuk lagi`
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="text-sm text-muted-foreground">
          Buat akun untuk admin line dan petugas QC. Setiap orang masuk dengan
          username dan password dari Anda, lalu hanya melihat halaman sesuai
          role-nya.
        </p>
        <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
          <UserPlusIcon data-icon="inline-start" />
          Tambah pengguna
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="px-4 lg:px-6">
          <EmptyState
            icon={UsersIcon}
            title="Belum ada pengguna"
            description="Mulai dengan menambahkan petugas QC. Barang hanya bisa ditambahkan setelah ada QC yang bisa ditugaskan."
          >
            <Button onClick={() => setAddOpen(true)}>
              Tambah pengguna pertama
            </Button>
          </EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 lg:px-6">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <TabsList>
              <TabsTrigger value="semua">Semua ({users.length})</TabsTrigger>
              <TabsTrigger value="admin">
                Admin ({users.filter((u) => u.role === "admin").length})
              </TabsTrigger>
              <TabsTrigger value="qc">
                QC ({users.filter((u) => u.role === "qc").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ul className="grid gap-3 @3xl/main:grid-cols-2">
            {visible.map((u) => {
              const open = openTasks(u)
              const busy = busyId === u.id
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
                            <Badge variant="secondary">
                              {ROLE_LABEL[u.role]}
                            </Badge>
                            {!u.active && (
                              <Badge variant="outline">Nonaktif</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {u.line} · username{" "}
                            <span className="font-mono">{u.username}</span>
                          </p>
                          {u.role === "qc" && (
                            <p className="text-xs text-muted-foreground">
                              {open > 0
                                ? `${open} tugas belum selesai`
                                : "Tidak ada tugas berjalan"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetPassword(u)}
                          disabled={!u.active || busy}
                        >
                          <KeyRoundIcon data-icon="inline-start" />
                          Buat password baru
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(u.active && open > 0) || busy}
                          onClick={() => toggleActive(u)}
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
        </div>
      )}

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        usernames={users.map((u) => u.username)}
        onCreated={setCredentials}
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

function AddUserDialog({
  open,
  onOpenChange,
  usernames,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  usernames: string[]
  onCreated: (c: Credentials) => void
}) {
  const [name, setName] = useState("")
  const [role, setRole] = useState<NewRole | "">("")
  const [line, setLine] = useState("")
  const [username, setUsername] = useState("")
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState("")

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next) {
      setName("")
      setRole("")
      setLine("")
      setUsername("")
      setUsernameEdited(false)
      setPassword(generatePassword())
      setSubmitted(false)
      setServerError("")
    }
  }

  // Dihitung ulang setiap kali isian berubah, jadi pesan langsung hilang begitu diperbaiki.
  const u = username.trim().toLowerCase()
  const next: Record<string, string> = {}
  if (!name.trim()) next.name = "Nama wajib diisi"
  if (!role) next.role = "Pilih role"
  if (!line) next.line = "Pilih line"
  if (!/^[a-z0-9._]{3,}$/.test(u))
    next.username =
      "Minimal 3 karakter: huruf kecil, angka, titik, atau garis bawah"
  else if (usernames.includes(u)) next.username = "Username ini sudah dipakai"
  if (password.length < 6) next.password = "Password minimal 6 karakter"
  const errors = submitted && !saving ? next : {}

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setServerError("")
    if (Object.keys(next).length > 0 || !role) return

    setSaving(true)
    const error = await createUser({
      name: name.trim(),
      username: u,
      role,
      line,
      password,
    })
    setSaving(false)
    if (error) return setServerError(error)
    onOpenChange(false)
    onCreated({ name: name.trim(), username: u, password, isNew: true })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah pengguna</DialogTitle>
          <DialogDescription>
            Setelah disimpan, berikan username dan password kepada orang
            tersebut.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field label="Nama lengkap" htmlFor="user-name" error={errors.name}>
            <Input
              id="user-name"
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
          <Field label="Role" htmlFor="user-role" error={errors.role}>
            <Select
              value={role || null}
              items={[
                { value: "qc", label: "QC" },
                { value: "admin", label: "Admin" },
              ]}
              onValueChange={(v) => v && setRole(v as NewRole)}
            >
              <SelectTrigger
                id="user-role"
                className="w-full"
                aria-invalid={!!errors.role}
              >
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qc">QC</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {role && <DisabledReason>{ROLE_HELP[role]}</DisabledReason>}
          </Field>
          <Field
            label={role === "admin" ? "Line yang diawasi" : "Bertugas di"}
            htmlFor="user-line"
            error={errors.line}
          >
            <Select
              value={line || null}
              items={LINES.map((l) => ({ value: l, label: l }))}
              onValueChange={(v) => v && setLine(v)}
            >
              <SelectTrigger
                id="user-line"
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
          <Field
            label="Username"
            htmlFor="user-username"
            error={errors.username}
          >
            <Input
              id="user-username"
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
          <Field
            label="Password"
            htmlFor="user-password"
            error={errors.password}
          >
            <div className="flex gap-2">
              <Input
                id="user-password"
                autoComplete="off"
                className="font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Buat password acak"
                onClick={() => setPassword(generatePassword())}
              >
                <RefreshCwIcon />
              </Button>
            </div>
          </Field>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan akun"}
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
    const text = `Akun ${credentials.name}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`
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
                  ? "Akun sudah dibuat"
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
