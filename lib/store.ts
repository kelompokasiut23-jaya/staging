"use client"

import { useSyncExternalStore } from "react"

import {
  FALLBACK_TODAY,
  stageIndex,
  todayString,
  type NewOrderInput,
  type NewProductInput,
  type Order,
  type Product,
  type ProgressUpdateInput,
} from "@/lib/production"

const STORAGE_KEY = "produksi-monitor:data:v2"

interface Data {
  products: Product[]
  orders: Order[]
}

const EMPTY: Data = { products: [], orders: [] }

let data: Data = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.products) && Array.isArray(parsed?.orders)) {
      data = { products: parsed.products, orders: parsed.orders }
    }
  } catch {
    data = EMPTY
  }
}

function commit(next: Data) {
  data = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan browser tidak tersedia, data tetap ada selama halaman terbuka
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useOrders() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return data.orders
    },
    () => EMPTY.orders
  )
}

export function useProducts() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return data.products
    },
    () => EMPTY.products
  )
}

const noopSubscribe = () => () => {}

export function useToday() {
  return useSyncExternalStore(noopSubscribe, todayString, () => FALLBACK_TODAY)
}

function nextId(prefix: string, ids: string[]) {
  const max = ids.reduce((highest, id) => {
    const number = Number(id.split("-").pop())
    return Number.isFinite(number) ? Math.max(highest, number) : highest
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, "0")}`
}

function historyId(orderId: string, length: number) {
  return `${orderId}-h${length}-${Date.now()}`
}

export function addProduct(input: NewProductInput): Product {
  load()
  const product: Product = {
    id: nextId(
      "PRD",
      data.products.map((p) => p.id)
    ),
    name: input.name,
    note: input.note,
    createdAt: new Date().toISOString(),
  }
  commit({ ...data, products: [...data.products, product] })
  return product
}

export function deleteProduct(productId: string) {
  load()
  if (data.orders.some((order) => order.productId === productId)) return false
  commit({ ...data, products: data.products.filter((p) => p.id !== productId) })
  return true
}

export function addOrder(input: NewOrderInput): Order | null {
  load()
  const product = data.products.find((p) => p.id === input.productId)
  if (!product) return null

  const now = new Date().toISOString()
  const id = `ORD-${nextId(
    String(new Date().getFullYear()),
    data.orders.map((o) => o.id)
  )}`
  const order: Order = {
    id,
    customer: input.customer,
    productId: product.id,
    product: product.name,
    quantity: input.quantity,
    produced: input.produced,
    stage: input.stage,
    priority: input.priority,
    dueDate: input.dueDate,
    notes: input.notes,
    createdAt: now,
    history: [
      {
        id: historyId(id, 0),
        at: now,
        stage: input.stage,
        produced: input.produced,
        note: "Order dicatat",
      },
    ],
  }
  commit({ ...data, orders: [order, ...data.orders] })
  return order
}

export function updateProgress(orderId: string, input: ProgressUpdateInput) {
  load()
  const now = new Date().toISOString()
  commit({
    ...data,
    orders: data.orders.map((order) => {
      if (order.id !== orderId) return order
      const moved = stageIndex(input.stage) !== stageIndex(order.stage)
      const note =
        input.note.trim() ||
        (moved ? "Tahap diperbarui" : "Jumlah yang sudah jadi diperbarui")
      return {
        ...order,
        stage: input.stage,
        produced: input.produced,
        history: [
          ...order.history,
          {
            id: historyId(order.id, order.history.length),
            at: now,
            stage: input.stage,
            produced: input.produced,
            note,
          },
        ],
      }
    }),
  })
}

export function clearAllData() {
  commit(EMPTY)
}
