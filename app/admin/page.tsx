"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRightIcon, PackagePlusIcon, SearchIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { OverdueBadge, StatusBadge } from "@/components/qc-badges"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import {
  formatNumber,
  formatPercent,
  formatTime,
  isOverdue,
  totals,
  type QcTask,
  type TaskStatus,
  type User,
} from "@/lib/qc"
import { useTasks, useUsers } from "@/lib/qc-store"

type Filter = "semua" | TaskStatus | "terlambat"

export default function AdminTasksPage() {
  return (
    <RoleGate roles={["super_admin", "admin"]}>
      {(user) => <AdminTasks user={user} />}
    </RoleGate>
  )
}

function AdminTasks({ user }: { user: User }) {
  const canManage = user.role === "super_admin"
  const tasks = useTasks() ?? []
  const users = useUsers() ?? []
  const now = useNow()
  const [filter, setFilter] = useState<Filter>("semua")
  const [query, setQuery] = useState("")

  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "-"
  const late = (t: QcTask) => now > 0 && isOverdue(t, now)

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "semua", label: "Semua", count: tasks.length },
    {
      value: "belum",
      label: "Belum dimulai",
      count: tasks.filter((t) => t.status === "belum").length,
    },
    {
      value: "diperiksa",
      label: "Sedang diperiksa",
      count: tasks.filter((t) => t.status === "diperiksa").length,
    },
    {
      value: "selesai",
      label: "Selesai",
      count: tasks.filter((t) => t.status === "selesai").length,
    },
    {
      value: "terlambat",
      label: "Terlambat",
      count: tasks.filter(late).length,
    },
  ]

  const q = query.trim().toLowerCase()
  const visible = [...tasks]
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .filter((t) =>
      filter === "semua"
        ? true
        : filter === "terlambat"
          ? late(t)
          : t.status === filter
    )
    .filter(
      (t) =>
        !q ||
        [t.id, t.brand, t.item, t.color, t.line, nameOf(t.assignedTo)].some(
          (v) => v.toLowerCase().includes(q)
        )
    )

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="text-sm text-muted-foreground">
          {canManage
            ? "Semua barang yang harus diperiksa QC. Angka lolos dan defect diperbarui oleh QC masing-masing."
            : `Barang dan hasil QC di ${user.line}. Angka lolos dan defect diperbarui oleh QC masing-masing.`}
        </p>
        {canManage && (
          <Button
            render={<Link href="/admin/tugas/baru/" />}
            className="w-full sm:w-auto"
          >
            <PackagePlusIcon data-icon="inline-start" />
            Tambah barang
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="px-4 lg:px-6">
          <EmptyState
            icon={PackagePlusIcon}
            title="Belum ada barang untuk diperiksa"
            description={
              canManage
                ? "Tambahkan barang yang masuk: nama client, item, warna, jumlah per ukuran, dan QC yang akan memeriksanya. Barang langsung muncul di halaman QC tersebut."
                : `Belum ada barang untuk ${user.line}. Barang akan muncul di sini setelah super admin menambahkannya.`
            }
          >
            {canManage && (
              <Button render={<Link href="/admin/tugas/baru/" />}>
                Tambah barang pertama
              </Button>
            )}
          </EmptyState>
        </div>
      ) : (
        <>
          <Summary tasks={tasks} lateCount={filters[4].count} />

          <div className="flex flex-col gap-3 px-4 lg:px-6">
            <div className="overflow-x-auto">
              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as Filter)}
              >
                <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
                  {filters.map((f) => (
                    <TabsTrigger key={f.value} value={f.value}>
                      {f.label} <Badge variant="secondary">{f.count}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari client, item, warna, line, atau nama QC"
                className="pl-8"
                aria-label="Cari barang"
              />
            </div>

            {visible.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                Tidak ada barang yang cocok. Coba ubah kata pencarian atau
                pilihan tab.
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-lg border md:block">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Client / Item</TableHead>
                        <TableHead>QC</TableHead>
                        <TableHead>Batas selesai</TableHead>
                        <TableHead className="w-52">Diperiksa</TableHead>
                        <TableHead className="text-right">Lolos</TableHead>
                        <TableHead className="text-right">Defect</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((t) => (
                        <Row
                          key={t.id}
                          task={t}
                          qc={nameOf(t.assignedTo)}
                          late={late(t)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ul className="grid gap-3 md:hidden">
                  {visible.map((t) => (
                    <MobileCard
                      key={t.id}
                      task={t}
                      qc={nameOf(t.assignedTo)}
                      late={late(t)}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function href(task: QcTask) {
  return `/admin/tugas/?id=${task.id}`
}

function Row({ task, qc, late }: { task: QcTask; qc: string; late: boolean }) {
  const t = totals(task)
  return (
    <TableRow className="relative">
      <TableCell>
        <Link href={href(task)} className="after:absolute after:inset-0">
          <span className="block font-medium">{task.brand}</span>
          <span className="block text-xs text-muted-foreground">
            {task.item} · {task.color} ·{" "}
            <span className="font-mono">{task.id}</span>
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <span className="block">{qc}</span>
        <span className="block text-xs text-muted-foreground">{task.line}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatTime(task.deadline)}
        {late && <OverdueBadge className="ml-1.5" />}
      </TableCell>
      <TableCell>
        <div className="grid gap-1">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {formatNumber(t.checked)} / {formatNumber(t.target)}
            </span>
            <span>{t.percent}%</span>
          </div>
          <Progress value={t.percent} aria-label="Progres pemeriksaan" />
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatNumber(t.passed)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatNumber(t.defect)}
      </TableCell>
      <TableCell>
        <StatusBadge status={task.status} />
      </TableCell>
      <TableCell>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}

function MobileCard({
  task,
  qc,
  late,
}: {
  task: QcTask
  qc: string
  late: boolean
}) {
  const t = totals(task)
  return (
    <li>
      <Link href={href(task)} className="block rounded-xl">
        <Card size="sm">
          <CardContent className="grid gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{task.brand}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {task.item} · {task.color}
                </p>
              </div>
              <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={task.status} />
              {late && <OverdueBadge />}
            </div>
            <div className="grid gap-1">
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>
                  Diperiksa {formatNumber(t.checked)} / {formatNumber(t.target)}
                </span>
                <span>{t.percent}%</span>
              </div>
              <Progress value={t.percent} aria-label="Progres pemeriksaan" />
            </div>
            <p className="text-xs text-muted-foreground">
              {qc} · {task.line} · Batas {formatTime(task.deadline)} · Lolos{" "}
              {formatNumber(t.passed)} · Defect {formatNumber(t.defect)}
            </p>
          </CardContent>
        </Card>
      </Link>
    </li>
  )
}

function Summary({ tasks, lateCount }: { tasks: QcTask[]; lateCount: number }) {
  const all = tasks.reduce(
    (acc, task) => {
      const t = totals(task)
      acc.target += t.target
      acc.checked += t.checked
      acc.passed += t.passed
      acc.defect += t.defect
      return acc
    },
    { target: 0, checked: 0, passed: 0, defect: 0 }
  )
  const defectRate = all.checked ? (all.defect / all.checked) * 100 : 0
  const cards = [
    {
      label: "Total barang",
      value: all.target,
      badge: `${tasks.length} tugas`,
      foot: `${tasks.filter((t) => t.status === "selesai").length} tugas selesai`,
    },
    {
      label: "Sudah diperiksa",
      value: all.checked,
      badge: `${all.target ? Math.round((all.checked / all.target) * 100) : 0}%`,
      foot: `Sisa ${formatNumber(all.target - all.checked)} barang`,
    },
    {
      label: "Defect",
      value: all.defect,
      badge: all.checked ? formatPercent(defectRate) : "-",
      foot: `Lolos ${formatNumber(all.passed)} barang`,
    },
    {
      label: "Terlambat",
      value: lateCount,
      badge: lateCount > 0 ? "Perlu dicek" : "Aman",
      foot: "Lewat batas waktu, belum selesai",
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:gap-4 lg:px-6 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((c) => (
        <Card key={c.label} className="@container/card">
          <CardHeader>
            <CardDescription>{c.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatNumber(c.value)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <Badge variant="outline">{c.badge}</Badge>
            <div className="text-muted-foreground">{c.foot}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
