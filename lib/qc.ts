export type Role = "super_admin" | "admin" | "qc"

export interface User {
  id: string
  name: string
  role: Role
  /** Line tempat bertugas (QC) atau yang diawasi (admin). Kosong jika belum ditempatkan. */
  line: string
  username: string
  active: boolean
  createdAt: string
}

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  qc: "QC",
}

export interface Line {
  name: string
  createdAt: string
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

/** Satu target QC: satu client + satu item + satu warna, dikerjakan oleh QC di satu line. */
export interface QcTask {
  id: string
  /** Nama client / perusahaan pemilik barang. */
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

/** Password acak yang mudah dibacakan: tanpa huruf/angka yang mirip (l, 1, O, 0). */
export function generatePassword(length = 8) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (v) => chars[v % chars.length]).join("")
}
