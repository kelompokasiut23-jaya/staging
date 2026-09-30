"use client"

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  PackageIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatNumber, isDone, isLate } from "@/lib/production"
import { useOrders, useToday } from "@/lib/store"

export function SectionCards() {
  const orders = useOrders()
  const today = useToday()

  const active = orders.filter((o) => !isDone(o))
  const finished = orders.filter(isDone)
  const late = orders.filter((o) => isLate(o, today))
  const urgent = active.filter((o) => o.priority === "urgent")

  const targetUnits = active.reduce((sum, o) => sum + o.quantity, 0)
  const producedUnits = active.reduce((sum, o) => sum + o.produced, 0)
  const unitPercent = targetUnits
    ? Math.round((producedUnits / targetUnits) * 100)
    : 0
  const finishedPercent = orders.length
    ? Math.round((finished.length / orders.length) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Order berjalan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(active.length)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {formatNumber(orders.length)} order tercatat
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Belum selesai dikerjakan <ClipboardListIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {urgent.length > 0
              ? `${urgent.length} di antaranya mendesak`
              : "Tidak ada yang mendesak"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unit sudah jadi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(producedUnits)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">{unitPercent}%</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dari {formatNumber(targetUnits)} unit yang dipesan{" "}
            <PackageIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Hanya menghitung order yang berjalan
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Order selesai</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(finished.length)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">{finishedPercent}% dari semua order</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sudah diterima pelanggan <CheckCircle2Icon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {formatNumber(active.length)} order lagi masih dikerjakan
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Terlambat</CardDescription>
          <CardTitle
            className={
              "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl " +
              (late.length > 0 ? "text-destructive" : "")
            }
          >
            {formatNumber(late.length)}
          </CardTitle>
          <CardAction>
            <Badge variant={late.length > 0 ? "destructive" : "outline"}>
              {late.length > 0 ? "Perlu tindakan" : "Aman"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {late.length > 0
              ? "Sudah lewat batas waktu"
              : "Tidak ada order yang terlambat"}{" "}
            <AlertTriangleIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Order yang belum selesai</div>
        </CardFooter>
      </Card>
    </div>
  )
}
