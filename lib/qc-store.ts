"use client"

import { useSyncExternalStore } from "react"

import {
  createSampleTasks,
  isComplete,
  type QcTask,
  type SizeInput,
  type User,
} from "@/lib/qc"

/*
 * Penyimpanan sementara di browser. Semua halaman hanya memakai fungsi di file
 * ini, jadi nanti cukup file ini yang diganti agar data diambil dari server
 * dan perubahan dari admin langsung muncul di layar QC.
 */

const STORAGE_KEY = "qc-monitor:tasks:v1"

let tasks: QcTask[] | null = null
const listeners = new Set<() => void>()

function read(): QcTask[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as QcTask[]
    }
  } catch {
    // data rusak atau penyimpanan tidak tersedia, pakai data contoh
  }
  const sample = createSampleTasks(Date.now())
  write(sample)
  return sample
}

function write(next: QcTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan tidak tersedia, data tetap ada selama halaman terbuka
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function commit(next: QcTask[]) {
  tasks = next
  write(next)
  emit()
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return
  tasks = read()
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

function getSnapshot() {
  if (tasks === null) tasks = read()
  return tasks
}

/** `null` selama halaman belum siap di browser. */
export function useTasks(): QcTask[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function useLineTasks(user: User): QcTask[] | null {
  const all = useTasks()
  return all?.filter((task) => task.line === user.line) ?? null
}

function logId(task: QcTask) {
  return `${task.id}-l${task.logs.length + 1}-${Date.now()}`
}

export function saveCounts(
  taskId: string,
  user: User,
  counts: SizeInput[],
  note: string
) {
  const now = new Date().toISOString()
  commit(
    getSnapshot().map((task) => {
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
    })
  )
}

export function finishTask(taskId: string, user: User, note: string) {
  const now = new Date().toISOString()
  commit(
    getSnapshot().map((task) => {
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
    })
  )
}

export function resetSampleData() {
  commit(createSampleTasks(Date.now()))
}
