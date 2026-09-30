"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClipboardListIcon,
  PackageIcon,
} from "lucide-react"

import { NewOrderDialog } from "@/components/new-order-dialog"
import { NewProductDialog } from "@/components/new-product-dialog"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { LateBadge, PriorityBadge, StageBadge } from "@/components/order-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  STAGES,
  formatDate,
  formatDateTime,
  formatNumber,
  isDone,
  isLate,
  progressPercent,
  stageLabel,
  type Order,
} from "@/lib/production"
import { useOrders, useProducts, useToday } from "@/lib/store"

export default function DashboardPage() {
  const orders = useOrders()
  const products = useProducts()
  const today = useToday()
  const [selected, setSelected] = useState<string | null>(null)

  const active = orders.filter((o) => !isDone(o))
  const late = orders.filter((o) => isLate(o, today))
  const finished = orders.filter(isDone)
  const targetUnits = active.reduce((sum, o) => sum + o.quantity, 0)
  const producedUnits = active.reduce((sum, o) => sum + o.produced, 0)
  const unitPercent = targetUnits
    ? Math.round((producedUnits / targetUnits) * 100)
    : 0

  const attention = active
    .filter((o) => isLate(o, today) || o.priority === "urgent")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const activity = orders
    .flatMap((o) => o.history.map((h) => ({ ...h, order: o })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6)

  if (orders.length === 0) {
    return (
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Produksi
          </h1>
          <p className="text-sm text-muted-foreground">
            Di sini Anda bisa melihat ringkasan order dan tahap produksi.
          </p>
        </div>
        <GettingStarted
          hasProducts={products.length > 0}
          onCreated={setSelected}
        />
        <OrderDetailSheet
          orderId={selected}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Produksi
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan order dan tahap produksi terkini.
          </p>
        </div>
        <NewOrderDialog onCreated={setSelected} className="w-full sm:w-auto" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={ClipboardListIcon}
          label="Order aktif"
          value={formatNumber(active.length)}
          hint={`${formatNumber(orders.length)} order tercatat`}
        />
        <Kpi
          icon={PackageIcon}
          label="Unit sudah jadi"
          value={formatNumber(producedUnits)}
          hint={`${unitPercent}% dari ${formatNumber(targetUnits)} unit`}
        />
        <Kpi
          icon={CheckCircle2Icon}
          label="Order selesai"
          value={formatNumber(finished.length)}
          hint="Sudah diterima pelanggan"
        />
        <Kpi
          icon={AlertTriangleIcon}
          label="Terlambat"
          value={formatNumber(late.length)}
          hint="Melewati batas waktu"
          tone={late.length > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order per tahap</CardTitle>
            <CardDescription>
              Jumlah order yang masih berjalan di setiap tahap.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {STAGES.filter((s) => s.key !== "selesai").map((stage) => {
              const inStage = active.filter((o) => o.stage === stage.key)
              const units = inStage.reduce((sum, o) => sum + o.quantity, 0)
              const share = active.length
                ? (inStage.length / active.length) * 100
                : 0
              return (
                <div key={stage.key} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{stage.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {inStage.length} order · {formatNumber(units)} unit
                    </span>
                  </div>
                  <Progress
                    value={share}
                    aria-label={`Order di tahap ${stage.label}`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas terbaru</CardTitle>
            <CardDescription>
              Perubahan tahap yang baru dicatat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4">
              {activity.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(entry.order.id)}
                    className="w-full rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <p className="text-sm font-medium">
                      <span className="font-mono text-xs">
                        {entry.order.id}
                      </span>{" "}
                      <span className="text-muted-foreground">→</span>{" "}
                      {stageLabel(entry.stage)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(entry.at)} · {entry.order.product}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perlu perhatian</CardTitle>
          <CardDescription>
            Order yang terlambat atau berprioritas mendesak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attention.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada order yang terlambat atau mendesak. Semua aman.
            </p>
          ) : (
            <ul className="divide-y">
              {attention.map((order) => (
                <AttentionRow
                  key={order.id}
                  order={order}
                  late={isLate(order, today)}
                  onSelect={() => setSelected(order.id)}
                />
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/orders" />}
            >
              Lihat semua order
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <OrderDetailSheet
        orderId={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
  tone?: "default" | "danger"
}) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs sm:text-sm">{label}</span>
          <Icon
            className={tone === "danger" ? "size-4 text-destructive" : "size-4"}
          />
        </div>
        <p
          className={
            "text-2xl font-semibold tabular-nums " +
            (tone === "danger" ? "text-destructive" : "")
          }
        >
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function AttentionRow({
  order,
  late,
  onSelect,
}: {
  order: Order
  late: boolean
  onSelect: () => void
}) {
  const percent = progressPercent(order)
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full gap-2 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[1fr_12rem] sm:items-center sm:gap-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              {order.id}
            </span>
            <StageBadge stage={order.stage} />
            <PriorityBadge priority={order.priority} />
            {late && <LateBadge />}
          </div>
          <p className="mt-1 truncate text-sm font-medium">{order.product}</p>
          <p className="truncate text-xs text-muted-foreground">
            {order.customer} · Batas waktu {formatDate(order.dueDate)}
          </p>
        </div>
        <div className="grid gap-1">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {formatNumber(order.produced)} / {formatNumber(order.quantity)}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} aria-label="Progres pengerjaan" />
        </div>
      </button>
    </li>
  )
}

function GettingStarted({
  hasProducts,
  onCreated,
}: {
  hasProducts: boolean
  onCreated: (orderId: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mulai dari sini</CardTitle>
        <CardDescription>
          Belum ada data. Ikuti dua langkah berikut secara berurutan, lalu
          ringkasan produksi akan muncul di halaman ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Step
          number={1}
          done={hasProducts}
          title="Tambah produk"
          description="Tulis nama barang yang Anda produksi, misalnya “Kursi Kantor”."
        >
          {hasProducts ? (
            <p className="text-sm text-muted-foreground">
              Sudah selesai. Produk sudah ada.
            </p>
          ) : (
            <NewProductDialog className="w-full sm:w-auto" />
          )}
        </Step>

        <Step
          number={2}
          done={false}
          disabled={!hasProducts}
          title="Catat order pertama"
          description="Isi siapa yang memesan, berapa jumlahnya, kapan batas waktunya, dan tahap produksi yang sedang berjalan."
        >
          <NewOrderDialog
            onCreated={onCreated}
            className="w-full sm:w-auto"
            align="start"
            disabledReason="Selesaikan langkah 1 dulu agar tombol ini aktif."
          />
        </Step>
      </CardContent>
    </Card>
  )
}

function Step({
  number,
  done,
  disabled = false,
  title,
  description,
  children,
}: {
  number: number
  done: boolean
  disabled?: boolean
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className={"flex gap-3 " + (disabled ? "opacity-80" : "")}>
      <div
        className={
          "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium " +
          (done
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-muted")
        }
      >
        {done ? <CheckIcon className="size-4" /> : number}
      </div>
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-1.5 sm:items-start">{children}</div>
      </div>
    </div>
  )
}
