"use client"

import { useSyncExternalStore } from "react"

import {
  createSampleData,
  hashPassword,
  isComplete,
  type QcTask,
  type Role,
  type SizeCount,
  type SizeInput,
  type User,
} from "@/lib/qc"

/*
 * Penyimpanan sementara di browser. Semua halaman hanya memakai fungsi di file
 * ini, jadi nanti cukup file ini yang diganti agar data diambil dari server
 * dan perubahan dari admin langsung muncul di layar QC.
 */

const DATA_KEY = "qc-monitor:data:v2"

interface Data {
  users: User[]
  tasks: QcTask[]
}

let data: Data | null = null
const listeners = new Set<() => void>()

function readData(): Data {
  try {
    const raw = window.localStorage.getItem(DATA_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.users) && Array.isArray(parsed?.tasks))
        return parsed
    }
  } catch {
    // data rusak atau penyimpanan tidak tersedia, pakai data contoh
  }
  const sample = createSampleData(Date.now())
  save(DATA_KEY, sample)
  return sample
}

// Sesi disimpan per tab, jadi admin dan QC bisa dibuka berdampingan di tab berbeda.
function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    )
  } catch {
    // penyimpanan tidak tersedia, data tetap ada selama halaman terbuka
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function getData() {
  if (data === null) data = readData()
  return data
}

function commit(next: Data) {
  data = next
  save(DATA_KEY, next)
  emit()
}

function onStorage(event: StorageEvent) {
  if (event.key !== DATA_KEY) return
  data = readData()
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
  }
}

const serverSnapshot = () => null

/** `null` selama halaman belum siap di browser. */
export function useTasks(): QcTask[] | null {
  return useSyncExternalStore(subscribe, () => getData().tasks, serverSnapshot)
}

export function useUsers(): User[] | null {
  return useSyncExternalStore(subscribe, () => getData().users, serverSnapshot)
}

// Akun yang dipakai setiap endpoint sampai halaman login dibuat.
const DEFAULT_USER: Record<Role, string> = { admin: "USR-001", qc: "USR-002" }

/**
 * Pengguna yang sedang membuka halaman untuk role tertentu.
 * `undefined` saat belum siap, `null` jika akunnya tidak ada atau nonaktif.
 * Nanti diganti dengan pengguna hasil login.
 */
export function useCurrentUser(role: Role): User | null | undefined {
  const users = useUsers()
  if (users === null) return undefined
  const user = users.find((u) => u.id === DEFAULT_USER[role])
  return user && user.active && user.role === role ? user : null
}

// ---------------------------------------------------------------------------
// Tugas
// ---------------------------------------------------------------------------

function nextId(prefix: string, ids: string[]) {
  const max = ids.reduce((highest, id) => {
    const n = Number(id.split("-").pop())
    return Number.isFinite(n) ? Math.max(highest, n) : highest
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, "0")}`
}

function logId(task: QcTask) {
  return `${task.id}-l${task.logs.length + 1}-${Date.now()}`
}

export interface NewTaskInput {
  brand: string
  item: string
  color: string
  assignedTo: string
  deadline: string
  sizes: { size: string; target: number }[]
  note: string
}

export function addTask(input: NewTaskInput, admin: User): QcTask | null {
  const current = getData()
  const qc = current.users.find(
    (u) => u.id === input.assignedTo && u.role === "qc"
  )
  if (!qc) return null
  const now = new Date().toISOString()
  const task: QcTask = {
    id: nextId(
      "QC",
      current.tasks.map((t) => t.id)
    ),
    brand: input.brand,
    item: input.item,
    color: input.color,
    line: qc.line,
    assignedTo: qc.id,
    deadline: input.deadline,
    sizes: input.sizes.map<SizeCount>((s) => ({ ...s, passed: 0, defect: 0 })),
    status: "belum",
    note: input.note,
    createdBy: admin.name,
    updatedAt: now,
    finishedAt: null,
    logs: [],
  }
  commit({ ...current, tasks: [...current.tasks, task] })
  return task
}

/** Hanya tugas yang belum mulai diperiksa yang boleh dihapus. */
export function deleteTask(taskId: string) {
  const current = getData()
  commit({
    ...current,
    tasks: current.tasks.filter((t) => t.id !== taskId || t.status !== "belum"),
  })
}

export function saveCounts(
  taskId: string,
  user: User,
  counts: SizeInput[],
  note: string
) {
  const current = getData()
  const now = new Date().toISOString()
  commit({
    ...current,
    tasks: current.tasks.map((task) => {
      if (task.id !== taskId || task.status === "selesai") return task
      const sizes = task.sizes.map((s) => {
        const input = counts.find((c) => c.size === s.size)
        return input ? { ...s, passed: input.passed, defect: input.defect } : s
      })
      const started = sizes.some((s) => s.passed + s.defect > 0)
      return {
        ...task,
        sizes,
        status: started ? "diperiksa" : "belum",
        updatedAt: now,
        logs: [
          ...task.logs,
          { id: logId(task), at: now, by: user.name, action: "simpan", note },
        ],
      }
    }),
  })
}

export function finishTask(taskId: string, user: User, note: string) {
  const current = getData()
  const now = new Date().toISOString()
  commit({
    ...current,
    tasks: current.tasks.map((task) => {
      if (task.id !== taskId || !isComplete(task)) return task
      return {
        ...task,
        status: "selesai",
        updatedAt: now,
        finishedAt: now,
        logs: [
          ...task.logs,
          { id: logId(task), at: now, by: user.name, action: "selesai", note },
        ],
      }
    }),
  })
}

// ---------------------------------------------------------------------------
// Pengguna
// ---------------------------------------------------------------------------

export function isUsernameTaken(username: string, exceptId?: string) {
  const name = username.trim().toLowerCase()
  return getData().users.some((u) => u.username === name && u.id !== exceptId)
}

export async function addQcUser(input: {
  name: string
  line: string
  username: string
  password: string
}): Promise<User> {
  const passwordHash = await hashPassword(input.password)
  const current = getData()
  const user: User = {
    id: nextId(
      "USR",
      current.users.map((u) => u.id)
    ),
    name: input.name,
    role: "qc",
    line: input.line,
    username: input.username.trim().toLowerCase(),
    passwordHash,
    active: true,
    createdAt: new Date().toISOString(),
  }
  commit({ ...current, users: [...current.users, user] })
  return user
}

export async function setPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password)
  const current = getData()
  commit({
    ...current,
    users: current.users.map((u) =>
      u.id === userId ? { ...u, passwordHash } : u
    ),
  })
}

export function setUserActive(userId: string, active: boolean) {
  const current = getData()
  commit({
    ...current,
    users: current.users.map((u) => (u.id === userId ? { ...u, active } : u)),
  })
}

export function resetSampleData() {
  commit(createSampleData(Date.now()))
}
