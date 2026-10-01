export type Role = "qc" | "admin"

export interface User {
  id: string
  name: string
  role: Role
  /** Line tempat QC bertugas. Kosong untuk admin. */
  line: string
  username: string
  passwordHash: string
  active: boolean
  createdAt: string
}

export const ROLE_LABEL: Record<Role, string> = {
  qc: "QC",
  admin: "Admin",
}

export const LINES = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]

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

/** Satu target QC: satu client + satu item + satu warna, dikerjakan oleh satu QC. */
export interface QcTask {
  id: string
  /** Nama client / perusahaan pemilik barang. */
  brand: string
  item: string
  color: string
  line: string
  /** id user QC yang ditugaskan. */
  assignedTo: string
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

/** Hash password sebelum disimpan, supaya password asli tidak tersimpan. */
export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`qc-monitor:${password}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Password acak yang mudah dibacakan: tanpa huruf/angka yang mirip (l, 1, O, 0). */
export function generatePassword(length = 8) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (v) => chars[v % chars.length]).join("")
}

// ---------------------------------------------------------------------------
// Data contoh. Nanti diganti dengan data dari server.
// Akun contoh: admin / admin123, fathiya / fathiya123, rina / rina123
// ---------------------------------------------------------------------------

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

export function createSampleData(now: number): {
  users: User[]
  tasks: QcTask[]
} {
  const created = new Date(now - 2 * 3600000).toISOString()

  const users: User[] = [
    {
      id: "USR-001",
      name: "Admin Produksi",
      role: "admin",
      line: "",
      username: "admin",
      passwordHash:
        "f873d9054587eb3a75f1ea7a4142ba347c41e6fed94ed418ef1e468f501b46e0",
      active: true,
      createdAt: created,
    },
    {
      id: "USR-002",
      name: "Fathiya",
      role: "qc",
      line: "Line 1",
      username: "fathiya",
      passwordHash:
        "e6185bf9e9be76cac7578528f94e9e44d4c8581bcb57589e0ff2f03dd47f7313",
      active: true,
      createdAt: created,
    },
    {
      id: "USR-003",
      name: "Rina",
      role: "qc",
      line: "Line 2",
      username: "rina",
      passwordHash:
        "5dc1e50f8aa344de43b69225be7a962ec7d481a68b6dce5f7a7c03e5dd2caeea",
      active: true,
      createdAt: created,
    },
  ]

  const base = {
    note: "",
    createdBy: "Admin Produksi",
    finishedAt: null,
    updatedAt: created,
    logs: [],
    status: "belum" as TaskStatus,
  }

  const tasks: QcTask[] = [
    {
      ...base,
      id: "QC-001",
      brand: "Aruna Wear",
      item: "Kaos Polo Pria",
      color: "Navy",
      line: "Line 1",
      assignedTo: "USR-002",
      deadline: inHours(now, 2),
      sizes: sizes([
        ["S", 300, 180, 6],
        ["M", 400, 150, 4],
        ["L", 300],
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
      assignedTo: "USR-002",
      deadline: inHours(now, 4),
      sizes: sizes([
        ["S", 350],
        ["M", 350],
        ["L", 300],
      ]),
      note: "Pastikan kancing belakang terpasang kuat.",
    },
    {
      ...base,
      id: "QC-003",
      brand: "Nusa Denim",
      item: "Celana Chino",
      color: "Khaki",
      line: "Line 1",
      assignedTo: "USR-002",
      deadline: inHours(now, 6),
      sizes: sizes([
        ["30", 250],
        ["32", 400],
        ["34", 350],
      ]),
    },
    {
      ...base,
      id: "QC-004",
      brand: "Aruna Wear",
      item: "Kemeja Lengan Panjang",
      color: "Putih",
      line: "Line 2",
      assignedTo: "USR-003",
      deadline: inHours(now, 3),
      sizes: sizes([
        ["M", 500],
        ["L", 500],
      ]),
    },
  ]

  return { users, tasks }
}
