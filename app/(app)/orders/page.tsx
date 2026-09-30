"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ChevronRightIcon,
  ClipboardListIcon,
  PackageIcon,
  SearchIcon,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { NewOrderDialog } from "@/components/new-order-dialog"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { LateBadge, PriorityBadge, StageBadge } from "@/components/order-badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  STAGES,
  formatDate,
  formatNumber,
  isDone,
  isLate,
  progressPercent,
  type Order,
} from "@/lib/production"
import { useOrders, useProducts, useToday } from "@/lib/store"

type Scope = "semua" | "aktif" | "terlambat" | "selesai"

const STAGE_FILTER = [
  { value: "semua", label: "Semua tahap" },
  ...STAGES.map((s) => ({ value: s.key as string, label: s.label })),
]

export default function OrdersPage() {
  const orders = useOrders()
  const products = useProducts()
  const today = useToday()
  const [scope, setScope] = useState<Scope>("semua")
  const [stage, setStage] = useState("semua")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      semua: orders.length,
      aktif: orders.filter((o) => !isDone(o)).length,
      terlambat: orders.filter((o) => isLate(o, today)).length,
      selesai: orders.filter(isDone).length,
    }),
    [orders, today]
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (scope === "aktif" && isDone(o)) return false
      if (scope === "terlambat" && !isLate(o, today)) return false
      if (scope === "selesai" && !isDone(o)) return false
      if (stage !== "semua" && o.stage !== stage) return false
      if (!q) return true
      return [o.id, o.customer, o.product].some((v) =>
        v.toLowerCase().includes(q)
      )
    })
  }, [orders, scope, stage, query, today])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Daftar Order</h1>
          <p className="text-sm text-muted-foreground">
            Catat order masuk dan perbarui tahap produksinya.
          </p>
        </div>
        {(products.length === 0 || orders.length > 0) && (
          <NewOrderDialog
            onCreated={setSelected}
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {orders.length === 0 &&
        (products.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="Belum ada produk, jadi order belum bisa dicatat"
            description="Setiap order harus dikaitkan dengan produk. Tambahkan dulu produk yang Anda buat di menu Produk, lalu kembali ke halaman ini untuk mencatat order."
          >
            <Button
              render={<Link href="/produk" />}
              className="w-full sm:w-auto"
            >
              Buka menu Produk
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={ClipboardListIcon}
            title="Belum ada order"
            description="Klik tombol di bawah untuk mencatat order pertama. Setelah tercatat, Anda bisa memperbarui tahap pengerjaannya kapan saja dengan mengklik order tersebut."
          >
            <NewOrderDialog
              onCreated={setSelected}
              className="w-full sm:w-auto"
            />
          </EmptyState>
        ))}

      {orders.length > 0 && (
        <>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <TabsList>
                <TabsTrigger value="semua">Semua ({counts.semua})</TabsTrigger>
                <TabsTrigger value="aktif">Aktif ({counts.aktif})</TabsTrigger>
                <TabsTrigger value="terlambat">
                  Terlambat ({counts.terlambat})
                </TabsTrigger>
                <TabsTrigger value="selesai">
                  Selesai ({counts.selesai})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode, pelanggan, atau produk"
                className="pl-8"
                aria-label="Cari order"
              />
            </div>
            <Select
              value={stage}
              items={STAGE_FILTER}
              onValueChange={(v) => v && setStage(v)}
            >
              <SelectTrigger
                className="w-full sm:w-48"
                aria-label="Filter tahap"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_FILTER.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {rows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada order yang cocok. Coba ubah kata pencarian atau
                pilihan filter.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="hidden md:block">
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Order</TableHead>
                        <TableHead>Tahap</TableHead>
                        <TableHead className="w-48">Sudah jadi</TableHead>
                        <TableHead>Batas waktu</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((order) => (
                        <DesktopRow
                          key={order.id}
                          order={order}
                          late={isLate(order, today)}
                          onSelect={() => setSelected(order.id)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <ul className="grid gap-3 md:hidden">
                {rows.map((order) => (
                  <MobileCard
                    key={order.id}
                    order={order}
                    late={isLate(order, today)}
                    onSelect={() => setSelected(order.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <OrderDetailSheet
        orderId={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

function DesktopRow({
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
    <TableRow className="cursor-pointer" onClick={onSelect}>
      <TableCell className="pl-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="block font-medium">{order.product}</span>
          <span className="block text-xs text-muted-foreground">
            <span className="font-mono">{order.id}</span> · {order.customer}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <StageBadge stage={order.stage} />
      </TableCell>
      <TableCell>
        <div className="grid gap-1">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {formatNumber(order.produced)} / {formatNumber(order.quantity)}
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} aria-label="Progres pengerjaan" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap">{formatDate(order.dueDate)}</span>
          {late && <LateBadge />}
        </div>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={order.priority} />
      </TableCell>
      <TableCell>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}

function MobileCard({
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
        className="w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Card size="sm">
          <CardContent className="grid gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{order.product}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{order.id}</span> ·{" "}
                  {order.customer}
                </p>
              </div>
              <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <StageBadge stage={order.stage} />
              <PriorityBadge priority={order.priority} />
              {late && <LateBadge />}
            </div>

            <div className="grid gap-1">
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>
                  {formatNumber(order.produced)} /{" "}
                  {formatNumber(order.quantity)} unit
                </span>
                <span>{percent}%</span>
              </div>
              <Progress value={percent} aria-label="Progres pengerjaan" />
            </div>

            <p className="text-xs text-muted-foreground">
              Batas waktu {formatDate(order.dueDate)}
            </p>
          </CardContent>
        </Card>
      </button>
    </li>
  )
}
