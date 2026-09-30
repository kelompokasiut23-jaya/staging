"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { dailyProduction, formatChartDay, formatNumber } from "@/lib/production"
import { useOrders, useToday } from "@/lib/store"

const RANGES = [
  { value: "7", label: "7 hari terakhir" },
  { value: "30", label: "30 hari terakhir" },
  { value: "90", label: "90 hari terakhir" },
]

const chartConfig = {
  units: {
    label: "Unit jadi",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const orders = useOrders()
  const today = useToday()
  const [range, setRange] = React.useState("30")

  const data = React.useMemo(
    () => dailyProduction(orders, Number(range), today),
    [orders, range, today]
  )
  const total = data.reduce((sum, item) => sum + item.units, 0)
  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? ""

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Hasil produksi per hari</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {formatNumber(total)} unit selesai dikerjakan dalam{" "}
            {rangeLabel.toLowerCase()}
          </span>
          <span className="@[540px]/card:hidden">
            {formatNumber(total)} unit · {rangeLabel.toLowerCase()}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[range]}
            onValueChange={(value) => setRange(value[0] ?? "30")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {RANGES.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value}>
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={range}
            items={RANGES}
            onValueChange={(value) => value && setRange(value)}
          >
            <SelectTrigger
              className="flex w-44 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang waktu"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {RANGES.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="rounded-lg"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillUnits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-units)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-units)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatChartDay}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatChartDay(String(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="units"
              type="monotone"
              fill="url(#fillUnits)"
              stroke="var(--color-units)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
