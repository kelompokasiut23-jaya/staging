"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileSearchIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { OverdueBadge, StatusBadge } from "@/components/qc-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useNow } from "@/hooks/use-now"
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatTime,
  isComplete,
  isOverdue,
  timeLeft,
  totals,
  type QcTask,
} from "@/lib/qc"
import { RoleGate } from "@/components/role-gate"
import { finishTask, saveCounts, useTasks } from "@/lib/qc-store"
import type { User } from "@/lib/qc"

export default function TaskPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RoleGate role="qc">{(user) => <TaskLoader user={user} />}</RoleGate>
    </Suspense>
  )
}

function Loading() {
  return (
    <div className="grid gap-4 px-4 py-4 md:py-6 lg:px-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 w-fit"
      render={<Link href="/qc/" />}
    >
      <ArrowLeftIcon data-icon="inline-start" />
      Kembali ke Tugas Saya
    </Button>
  )
}

function TaskLoader({ user }: { user: User }) {
  const id = useSearchParams().get("id")
  const tasks = useTasks()

  if (tasks === null) return <Loading />

  const task = tasks.find((t) => t.id === id)
  // QC hanya boleh membuka tugas yang ditugaskan kepadanya.
  if (!task || task.assignedTo !== user.id) {
    return (
      <div className="grid gap-4 px-4 py-4 md:py-6 lg:px-6">
        <BackLink />
        <EmptyState
          icon={FileSearchIcon}
          title="Tugas tidak ditemukan"
          description={`Tugas ini tidak ada atau tidak ditugaskan kepada Anda. Kembali ke daftar tugas untuk memilih tugas yang harus Anda periksa.`}
        />
      </div>
    )
  }

  // key: form kembali ke data terbaru setiap kali tugas disimpan.
  return <TaskDetail key={task.updatedAt} task={task} user={user} />
}

type Draft = Record<string, { passed: string; defect: string }>

function toDraft(task: QcTask): Draft {
  return Object.fromEntries(
    task.sizes.map((s) => [
      s.size,
      { passed: String(s.passed), defect: String(s.defect) },
    ])
  )
}

function parse(value: string) {
  if (value.trim() === "") return 0
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 ? n : NaN
}

function TaskDetail({ task, user }: { task: QcTask; user: User }) {
  const now = useNow()
  const [draft, setDraft] = useState<Draft>(() => toDraft(task))
  const [note, setNote] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const locked = task.status === "selesai"
  const overdue = now > 0 && isOverdue(task, now)

  const rows = task.sizes.map((s) => {
    const passed = parse(draft[s.size].passed)
    const defect = parse(draft[s.size].defect)
    const checked = passed + defect
    let error = ""
    if (Number.isNaN(passed) || Number.isNaN(defect))
      error = "Isi dengan angka bulat, tanpa koma"
    else if (checked > s.target)
      error = `Jumlahnya ${formatNumber(checked)}, melebihi target ${formatNumber(s.target)}`
    return { ...s, passed, defect, checked, error }
  })

  const hasError = rows.some((r) => r.error)
  const changed = rows.some(
    (r, i) =>
      r.passed !== task.sizes[i].passed || r.defect !== task.sizes[i].defect
  )
  const draftTask = { sizes: rows.map((r) => ({ ...r })) }
  const t = hasError ? totals(task) : totals(draftTask)
  const saved = totals(task)
  const complete = isComplete(task)

  function setValue(size: string, field: "passed" | "defect", value: string) {
    setDraft((d) => ({ ...d, [size]: { ...d[size], [field]: value } }))
  }

  function save() {
    saveCounts(
      task.id,
      user,
      rows.map((r) => ({ size: r.size, passed: r.passed, defect: r.defect })),
      note.trim()
    )
    toast.success("Hasil pemeriksaan disimpan")
  }

  function finish() {
    finishTask(task.id, user, note.trim())
    setConfirmOpen(false)
    toast.success("Tugas selesai. Laporan sudah terkirim ke admin.")
  }

  let saveHint = ""
  if (hasError) saveHint = "Perbaiki angka yang ditandai merah dulu."
  else if (!changed && !note.trim())
    saveHint = "Belum ada perubahan untuk disimpan."

  let finishHint = ""
  if (changed) finishHint = "Simpan perubahan dulu sebelum menandai selesai."
  else if (!complete)
    finishHint = `Masih ada ${formatNumber(saved.remaining)} barang yang belum diisi. Semua ukuran harus terisi penuh (lolos + defect = target).`

  const mobileHint = hasError ? saveHint : finishHint || saveHint

  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-36 md:gap-6 md:py-6 md:pb-6 lg:px-6">
      <BackLink />

      <div className="grid gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {task.brand}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{task.item}</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={task.status} />
          {overdue && <OverdueBadge />}
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm @3xl/main:grid-cols-4">
            <Info label="Warna" value={task.color} />
            <Info label="Line" value={task.line} />
            <Info
              label="Ukuran"
              value={task.sizes.map((s) => s.size).join(", ")}
            />
            <Info
              label="Selesai paling lambat"
              value={
                <>
                  Pukul {formatTime(task.deadline)}
                  {!locked && now > 0 && (
                    <span
                      className={
                        "block text-xs font-normal " +
                        (overdue ? "text-destructive" : "text-muted-foreground")
                      }
                    >
                      {timeLeft(task.deadline, now)}
                    </span>
                  )}
                </>
              }
            />
          </dl>
          {task.note && (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="font-medium">
                Catatan dari {task.createdBy}:{" "}
              </span>
              {task.note}
            </div>
          )}
        </CardContent>
      </Card>

      {locked && task.finishedAt && (
        <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">Tugas ini sudah selesai</p>
            <p className="text-muted-foreground">
              Laporan terkirim ke {task.createdBy} pada{" "}
              {formatDateTime(task.finishedAt)}. Angka tidak bisa diubah lagi.
              Hubungi admin jika ada yang perlu diperbaiki.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hasil pemeriksaan per ukuran</CardTitle>
          <CardDescription>
            {locked
              ? "Hasil akhir yang sudah dilaporkan."
              : "Isi jumlah barang yang lolos dan yang defect untuk setiap ukuran, lalu tekan Simpan. Anda bisa menyimpan berkali-kali selama pemeriksaan berjalan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-1.5">
            <div className="flex justify-between text-sm tabular-nums">
              <span className="text-muted-foreground">
                Diperiksa {formatNumber(t.checked)} dari{" "}
                {formatNumber(t.target)}
              </span>
              <span className="font-medium">{t.percent}%</span>
            </div>
            <Progress value={t.percent} aria-label="Progres pemeriksaan" />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
              <span>
                Lolos{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(t.passed)}
                </span>
              </span>
              <span>
                Defect{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(t.defect)}
                </span>
                {t.checked > 0 && ` (${formatPercent(t.defectRate)})`}
              </span>
              <span>
                Sisa{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(t.remaining)}
                </span>
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {rows.map((row) => {
              const remaining = row.target - row.checked
              return (
                <div
                  key={row.size}
                  className={
                    "grid gap-3 rounded-lg border p-3 " +
                    (row.error ? "border-destructive/50" : "")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold">Ukuran {row.size}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      Target {formatNumber(row.target)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`passed-${row.size}`}>Lolos</Label>
                      <Input
                        id={`passed-${row.size}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={row.target}
                        className="h-11 text-base tabular-nums"
                        value={draft[row.size].passed}
                        onChange={(e) =>
                          setValue(row.size, "passed", e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        disabled={locked}
                        aria-invalid={!!row.error}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`defect-${row.size}`}>Defect</Label>
                      <Input
                        id={`defect-${row.size}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={row.target}
                        className="h-11 text-base tabular-nums"
                        value={draft[row.size].defect}
                        onChange={(e) =>
                          setValue(row.size, "defect", e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        disabled={locked}
                        aria-invalid={!!row.error}
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between rounded-md bg-muted px-3 text-sm @xl/main:col-span-1 @xl/main:flex-col @xl/main:items-start @xl/main:justify-center @xl/main:py-1">
                      <span className="py-2 text-muted-foreground @xl/main:py-0">
                        Belum diperiksa
                      </span>
                      <span className="font-semibold tabular-nums">
                        {row.error ? "-" : formatNumber(remaining)}
                      </span>
                    </div>
                  </div>
                  {row.error && (
                    <p className="text-xs text-destructive">{row.error}</p>
                  )}
                </div>
              )
            })}
          </div>

          {!locked && (
            <div className="grid gap-1.5">
              <Label htmlFor="note">
                Catatan untuk admin (boleh dikosongkan)
              </Label>
              <Textarea
                id="note"
                rows={2}
                placeholder="Contoh: banyak jahitan lepas di ukuran M"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {!locked && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="grid grid-cols-2 gap-2 md:flex md:items-start md:gap-4">
            <div className="grid gap-1 md:flex-1">
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={save}
                disabled={!!saveHint}
              >
                <SaveIcon data-icon="inline-start" />
                Simpan hasil
              </Button>
              {saveHint && (
                <p className="hidden text-xs text-muted-foreground md:block">
                  {saveHint}
                </p>
              )}
            </div>
            <div className="grid gap-1 md:max-w-sm md:justify-items-end md:text-right">
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setConfirmOpen(true)}
                disabled={!!finishHint}
              >
                <CheckCircle2Icon data-icon="inline-start" />
                Tandai selesai
              </Button>
              {finishHint && (
                <p className="hidden text-xs text-muted-foreground md:block">
                  {finishHint}
                </p>
              )}
            </div>
          </div>
          {mobileHint && (
            <p className="mt-2 text-xs text-muted-foreground md:hidden">
              {mobileHint}
            </p>
          )}
        </div>
      )}

      <History task={task} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai tugas ini selesai?</DialogTitle>
            <DialogDescription>
              Laporan akan dikirim ke {task.createdBy}:{" "}
              {formatNumber(saved.passed)} lolos dan{" "}
              {formatNumber(saved.defect)} defect dari{" "}
              {formatNumber(saved.target)} barang. Setelah itu angka tidak bisa
              diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Periksa lagi
            </DialogClose>
            <Button onClick={finish}>Ya, tandai selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function History({ task }: { task: QcTask }) {
  const logs = [...task.logs].reverse()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="size-4" /> Riwayat
        </CardTitle>
        <CardDescription>Catatan setiap kali hasil disimpan.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada. Riwayat muncul setelah Anda menyimpan hasil pertama kali.
          </p>
        ) : (
          <ol className="grid gap-3">
            {logs.map((log) => (
              <li key={log.id} className="text-sm">
                <p className="font-medium">
                  {log.action === "selesai"
                    ? "Ditandai selesai"
                    : "Hasil disimpan"}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {log.by} · {formatDateTime(log.at)}
                  </span>
                </p>
                {log.note && (
                  <p className="text-muted-foreground">{log.note}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
