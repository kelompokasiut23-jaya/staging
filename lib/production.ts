export const STAGES = [
  {
    key: "diterima",
    label: "Order Diterima",
    description: "Order baru saja dicatat",
  },
  {
    key: "bahan",
    label: "Persiapan Bahan",
    description: "Bahan baku disiapkan",
  },
  {
    key: "produksi",
    label: "Produksi",
    description: "Sedang diproduksi di lini",
  },
  {
    key: "qc",
    label: "Pemeriksaan Kualitas",
    description: "Barang diperiksa sebelum dikemas",
  },
  { key: "packing", label: "Pengemasan", description: "Barang jadi dikemas" },
  { key: "pengiriman", label: "Pengiriman", description: "Dalam proses kirim" },
  {
    key: "selesai",
    label: "Selesai",
    description: "Order telah diterima pelanggan",
  },
] as const

export type StageKey = (typeof STAGES)[number]["key"]

export const PRIORITIES = [
  { key: "normal", label: "Normal" },
  { key: "tinggi", label: "Tinggi" },
  { key: "urgent", label: "Mendesak" },
] as const

export type PriorityKey = (typeof PRIORITIES)[number]["key"]

export interface HistoryEntry {
  id: string
  at: string
  stage: StageKey
  produced: number
  note: string
}

export interface Product {
  id: string
  name: string
  note: string
  createdAt: string
}

export interface NewProductInput {
  name: string
  note: string
}

export interface Order {
  id: string
  customer: string
  productId: string
  product: string
  quantity: number
  produced: number
  stage: StageKey
  priority: PriorityKey
  dueDate: string
  createdAt: string
  notes: string
  history: HistoryEntry[]
}

export interface NewOrderInput {
  customer: string
  productId: string
  quantity: number
  priority: PriorityKey
  dueDate: string
  stage: StageKey
  produced: number
  notes: string
}

export interface ProgressUpdateInput {
  stage: StageKey
  produced: number
  note: string
}

const TIME_ZONE = "Asia/Jakarta"

export const FALLBACK_TODAY = "2026-01-01"

export function stageIndex(stage: StageKey) {
  return STAGES.findIndex((s) => s.key === stage)
}

export function stageLabel(stage: StageKey) {
  return STAGES[stageIndex(stage)].label
}

export function priorityLabel(priority: PriorityKey) {
  return PRIORITIES.find((p) => p.key === priority)?.label ?? priority
}

export function isDone(order: Order) {
  return order.stage === "selesai"
}

export function isLate(order: Order, today: string) {
  return !isDone(order) && order.dueDate < today
}

export function progressPercent(order: Order) {
  if (order.quantity <= 0) return 0
  return Math.min(100, Math.round((order.produced / order.quantity) * 100))
}

export function daysUntil(dueDate: string, today: string) {
  const day = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(dueDate) - Date.parse(today)) / day)
}

export function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date()
  )
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

export function formatDate(value: string) {
  const date =
    value.length === 10 ? new Date(`${value}T00:00:00+07:00`) : new Date(value)
  return dateFormatter.format(date)
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}
