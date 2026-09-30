"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  SearchIcon,
} from "lucide-react"

import { NewOrderDialog } from "@/components/new-order-dialog"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { LateBadge, PriorityBadge, StageBadge } from "@/components/order-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { useToday } from "@/lib/store"

type Scope = "semua" | "aktif" | "terlambat" | "selesai"

const STAGE_FILTER = [
  { value: "semua", label: "Semua tahap" },
  ...STAGES.map((s) => ({ value: s.key as string, label: s.label })),
]

const PAGE_SIZES = [10, 20, 30, 50]

interface Column {
  id: string
  header: string
  hideable: boolean
  cell: (order: Order) => React.ReactNode
}

function buildColumns(today: string): Column[] {
  return [
    {
      id: "Order",
      header: "Order",
      hideable: false,
      cell: (order) => (
        <div className="min-w-0">
          <span className="block font-medium">{order.product}</span>
          <span className="block text-xs text-muted-foreground">
            <span className="font-mono">{order.id}</span> · {order.customer}
          </span>
        </div>
      ),
    },
    {
      id: "Tahap",
      header: "Tahap",
      hideable: true,
      cell: (order) => <StageBadge stage={order.stage} />,
    },
    {
      id: "Sudah jadi",
      header: "Sudah jadi",
      hideable: true,
      cell: (order) => {
        const percent = progressPercent(order)
        return (
          <div className="grid w-44 gap-1">
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>
                {formatNumber(order.produced)} / {formatNumber(order.quantity)}
              </span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} aria-label="Progres pengerjaan" />
          </div>
        )
      },
    },
    {
      id: "Batas waktu",
      header: "Batas waktu",
      hideable: true,
      cell: (order) => (
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap">{formatDate(order.dueDate)}</span>
          {isLate(order, today) && <LateBadge />}
        </div>
      ),
    },
    {
      id: "Prioritas",
      header: "Prioritas",
      hideable: true,
      cell: (order) => <PriorityBadge priority={order.priority} />,
    },
  ]
}

export function DataTable({ orders }: { orders: Order[] }) {
  const today = useToday()
  const [scope, setScope] = React.useState<Scope>("semua")
  const [stage, setStage] = React.useState("semua")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [hidden, setHidden] = React.useState<string[]>([])
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const counts = {
    semua: orders.length,
    aktif: orders.filter((o) => !isDone(o)).length,
    terlambat: orders.filter((o) => isLate(o, today)).length,
    selesai: orders.filter(isDone).length,
  }

  const scopes: { value: Scope; label: string; count: number }[] = [
    { value: "semua", label: "Semua", count: counts.semua },
    { value: "aktif", label: "Berjalan", count: counts.aktif },
    { value: "terlambat", label: "Terlambat", count: counts.terlambat },
    { value: "selesai", label: "Selesai", count: counts.selesai },
  ]
  const scopeItems = scopes.map((s) => ({
    value: s.value,
    label: `${s.label} (${s.count})`,
  }))

  const rows = React.useMemo(() => {
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

  const columns = React.useMemo(() => buildColumns(today), [today])
  const visibleColumns = columns.filter((c) => !hidden.includes(c.id))

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(pageIndex, pageCount - 1)
  const pageRows = rows.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
  const first = rows.length === 0 ? 0 : currentPage * pageSize + 1
  const last = Math.min(rows.length, (currentPage + 1) * pageSize)
  const canPrevious = currentPage > 0
  const canNext = currentPage < pageCount - 1

  function changeScope(value: Scope) {
    setScope(value)
    setPageIndex(0)
  }

  return (
    <Tabs
      value={scope}
      onValueChange={(v) => changeScope(v as Scope)}
      className="w-full flex-col justify-start gap-4"
    >
      <div className="flex items-center justify-between gap-2 px-4 lg:px-6">
        <Label htmlFor="scope-selector" className="sr-only">
          Tampilkan
        </Label>
        <Select
          value={scope}
          items={scopeItems}
          onValueChange={(v) => v && changeScope(v as Scope)}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="scope-selector"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {scopeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          {scopes.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label} <Badge variant="secondary">{item.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                />
              }
            >
              <Columns3Icon data-icon="inline-start" />
              Kolom
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {columns
                .filter((column) => column.hideable)
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!hidden.includes(column.id)}
                    onCheckedChange={(checked) =>
                      setHidden((current) =>
                        checked
                          ? current.filter((id) => id !== column.id)
                          : [...current, column.id]
                      )
                    }
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NewOrderDialog onCreated={setSelected} />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 sm:flex-row lg:px-6">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPageIndex(0)
            }}
            placeholder="Cari kode, pelanggan, atau produk"
            className="pl-8"
            aria-label="Cari order"
          />
        </div>
        <Select
          value={stage}
          items={STAGE_FILTER}
          onValueChange={(v) => {
            if (!v) return
            setStage(v)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filter tahap">
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

      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            Tidak ada order yang cocok. Coba ubah kata pencarian atau pilihan
            filter.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border md:block">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableHead key={column.id}>{column.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => setSelected(order.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSelected(order.id)
                      }}
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id}>
                          {column.cell(order)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className="grid gap-3 md:hidden">
              {pageRows.map((order) => (
                <MobileCard
                  key={order.id}
                  order={order}
                  late={isLate(order, today)}
                  onSelect={() => setSelected(order.id)}
                />
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {first}–{last} dari {formatNumber(rows.length)}{" "}
                order
              </div>
              <div className="flex w-full items-center gap-6 sm:w-fit sm:gap-8">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
                    Baris per halaman
                  </Label>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(v) => {
                      if (!v) return
                      setPageSize(Number(v))
                      setPageIndex(0)
                    }}
                    items={PAGE_SIZES.map((n) => ({
                      label: `${n}`,
                      value: `${n}`,
                    }))}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-20"
                      id="rows-per-page"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectGroup>
                        {PAGE_SIZES.map((n) => (
                          <SelectItem key={n} value={`${n}`}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Halaman {currentPage + 1} dari {pageCount}
                </div>
                <div className="ml-auto flex items-center gap-2 sm:ml-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() => setPageIndex(0)}
                    disabled={!canPrevious}
                  >
                    <span className="sr-only">Ke halaman pertama</span>
                    <ChevronsLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPageIndex(currentPage - 1)}
                    disabled={!canPrevious}
                  >
                    <span className="sr-only">Halaman sebelumnya</span>
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPageIndex(currentPage + 1)}
                    disabled={!canNext}
                  >
                    <span className="sr-only">Halaman berikutnya</span>
                    <ChevronRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={!canNext}
                  >
                    <span className="sr-only">Ke halaman terakhir</span>
                    <ChevronsRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <OrderDetailSheet
        orderId={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </Tabs>
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
