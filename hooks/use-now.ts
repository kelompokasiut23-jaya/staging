import { useSyncExternalStore } from "react"

const INTERVAL = 30_000

let now = 0
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, INTERVAL)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

function getSnapshot() {
  if (now === 0 || Date.now() - now >= INTERVAL) now = Date.now()
  return now
}

/** Waktu sekarang dalam milidetik, diperbarui berkala. Bernilai 0 sebelum halaman siap. */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}
