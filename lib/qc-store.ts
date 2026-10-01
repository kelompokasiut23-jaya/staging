"use client"

import { useSyncExternalStore } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"

import type {
  QcTask,
  Role,
  SizeCount,
  SizeInput,
  TaskLog,
  TaskStatus,
  User,
} from "@/lib/qc"
import { supabase, usernameToEmail } from "@/lib/supabase"

/*
 * Semua akses data lewat file ini. Data diambil dari Supabase, dan perubahan
 * dari pengguna lain (misalnya admin menambah barang) langsung masuk lewat
 * langganan real time. Aturan siapa boleh melihat apa dijaga di database.
 */

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut"; message?: string }
  | { status: "signedIn"; user: User }

interface State {
  auth: AuthState
  tasks: QcTask[] | null
  users: User[] | null
}

const LOADING: AuthState = { status: "loading" }
let state: State = { auth: LOADING, tasks: null, users: null }
const listeners = new Set<() => void>()
let started = false
let channel: RealtimeChannel | null = null
let refetchTimer: ReturnType<typeof setTimeout> | undefined

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

// ---------------------------------------------------------------------------
// Pemetaan baris database -> tipe aplikasi
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string
  name: string
  username: string
  role: Role
  line: string
  active: boolean
  created_at: string
}

interface LogRow {
  id: number
  at: string
  by_name: string
  action: "simpan" | "selesai"
  note: string
}

interface TaskRow {
  id: string
  brand: string
  item: string
  color: string
  line: string
  assigned_to: string
  deadline: string
  sizes: SizeCount[]
  status: TaskStatus
  note: string
  created_by_name: string
  updated_at: string
  finished_at: string | null
  task_logs: LogRow[] | null
}

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    role: row.role,
    line: row.line,
    active: row.active,
    createdAt: row.created_at,
  }
}

function toTask(row: TaskRow): QcTask {
  const logs: TaskLog[] = (row.task_logs ?? [])
    .map((l) => ({
      id: String(l.id),
      at: l.at,
      by: l.by_name,
      action: l.action,
      note: l.note,
    }))
    .sort((a, b) => a.at.localeCompare(b.at))
  return {
    id: row.id,
    brand: row.brand,
    item: row.item,
    color: row.color,
    line: row.line,
    assignedTo: row.assigned_to,
    deadline: row.deadline,
    sizes: row.sizes,
    status: row.status,
    note: row.note,
    createdBy: row.created_by_name,
    updatedAt: row.updated_at,
    finishedAt: row.finished_at,
    logs,
  }
}

// ---------------------------------------------------------------------------
// Sesi login dan pengambilan data
// ---------------------------------------------------------------------------

async function loadProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()
  if (!data) {
    await supabase.auth.signOut()
    set({
      auth: {
        status: "signedOut",
        message: "Akun tidak ditemukan. Hubungi super admin.",
      },
    })
    return
  }
  const user = toUser(data as ProfileRow)
  if (!user.active) {
    await supabase.auth.signOut()
    set({
      auth: { status: "signedOut", message: "Akun Anda sudah dinonaktifkan." },
    })
    return
  }
  set({ auth: { status: "signedIn", user } })
  await refetch()
  subscribeRealtime()
}

export async function refetch() {
  const [tasks, users] = await Promise.all([
    supabase.from("tasks").select("*, task_logs(*)").order("deadline"),
    supabase.from("profiles").select("*").order("name"),
  ])
  set({
    tasks: tasks.data ? (tasks.data as TaskRow[]).map(toTask) : [],
    users: users.data ? (users.data as ProfileRow[]).map(toUser) : [],
  })
}

function scheduleRefetch() {
  clearTimeout(refetchTimer)
  refetchTimer = setTimeout(() => void refetch(), 150)
}

let realtimeLive = false
let pollTimer: ReturnType<typeof setInterval> | undefined

function onVisible() {
  if (document.visibilityState === "visible") scheduleRefetch()
}

function subscribeRealtime() {
  if (channel) return
  channel = supabase
    .channel("qc-data")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      scheduleRefetch
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "task_logs" },
      scheduleRefetch
    )
    .subscribe((status) => {
      realtimeLive = status === "SUBSCRIBED"
    })
  // Cadangan: jika koneksi real time terputus, data tetap diperbarui berkala.
  pollTimer = setInterval(() => {
    if (!realtimeLive && document.visibilityState === "visible") void refetch()
  }, 10_000)
  document.addEventListener("visibilitychange", onVisible)
}

function unsubscribeRealtime() {
  if (channel) void supabase.removeChannel(channel)
  channel = null
  realtimeLive = false
  clearInterval(pollTimer)
  document.removeEventListener("visibilitychange", onVisible)
}

function start() {
  if (started || typeof window === "undefined") return
  started = true
  supabase.auth.onAuthStateChange((event, session) => {
    // Panggilan Supabase lain ditunda agar tidak mengunci proses login.
    setTimeout(() => {
      if (!session) {
        unsubscribeRealtime()
        const message =
          state.auth.status === "signedOut" ? state.auth.message : undefined
        set({
          auth: { status: "signedOut", message },
          tasks: null,
          users: null,
        })
        return
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN")
        void loadProfile(session.user.id)
      if (event === "TOKEN_REFRESHED" && channel)
        supabase.realtime.setAuth(session.access_token)
    }, 0)
  })
}

function subscribe(listener: () => void) {
  start()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    subscribe,
    () => state.auth,
    () => LOADING
  )
}

/** `null` selama data belum dimuat. */
export function useTasks(): QcTask[] | null {
  return useSyncExternalStore(
    subscribe,
    () => state.tasks,
    () => null
  )
}

export function useUsers(): User[] | null {
  return useSyncExternalStore(
    subscribe,
    () => state.users,
    () => null
  )
}

// ---------------------------------------------------------------------------
// Aksi. Semua mengembalikan pesan error (atau null jika berhasil).
// ---------------------------------------------------------------------------

type Result = Promise<string | null>

function friendly(message: string) {
  if (/invalid login credentials/i.test(message))
    return "Username atau password salah"
  if (/banned/i.test(message)) return "Akun Anda sudah dinonaktifkan"
  if (/failed to fetch|network/i.test(message))
    return "Tidak bisa terhubung. Periksa koneksi internet."
  return message
}

export async function signIn(username: string, password: string): Result {
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  })
  return error ? friendly(error.message) : null
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function changePassword(password: string): Result {
  const { error } = await supabase.auth.updateUser({ password })
  return error ? friendly(error.message) : null
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

export async function addTask(
  input: NewTaskInput
): Promise<{ task?: QcTask; error?: string }> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      brand: input.brand,
      item: input.item,
      color: input.color,
      assigned_to: input.assignedTo,
      deadline: input.deadline,
      sizes: input.sizes.map((s) => ({ ...s, passed: 0, defect: 0 })),
      note: input.note,
      line: "",
    })
    .select("*, task_logs(*)")
    .single()
  if (error) return { error: friendly(error.message) }
  await refetch()
  return { task: toTask(data as TaskRow) }
}

export async function deleteTask(taskId: string): Result {
  const { error, count } = await supabase
    .from("tasks")
    .delete({ count: "exact" })
    .eq("id", taskId)
  if (error) return friendly(error.message)
  if (!count) return "Barang tidak bisa dihapus karena QC sudah mulai memeriksa"
  await refetch()
  return null
}

export async function saveCounts(
  taskId: string,
  counts: SizeInput[],
  note: string
): Result {
  const { error } = await supabase.rpc("save_counts", {
    p_task: taskId,
    p_counts: counts,
    p_note: note,
  })
  if (error) return friendly(error.message)
  await refetch()
  return null
}

export async function finishTask(taskId: string, note: string): Result {
  const { error } = await supabase.rpc("finish_task", {
    p_task: taskId,
    p_note: note,
  })
  if (error) return friendly(error.message)
  await refetch()
  return null
}

async function adminUsers(body: Record<string, unknown>): Result {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body,
  })
  if (error) {
    let message = error.message
    try {
      const detail = await (error.context as Response).json()
      if (detail?.error) message = detail.error
    } catch {
      // pakai pesan bawaan
    }
    return friendly(message)
  }
  if (data?.error) return friendly(data.error)
  await refetch()
  return null
}

export function createUser(input: {
  name: string
  username: string
  role: "admin" | "qc"
  line: string
  password: string
}) {
  return adminUsers({ action: "create", ...input })
}

export function setUserPassword(userId: string, password: string) {
  return adminUsers({ action: "set_password", user_id: userId, password })
}

export function setUserActive(userId: string, active: boolean) {
  return adminUsers({ action: "set_active", user_id: userId, active })
}
