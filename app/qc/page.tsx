"use client"

import { useState } from "react"
import { ClipboardCheckIcon, InboxIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { QcTaskCard } from "@/components/qc-task-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNow } from "@/hooks/use-now"
import {
  formatDay,
  formatNumber,
  formatPercent,
  totals,
  type QcTask,
  type TaskStatus,
} from "@/lib/qc"
import { RoleGate } from "@/components/role-gate"
import { useTasks } from "@/lib/qc-store"
import type { User } from "@/lib/qc"

type Filter = "semua" | TaskStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "belum", label: "Belum dimulai" },
  { value: "diperiksa", label: "Sedang diperiksa" },
  { value: "selesai", label: "Selesai" },
]

const EMPTY_TEXT: Record<Filter, string> = {
  semua: "",
  belum: "Semua tugas sudah mulai diperiksa.",
  diperiksa:
    "Tidak ada tugas yang sedang diperiksa. Buka tugas yang belum dimulai untuk mulai mengisi hasil.",
  selesai:
    "Belum ada tugas yang selesai. Tugas masuk ke sini setelah Anda menekan “Tandai selesai”.",
}

export default function MyTasksPage() {
  return <RoleGate roles={["qc"]}>{(user) => <MyTasks user={user} />}</RoleGate>
}

function MyTasks({ user }: { user: User }) {
  const all = useTasks()
  const tasks = all?.filter((t) => t.assignedTo === user.id) ?? null
  const now = useNow()
  const [filter, setFilter] = useState<Filter>("semua")

  if (tasks === null) {
    return (
      <div className="grid gap-4 px-4 py-4 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const sorted = [...tasks].sort(
    (a, b) =>
      Number(a.status === "selesai") - Number(b.status === "selesai") ||
      a.deadline.localeCompare(b.deadline)
  )
  const visible = sorted.filter(
    (t) => filter === "semua" || t.status === filter
  )
  const count = (f: Filter) =>
    f === "semua" ? tasks.length : tasks.filter((t) => t.status === f).length

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Halo, {user.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {now > 0 ? `${formatDay(now)} · ` : ""}Tugas QC Anda di {user.line}.
          Buka sebuah tugas untuk mengisi jumlah barang yang lolos dan defect.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="px-4 lg:px-6">
          <EmptyState
            icon={InboxIcon}
            title="Belum ada tugas untuk Anda"
            description={`Tugas akan muncul di sini setelah admin memasukkan barang yang harus Anda periksa. Anda tidak perlu melakukan apa pun sampai tugas masuk.`}
          />
        </div>
      ) : (
        <>
          <Summary tasks={tasks} />

          <div className="-mx-0 overflow-x-auto px-4 lg:px-6">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}{" "}
                    <Badge variant="secondary">{count(f.value)}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="px-4 lg:px-6">
            {visible.length === 0 ? (
              <EmptyState
                icon={ClipboardCheckIcon}
                title="Tidak ada tugas di sini"
                description={EMPTY_TEXT[filter]}
              />
            ) : (
              <ul className="grid gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
                {visible.map((task) => (
                  <li key={task.id}>
                    <QcTaskCard task={task} now={now} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Summary({ tasks }: { tasks: QcTask[] }) {
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
  const done = tasks.filter((t) => t.status === "selesai").length
  const percent = all.target ? Math.round((all.checked / all.target) * 100) : 0
  const defectRate = all.checked ? (all.defect / all.checked) * 100 : 0

  const cards = [
    {
      label: "Target hari ini",
      value: formatNumber(all.target),
      badge: `${tasks.length} tugas`,
      foot: `${done} tugas sudah selesai`,
    },
    {
      label: "Sudah diperiksa",
      value: formatNumber(all.checked),
      badge: `${percent}%`,
      foot: `Sisa ${formatNumber(all.target - all.checked)} barang`,
    },
    {
      label: "Lolos QC",
      value: formatNumber(all.passed),
      badge: all.checked ? formatPercent(100 - defectRate) : "-",
      foot: "Dari barang yang sudah diperiksa",
    },
    {
      label: "Defect",
      value: formatNumber(all.defect),
      badge: all.checked ? formatPercent(defectRate) : "-",
      foot: "Barang yang tidak lolos",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:gap-4 lg:px-6 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((c) => (
        <Card key={c.label} className="@container/card">
          <CardHeader>
            <CardDescription>{c.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {c.value}
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
