export type Role = "qc" | "admin"

export interface User {
  id: string
  name: string
  role: Role
  line: string
}

export type TaskStatus = "belum" | "diperiksa" | "selesai"

export const STATUS_LABEL: Record<TaskStatus, string> = {
  belum: "Belum dimulai",
  diperiksa: "Sedang diperiksa",
  selesai: "Selesai",
}

export interface SizeCount {
  size: string
  target: number
  passed: number
  defect: number
}

export interface TaskLog {
  id: string
  at: string
  by: string
  action: "simpan" | "selesai"
  note: string
}

/** Satu target QC: satu brand + satu item + satu warna, dikerjakan di satu line. */
export interface QcTask {
  id: string
  brand: string
  item: string
  color: string
  line: string
  deadline: string
  sizes: SizeCount[]
  status: TaskStatus
  note: string
  createdBy: string
  updatedAt: string
  finishedAt: string | null
  logs: TaskLog[]
}

export interface SizeInput {
  size: string
  passed: number
  defect: number
}

export function totals(task: Pick<QcTask, "sizes">) {
  let target = 0
  let passed = 0
  let defect = 0
  for (const s of task.sizes) {
    target += s.target
    passed += s.passed
    defect += s.defect
  }
  const checked = passed + defect
  return {
    target,
    passed,
    defect,
    checked,
    remaining: Math.max(0, target - checked),
    percent: target ? Math.round((checked / target) * 100) : 0,
    defectRate: checked ? (defect / checked) * 100 : 0,
  }
}

export function isComplete(task: Pick<QcTask, "sizes">) {
  return task.sizes.every((s) => s.passed + s.defect === s.target)
}

export function isOverdue(task: QcTask, now: number) {
  return task.status !== "selesai" && Date.parse(task.deadline) < now
}

const TIME_ZONE = "Asia/Jakarta"

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
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

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
})

export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso))
}

export function formatDay(ms: number) {
  return dayFormatter.format(new Date(ms))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}%`
}

/** Teks sisa waktu yang mudah dibaca, misalnya "2 jam 15 menit lagi". */
export function timeLeft(deadline: string, now: number) {
  const diff = Date.parse(deadline) - now
  const minutes = Math.round(Math.abs(diff) / 60000)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const text =
    hours > 0
      ? rest > 0
        ? `${hours} jam ${rest} menit`
        : `${hours} jam`
      : `${rest} menit`
  return diff >= 0 ? `${text} lagi` : `lewat ${text}`
}

// ---------------------------------------------------------------------------
// Data contoh. Nanti diganti dengan data yang diinput admin.
// ---------------------------------------------------------------------------

export const CURRENT_USER: User = {
  id: "USR-QC-001",
  name: "Fathiya",
  role: "qc",
  line: "Line 1",
}

function inHours(now: number, hours: number) {
  const date = new Date(now + hours * 3600000)
  date.setMinutes(date.getMinutes() < 30 ? 30 : 60, 0, 0)
  return date.toISOString()
}

function sizes(entries: [string, number, number?, number?][]): SizeCount[] {
  return entries.map(([size, target, passed = 0, defect = 0]) => ({
    size,
    target,
    passed,
    defect,
  }))
}

export function createSampleTasks(now: number): QcTask[] {
  const created = new Date(now - 2 * 3600000).toISOString()
  const base = {
    note: "",
    createdBy: "Admin Produksi",
    finishedAt: null,
  }

  return [
    {
      ...base,
      id: "QC-001",
      brand: "Aruna Wear",
      item: "Kaos Polo Pria",
      color: "Navy",
      line: "Line 1",
      deadline: inHours(now, 2),
      sizes: sizes([
        ["S", 300, 180, 6],
        ["M", 400, 150, 4],
        ["L", 300, 0, 0],
      ]),
      status: "diperiksa",
      note: "Cek jahitan kerah dan posisi logo bordir.",
      updatedAt: new Date(now - 20 * 60000).toISOString(),
      logs: [
        {
          id: "QC-001-l1",
          at: new Date(now - 20 * 60000).toISOString(),
          by: "Fathiya",
          action: "simpan",
          note: "",
        },
      ],
    },
    {
      ...base,
      id: "QC-002",
      brand: "Kirana Kids",
      item: "Dress Anak Perempuan",
      color: "Merah Muda",
      line: "Line 1",
      deadline: inHours(now, 4),
      sizes: sizes([
        ["S", 350],
        ["M", 350],
        ["L", 300],
      ]),
      status: "belum",
      note: "Pastikan kancing belakang terpasang kuat.",
      updatedAt: created,
      logs: [],
    },
    {
      ...base,
      id: "QC-003",
      brand: "Nusa Denim",
      item: "Celana Chino",
      color: "Khaki",
      line: "Line 1",
      deadline: inHours(now, 6),
      sizes: sizes([
        ["30", 250],
        ["32", 400],
        ["34", 350],
      ]),
      status: "belum",
      note: "",
      updatedAt: created,
      logs: [],
    },
    // Target untuk line lain. Tidak tampil untuk QC Line 1.
    {
      ...base,
      id: "QC-004",
      brand: "Aruna Wear",
      item: "Kemeja Lengan Panjang",
      color: "Putih",
      line: "Line 2",
      deadline: inHours(now, 3),
      sizes: sizes([
        ["M", 500],
        ["L", 500],
      ]),
      status: "belum",
      note: "",
      updatedAt: created,
      logs: [],
    },
  ]
}
