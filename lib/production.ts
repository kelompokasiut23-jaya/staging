export const STAGES = [
  { key: "diterima", label: "Order Diterima", description: "Order baru dicatat" },
  { key: "bahan", label: "Persiapan Bahan", description: "Bahan baku disiapkan" },
  { key: "produksi", label: "Produksi", description: "Sedang diproduksi di lini" },
  { key: "qc", label: "Quality Control", description: "Pemeriksaan kualitas" },
  { key: "packing", label: "Packing", description: "Pengemasan barang jadi" },
  { key: "pengiriman", label: "Pengiriman", description: "Dalam proses kirim" },
  { key: "selesai", label: "Selesai", description: "Order telah diterima pelanggan" },
] as const

export type StageKey = (typeof STAGES)[number]["key"]

export const PRIORITIES = [
  { key: "normal", label: "Normal" },
  { key: "tinggi", label: "Tinggi" },
  { key: "urgent", label: "Urgent" },
] as const

export type PriorityKey = (typeof PRIORITIES)[number]["key"]

export interface HistoryEntry {
  id: string
  at: string
  stage: StageKey
  produced: number
  note: string
}

export interface Order {
  id: string
  customer: string
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
  product: string
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

export const SEED_TODAY = "2026-09-30"

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
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date())
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
  const date = value.length === 10 ? new Date(`${value}T00:00:00+07:00`) : new Date(value)
  return dateFormatter.format(date)
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

function at(day: string, hour: number) {
  return `${day}T${String(hour).padStart(2, "0")}:00:00+07:00`
}

function addDays(day: string, amount: number) {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

const STAGE_NOTES: Record<StageKey, string> = {
  diterima: "Order dicatat dari pelanggan",
  bahan: "Bahan baku mulai disiapkan",
  produksi: "Masuk lini produksi",
  qc: "Masuk pemeriksaan kualitas",
  packing: "Masuk tahap pengemasan",
  pengiriman: "Barang diserahkan ke ekspedisi",
  selesai: "Barang diterima pelanggan",
}

function seedOrder(
  index: number,
  data: Omit<Order, "id" | "history" | "createdAt"> & { createdDay: string }
): Order {
  const { createdDay, ...rest } = data
  const id = `ORD-2026-${String(index).padStart(3, "0")}`
  const last = stageIndex(rest.stage)
  const history: HistoryEntry[] = []

  for (let i = 0; i <= last; i++) {
    const stage = STAGES[i].key
    const produced =
      i < stageIndex("produksi")
        ? 0
        : i === last
          ? rest.produced
          : Math.round((rest.produced * (i - stageIndex("produksi") + 1)) / (last - stageIndex("produksi") + 1))
    history.push({
      id: `${id}-h${i}`,
      at: at(addDays(createdDay, i * 2), 9 + (i % 5)),
      stage,
      produced,
      note: STAGE_NOTES[stage],
    })
  }

  return { ...rest, id, createdAt: at(createdDay, 8), history }
}

export function createSeedOrders(): Order[] {
  return [
    seedOrder(1, {
      customer: "PT Sinar Abadi Furnitur",
      product: "Kursi Kantor Ergonomis",
      quantity: 400,
      produced: 260,
      stage: "produksi",
      priority: "tinggi",
      dueDate: "2026-10-08",
      createdDay: "2026-09-18",
      notes: "Warna hitam, sandaran jaring.",
    }),
    seedOrder(2, {
      customer: "CV Maju Bersama",
      product: "Meja Lipat Aluminium",
      quantity: 250,
      produced: 250,
      stage: "packing",
      priority: "normal",
      dueDate: "2026-10-03",
      createdDay: "2026-09-14",
      notes: "Kemas per 10 unit dalam kardus.",
    }),
    seedOrder(3, {
      customer: "PT Nusantara Retail",
      product: "Rak Besi 5 Tingkat",
      quantity: 600,
      produced: 120,
      stage: "produksi",
      priority: "urgent",
      dueDate: "2026-09-29",
      createdDay: "2026-09-10",
      notes: "Pelanggan meminta pengiriman bertahap.",
    }),
    seedOrder(4, {
      customer: "Toko Bangunan Jaya",
      product: "Lemari Arsip 4 Laci",
      quantity: 80,
      produced: 80,
      stage: "selesai",
      priority: "normal",
      dueDate: "2026-09-25",
      createdDay: "2026-09-05",
      notes: "",
    }),
    seedOrder(5, {
      customer: "PT Graha Mandiri",
      product: "Kursi Tamu Sofa 2 Dudukan",
      quantity: 120,
      produced: 0,
      stage: "bahan",
      priority: "normal",
      dueDate: "2026-10-20",
      createdDay: "2026-09-26",
      notes: "Menunggu kain dari pemasok.",
    }),
    seedOrder(6, {
      customer: "Hotel Puri Indah",
      product: "Meja Makan Kayu Jati",
      quantity: 60,
      produced: 60,
      stage: "qc",
      priority: "tinggi",
      dueDate: "2026-10-05",
      createdDay: "2026-09-12",
      notes: "Finishing natural doff.",
    }),
    seedOrder(7, {
      customer: "PT Sinar Abadi Furnitur",
      product: "Lemari Pakaian 3 Pintu",
      quantity: 150,
      produced: 150,
      stage: "pengiriman",
      priority: "normal",
      dueDate: "2026-10-01",
      createdDay: "2026-09-08",
      notes: "",
    }),
    seedOrder(8, {
      customer: "Sekolah Harapan Bangsa",
      product: "Meja dan Kursi Siswa",
      quantity: 500,
      produced: 410,
      stage: "produksi",
      priority: "normal",
      dueDate: "2026-10-12",
      createdDay: "2026-09-15",
      notes: "Tinggi meja mengikuti standar SD.",
    }),
    seedOrder(9, {
      customer: "Kantor Bersama Co-Work",
      product: "Meja Kerja Standing Desk",
      quantity: 90,
      produced: 0,
      stage: "diterima",
      priority: "tinggi",
      dueDate: "2026-10-15",
      createdDay: "2026-09-29",
      notes: "",
    }),
    seedOrder(10, {
      customer: "CV Maju Bersama",
      product: "Rak Buku Minimalis",
      quantity: 200,
      produced: 200,
      stage: "selesai",
      priority: "normal",
      dueDate: "2026-09-22",
      createdDay: "2026-09-01",
      notes: "",
    }),
    seedOrder(11, {
      customer: "PT Nusantara Retail",
      product: "Rak Display Toko",
      quantity: 300,
      produced: 90,
      stage: "produksi",
      priority: "normal",
      dueDate: "2026-09-28",
      createdDay: "2026-09-09",
      notes: "Ada kendala mesin potong, jadwal mundur.",
    }),
    seedOrder(12, {
      customer: "Klinik Sehat Sentosa",
      product: "Tempat Tidur Pasien Manual",
      quantity: 40,
      produced: 40,
      stage: "qc",
      priority: "urgent",
      dueDate: "2026-10-02",
      createdDay: "2026-09-16",
      notes: "Wajib lolos uji beban sebelum kirim.",
    }),
  ]
}
