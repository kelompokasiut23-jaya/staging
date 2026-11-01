"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ChevronRightIcon,
  KeyRoundIcon,
  ListChecksIcon,
  LogOutIcon,
  PackagePlusIcon,
  PanelLeftIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import { Bar, Counter, EASE } from "./motion-kit"

type Page = "barang" | "pengguna"
export type Status = "belum" | "diperiksa" | "selesai"

export interface Item {
  client: string
  item: string
  color: string
  id: string
  qc: string
  line: string
  time: string
  count: string
  percent: number
  pass: string
  defect: string
  status: Status
  late: boolean
}

export const ITEMS: Item[] = [
  {
    client: "UNIQLO",
    item: "Celana Jeans",
    color: "Denim",
    id: "QC-002",
    qc: "Maharani",
    line: "Line 2",
    time: "17.00",
    count: "0 / 1.850",
    percent: 0,
    pass: "0",
    defect: "0",
    status: "belum",
    late: true,
  },
  {
    client: "H&M",
    item: "Kaos Polo Pria",
    color: "Navy",
    id: "QC-001",
    qc: "Fathiya",
    line: "Line 1",
    time: "12.00",
    count: "2.000 / 2.000",
    percent: 100,
    pass: "1.835",
    defect: "165",
    status: "diperiksa",
    late: true,
  },
]

export const STATUS_LABEL: Record<Status, { text: string; tone: string }> = {
  belum: { text: "Belum dimulai", tone: "bg-[#2A3042] text-[#E6E9F0]" },
  diperiksa: { text: "Sedang diperiksa", tone: "bg-[#1B2C4F] text-[#7DB1FF]" },
  selesai: { text: "Selesai", tone: "bg-[#173D2A] text-[#4ADE80]" },
}

export const STATS = [
  { label: "Total barang", to: 3850, chip: "2 tugas", sub: "0 tugas selesai" },
  { label: "Sudah diperiksa", to: 2000, chip: "52%", sub: "Sisa 1.850 barang" },
  { label: "Defect", to: 165, chip: "8,3%", sub: "Lolos 1.835 barang" },
  {
    label: "Terlambat",
    to: 2,
    chip: "Perlu dicek",
    sub: "Lewat batas waktu, belum selesai",
  },
]

export type TabKey = "semua" | Status | "terlambat"

export const TABS: { key: TabKey; label: string; count: string }[] = [
  { key: "semua", label: "Semua", count: "2" },
  { key: "belum", label: "Belum dimulai", count: "1" },
  { key: "diperiksa", label: "Sedang diperiksa", count: "1" },
  { key: "selesai", label: "Selesai", count: "0" },
  { key: "terlambat", label: "Terlambat", count: "2" },
]

const COLS = [
  "flex-1",
  "w-[100px]",
  "w-[170px]",
  "w-[180px]",
  "w-[80px]",
  "w-[70px]",
  "w-[130px]",
  "w-[40px]",
]
const HEAD = [
  "Client / Item",
  "QC",
  "Batas selesai",
  "Diperiksa",
  "Lolos",
  "Defect",
  "Status",
  "",
]

export function Badge({
  tone,
  children,
}: {
  tone: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {children}
    </span>
  )
}

function Row({ r, last }: { r: Item; last: boolean }) {
  const status = STATUS_LABEL[r.status]
  return (
    <div
      className={`flex h-[53px] items-center ${last ? "" : "border-b border-[#333]"}`}
    >
      <div className={`${COLS[0]} px-2`}>
        <p className="text-sm font-medium text-[#F2F2F2]">{r.client}</p>
        <p className="flex gap-1 text-xs text-[#A3A3A3]">
          {r.item} · {r.color} · <span className="font-mono">{r.id}</span>
        </p>
      </div>
      <div className={`${COLS[1]} px-2`}>
        <p className="text-sm text-[#F2F2F2]">{r.qc}</p>
        <p className="text-xs text-[#A3A3A3]">{r.line}</p>
      </div>
      <div
        className={`${COLS[2]} flex items-center gap-2 px-2 text-sm text-[#F2F2F2]`}
      >
        {r.time}
        {r.late && (
          <Badge tone="bg-[#4A2024] text-[#FF5C5C]">Lewat batas waktu</Badge>
        )}
      </div>
      <div className={`${COLS[3]} px-2`}>
        <div className="flex justify-between text-xs text-[#A3A3A3]">
          <span>{r.count}</span>
          <span>{r.percent}%</span>
        </div>
        <Bar
          percent={r.percent}
          className="mt-1 h-1"
          track="bg-[#3A3A3A]"
          barClassName="bg-[#4690FF]"
        />
      </div>
      <div className={`${COLS[4]} px-2 text-right text-sm text-[#F2F2F2]`}>
        {r.pass}
      </div>
      <div className={`${COLS[5]} px-2 text-right text-sm text-[#F2F2F2]`}>
        {r.defect}
      </div>
      <div className={`${COLS[6]} px-2`}>
        <Badge tone={status.tone}>{status.text}</Badge>
      </div>
      <div className={`${COLS[7]} flex justify-end px-2 text-[#A3A3A3]`}>
        <ChevronRightIcon className="size-4" />
      </div>
    </div>
  )
}

function BarangPage() {
  const [tab, setTab] = useState<TabKey>("semua")
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ITEMS.filter((r) => {
      const inTab =
        tab === "semua" ? true : tab === "terlambat" ? r.late : r.status === tab
      const inQuery =
        !q ||
        [r.client, r.item, r.color, r.id, r.qc, r.line].some((v) =>
          v.toLowerCase().includes(q)
        )
      return inTab && inQuery
    })
  }, [tab, query])

  return (
    <div className="space-y-6 px-7 py-10">
      <div className="flex items-center gap-4">
        <p className="flex-1 text-sm text-[#A3A3A3]">
          Semua barang yang harus diperiksa QC. Angka lolos dan defect
          diperbarui oleh QC masing-masing.
        </p>
        <span className="flex items-center gap-2 rounded-lg bg-[#4690FF] px-3 py-[7px] text-sm font-medium text-[#0A0A0A]">
          <PackagePlusIcon className="size-4" /> Tambah barang
        </span>
      </div>

      <div className="flex gap-3.5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#333] bg-[#1B1B1B]"
          >
            <div className="space-y-2 p-4">
              <p className="text-sm text-[#A3A3A3]">{s.label}</p>
              <p className="text-[32px] leading-tight font-bold text-[#F2F2F2] tabular-nums">
                <Counter to={s.to} />
              </p>
            </div>
            <div className="flex-1 space-y-2 border-t border-[#333] bg-[#262626] p-4">
              <span className="inline-flex rounded-full border border-[#333] px-2 py-0.5 text-xs font-medium text-[#F2F2F2]">
                {s.chip}
              </span>
              <p className="text-sm text-[#A3A3A3]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3.5">
        <div
          role="tablist"
          className="inline-flex gap-0.5 rounded-[10px] bg-[#1B1B1B] p-[3px] text-sm"
        >
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1 transition-colors ${
                  active
                    ? "border-[#333] bg-[#121212] font-medium text-[#F2F2F2]"
                    : "border-transparent text-[#A3A3A3] hover:text-[#F2F2F2]"
                }`}
              >
                {t.label}
                <span className="flex h-5 items-center rounded-full bg-[#3A4156] px-1.5 text-xs font-medium text-[#DDE1EA]">
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>
        <label className="flex h-8 items-center gap-2 rounded-lg border border-[#333] bg-[#1B1B1B] px-2.5 text-sm text-[#A3A3A3] focus-within:border-[#4690FF]">
          <SearchIcon className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari client, item, warna, line, atau nama QC"
            aria-label="Cari barang"
            className="h-full w-full bg-transparent text-sm text-[#F2F2F2] outline-none placeholder:text-[#A3A3A3]"
          />
        </label>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${tab}|${query.trim().toLowerCase()}|${rows.length}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {rows.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center rounded-xl border border-[#333] text-sm text-[#A3A3A3]">
              Tidak ada barang yang cocok. Coba ubah kata pencarian atau pilihan
              tab.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#333] bg-[#1B1B1B]">
              <div className="flex h-10 items-center border-b border-[#333] text-sm font-medium text-[#F2F2F2]">
                {HEAD.map((h, i) => (
                  <div
                    key={i}
                    className={`${COLS[i]} px-2 ${i === 4 || i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </div>
                ))}
              </div>
              {rows.map((r, i) => (
                <Row key={r.id} r={r} last={i === rows.length - 1} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export type Role = "Admin" | "QC"

export const USERS: {
  name: string
  role: Role
  line: string
  username: string
  open: number
}[] = [
  {
    name: "Royadi",
    role: "Admin",
    line: "Line 1",
    username: "royadi",
    open: 0,
  },
  { name: "Fathiya", role: "QC", line: "Line 1", username: "fathiya", open: 1 },
  {
    name: "Maharani",
    role: "QC",
    line: "Line 2",
    username: "maharani",
    open: 1,
  },
]

export const USER_TABS: { key: "semua" | Role; label: string }[] = [
  { key: "semua", label: "Semua (3)" },
  { key: "Admin", label: "Admin (1)" },
  { key: "QC", label: "QC (2)" },
]

const actionBtn =
  "flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1F1F1F] px-2.5 py-[5px] text-[13px] font-medium"

function PenggunaPage() {
  const [tab, setTab] = useState<"semua" | Role>("semua")
  const users = USERS.filter((u) => tab === "semua" || u.role === tab)

  return (
    <div className="space-y-6 p-10">
      <div className="flex items-center gap-4">
        <p className="flex-1 text-sm text-[#A3A3A3]">
          Buat akun untuk admin line dan petugas QC. Setiap orang masuk dengan
          username dan password dari Anda, lalu hanya melihat halaman sesuai
          role-nya.
        </p>
        <span className="flex items-center gap-2 rounded-lg bg-[#4690FF] px-3 py-[7px] text-sm font-medium whitespace-nowrap text-[#0A0A0A]">
          <UserPlusIcon className="size-4" /> Tambah pengguna
        </span>
      </div>

      <div
        role="tablist"
        className="inline-flex gap-0.5 rounded-[10px] bg-[#1B1B1B] p-[3px] text-sm"
      >
        {USER_TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-lg border px-2 py-1 transition-colors ${
                active
                  ? "border-[#333] bg-[#121212] font-medium text-[#F2F2F2]"
                  : "border-transparent text-[#A3A3A3] hover:text-[#F2F2F2]"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {users.map((u) => (
          <motion.div
            key={u.username}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-3 rounded-xl border border-[#333] bg-[#1B1B1B] p-3"
          >
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#262626] text-sm font-medium text-[#F2F2F2]">
                {u.name.charAt(0)}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#F2F2F2]">
                    {u.name}
                  </span>
                  <Badge tone="bg-[#1B2C4F] text-[#7DB1FF]">{u.role}</Badge>
                </div>
                <p className="flex gap-1 text-sm text-[#A3A3A3]">
                  {u.line} · username{" "}
                  <span className="font-mono">{u.username}</span>
                </p>
                {u.open > 0 && (
                  <p className="text-xs text-[#A3A3A3]">
                    {u.open} tugas belum selesai
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`${actionBtn} text-[#F2F2F2]`}>
                <KeyRoundIcon className="size-3.5" /> Buat password baru
              </span>
              <span
                className={`${actionBtn} ${u.open > 0 ? "text-[#A3A3A3]" : "text-[#F2F2F2]"}`}
              >
                Nonaktifkan
              </span>
            </div>
            {u.open > 0 && (
              <p className="text-xs text-[#A3A3A3]">
                Belum bisa dinonaktifkan karena masih punya {u.open} tugas belum
                selesai.
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function MockDashboard() {
  const [page, setPage] = useState<Page>("barang")

  const nav = (key: Page) =>
    `flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left transition-colors ${
      page === key
        ? "bg-[#1B2C4F] text-[#7DB1FF]"
        : "text-[#F2F2F2] hover:bg-white/5"
    }`

  return (
    <div className="h-[760px] w-[1380px] overflow-hidden rounded-[40px] border-x-2 border-t-2 border-[#FFFFFF2A] bg-[linear-gradient(to_bottom_left,#1C1C1C,#080808)] p-3 text-left">
      <div className="flex h-full overflow-hidden rounded-[30px] bg-[#121212]">
        <aside className="flex w-[288px] shrink-0 flex-col justify-between border-r border-[#333] bg-[#1B1B1B]">
          <div>
            <div className="flex h-12 items-center gap-2 px-4 text-base font-semibold text-[#F2F2F2]">
              <ShieldCheckIcon className="size-5" /> Monitoring QC
            </div>
            <nav className="p-2 text-sm font-medium">
              <button
                type="button"
                className={nav("barang")}
                onClick={() => setPage("barang")}
              >
                <ListChecksIcon className="size-4" /> Daftar Barang
              </button>
              <button
                type="button"
                className={nav("pengguna")}
                onClick={() => setPage("pengguna")}
              >
                <UsersIcon className="size-4" /> Pengguna
              </button>
            </nav>
          </div>
          <div className="px-4 pb-2 text-sm text-[#F2F2F2]">
            <div className="flex items-center gap-2 pb-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#4690FF] font-semibold text-[#0A0A0A]">
                S
              </span>
              <span>
                <p className="font-medium">Super Admin</p>
                <p className="text-xs text-[#A3A3A3]">Super Admin</p>
              </span>
            </div>
            <div className="flex h-8 items-center gap-2">
              <KeyRoundIcon className="size-4" /> Ganti password
            </div>
            <div className="flex h-8 items-center gap-2">
              <LogOutIcon className="size-4" /> Keluar
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center gap-5 border-b border-[#333] px-10 text-base font-medium text-[#F2F2F2]">
            <PanelLeftIcon className="size-[18px]" />
            <span className="h-4 w-px bg-[#333]" />
            {page === "barang" ? "Daftar Barang" : "Pengguna"}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {page === "barang" ? <BarangPage /> : <PenggunaPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
