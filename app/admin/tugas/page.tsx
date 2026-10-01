"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, FileSearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { DisabledReason, EmptyState } from "@/components/empty-state"
import { OverdueBadge, StatusBadge } from "@/components/qc-badges"
import { RoleGate } from "@/components/role-gate"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNow } from "@/hooks/use-now"
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  isOverdue,
  timeLeft,
  totals,
} from "@/lib/qc"
import { deleteTask, useTasks, useUsers } from "@/lib/qc-store"

export default function AdminTaskPage() {
  return (
    <Suspense>
      <RoleGate role="admin">{() => <AdminTaskDetail />}</RoleGate>
    </Suspense>
  )
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 w-fit"
      render={<Link href="/admin/" />}
    >
      <ArrowLeftIcon data-icon="inline-start" />
      Kembali ke Daftar Barang
    </Button>
  )
}

function AdminTaskDetail() {
  const router = useRouter()
  const id = useSearchParams().get("id")
  const tasks = useTasks() ?? []
  const users = useUsers() ?? []
  const now = useNow()
  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="grid gap-4 px-4 py-4 md:py-6 lg:px-6">
        <BackLink />
        <EmptyState
          icon={FileSearchIcon}
          title="Barang tidak ditemukan"
          description="Data ini mungkin sudah dihapus. Kembali ke daftar barang untuk memilih yang lain."
        />
      </div>
    )
  }

  const qc = users.find((u) => u.id === task.assignedTo)
  const t = totals(task)
  const overdue = now > 0 && isOverdue(task, now)

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <BackLink />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {task.brand} · <span className="font-mono">{task.id}</span>
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{task.item}</h2>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={task.status} />
            {overdue && <OverdueBadge />}
          </div>
        </div>

        <div className="grid gap-1 sm:justify-items-end">
          <Dialog>
            <DialogTrigger
              disabled={task.status !== "belum"}
              render={<Button variant="outline" className="w-full sm:w-auto" />}
            >
              <Trash2Icon data-icon="inline-start" />
              Hapus barang
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus {task.item}?</DialogTitle>
                <DialogDescription>
                  Barang ini akan hilang dari halaman {qc?.name ?? "QC"}.
                  Tindakan ini tidak bisa dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Batal
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteTask(task.id)
                    toast.success("Barang dihapus")
                    router.push("/admin/")
                  }}
                >
                  Ya, hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {task.status !== "belum" && (
            <DisabledReason className="sm:text-right">
              Tidak bisa dihapus karena QC sudah mulai memeriksa.
            </DisabledReason>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm @3xl/main:grid-cols-4">
            <Info label="Client" value={task.brand} />
            <Info label="Warna" value={task.color} />
            <Info label="QC" value={`${qc?.name ?? "-"} · ${task.line}`} />
            <Info
              label="Batas selesai"
              value={
                <>
                  {formatDateTime(task.deadline)}
                  {task.status !== "selesai" && now > 0 && (
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
            <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="font-medium">Catatan untuk QC: </span>
              {task.note}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil QC</CardTitle>
          <CardDescription>
            {task.status === "selesai" && task.finishedAt
              ? `Laporan final dari ${qc?.name ?? "QC"}, ${formatDateTime(task.finishedAt)}.`
              : "Angka sementara. Berubah setiap kali QC menyimpan hasil."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <div className="flex justify-between text-sm tabular-nums">
              <span className="text-muted-foreground">
                Diperiksa {formatNumber(t.checked)} dari{" "}
                {formatNumber(t.target)}
              </span>
              <span className="font-medium">{t.percent}%</span>
            </div>
            <Progress value={t.percent} aria-label="Progres pemeriksaan" />
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Ukuran</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Lolos</TableHead>
                  <TableHead className="text-right">Defect</TableHead>
                  <TableHead className="text-right">Belum diperiksa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {task.sizes.map((s) => (
                  <TableRow key={s.size}>
                    <TableCell className="font-medium">{s.size}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(s.target)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(s.passed)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(s.defect)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(s.target - s.passed - s.defect)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(t.target)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(t.passed)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(t.defect)}
                    {t.checked > 0 && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {formatPercent(t.defectRate)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(t.remaining)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat dari QC</CardTitle>
        </CardHeader>
        <CardContent>
          {task.logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              QC belum menyimpan hasil apa pun.
            </p>
          ) : (
            <ol className="grid gap-3">
              {[...task.logs].reverse().map((log) => (
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
