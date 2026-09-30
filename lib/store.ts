"use client"

import { useSyncExternalStore } from "react"

import {
  SEED_TODAY,
  createSeedOrders,
  stageIndex,
  todayString,
  type NewOrderInput,
  type Order,
  type ProgressUpdateInput,
} from "@/lib/production"

const STORAGE_KEY = "produksi-monitor:orders:v1"

const seedOrders = createSeedOrders()
let orders: Order[] = seedOrders
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) orders = parsed as Order[]
    }
  } catch {
    orders = seedOrders
  }
}

function commit(next: Order[]) {
  orders = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan tidak tersedia, data tetap ada selama halaman terbuka
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  load()
  return orders
}

function getServerSnapshot() {
  return seedOrders
}

export function useOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const noopSubscribe = () => () => {}

export function useToday() {
  return useSyncExternalStore(noopSubscribe, todayString, () => SEED_TODAY)
}

function nextOrderId(current: Order[]) {
  const max = current.reduce((highest, order) => {
    const number = Number(order.id.split("-").pop())
    return Number.isFinite(number) ? Math.max(highest, number) : highest
  }, 0)
  return `ORD-${new Date().getFullYear()}-${String(max + 1).padStart(3, "0")}`
}

function newHistoryId(orderId: string, length: number) {
  return `${orderId}-h${length}-${Date.now()}`
}

export function addOrder(input: NewOrderInput): Order {
  load()
  const now = new Date().toISOString()
  const id = nextOrderId(orders)
  const order: Order = {
    id,
    customer: input.customer,
    product: input.product,
    quantity: input.quantity,
    produced: input.produced,
    stage: input.stage,
    priority: input.priority,
    dueDate: input.dueDate,
    notes: input.notes,
    createdAt: now,
    history: [
      {
        id: newHistoryId(id, 0),
        at: now,
        stage: input.stage,
        produced: input.produced,
        note: "Order dicatat",
      },
    ],
  }
  commit([order, ...orders])
  return order
}

export function updateProgress(orderId: string, input: ProgressUpdateInput) {
  load()
  const now = new Date().toISOString()
  commit(
    orders.map((order) => {
      if (order.id !== orderId) return order
      const moved = stageIndex(input.stage) !== stageIndex(order.stage)
      const note =
        input.note.trim() ||
        (moved ? "Tahap diperbarui" : "Jumlah produksi aktual diperbarui")
      return {
        ...order,
        stage: input.stage,
        produced: input.produced,
        history: [
          ...order.history,
          {
            id: newHistoryId(order.id, order.history.length),
            at: now,
            stage: input.stage,
            produced: input.produced,
            note,
          },
        ],
      }
    })
  )
}

export function deleteOrder(orderId: string) {
  load()
  commit(orders.filter((order) => order.id !== orderId))
}

export function resetOrders() {
  commit(createSeedOrders())
}
