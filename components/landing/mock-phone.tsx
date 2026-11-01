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

import {
  Badge,
  ITEMS,
  STATS,
  STATUS_LABEL,
  TABS,
  USER_TABS,
  USERS,
  type Role,
  type TabKey,
} from "./mock-dashboard"
import { Bar, Counter, EASE } from "./motion-kit"

type Page = "barang" | "pengguna"

const noBar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

function Segmented<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; count?: string }[]
  value: T
  onChange: (k: T) => void
}) {
  return (
    <div role="tablist" className={`-mx-4 overflow-x-auto px-4 ${noBar}`}>
      <div className="inline-flex gap-0.5 rounded-[10px] bg-[#1B1B1B] p-[3px] text-[13px]">
        {tabs.map((t) => {
          const active = value === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.key)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 whitespace-nowrap transition-colors ${
                active
                  ? "border-[#333] bg-[#121212] font-medium text-[#F2F2F2]"
                  : "border-transparent text-[#A3A3A3]"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="flex h-[18px] items-center rounded-full bg-[#3A4156] px-1.5 text-[11px] font-medium text-[#DDE1EA]">
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
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
    <div className="space-y-4 px-4 py-5">
      <p className="text-[13px] leading-relaxed text-[#A3A3A3]">
        Semua barang yang harus diperiksa QC. Angka lolos dan defect diperbarui
        oleh QC masing-masing.
      </p>
      <span className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#4690FF] text-sm font-medium text-[#0A0A0A]">
        <PackagePlusIcon className="size-4" /> Tambah barang
      </span>

      <div className="grid grid-cols-2 gap-2.5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col overflow-hidden rounded-xl border border-[#333] bg-[#1B1B1B]"
          >
            <div className="space-y-1.5 p-3">
              <p className="text-[13px] text-[#A3A3A3]">{s.label}</p>
              <p className="text-2xl leading-tight font-bold text-[#F2F2F2] tabular-nums">
                <Counter to={s.to} />
              </p>
            </div>
            <div className="flex-1 space-y-1.5 border-t border-[#333] bg-[#262626] p-3">
              <span className="inline-flex rounded-full border border-[#333] px-2 py-0.5 text-xs font-medium text-[#F2F2F2]">
                {s.chip}
              </span>
              <p className="text-[13px] text-[#A3A3A3]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <Segmented tabs={TABS} value={tab} onChange={setTab} />

      <label className="flex h-9 items-center gap-2 rounded-lg border border-[#333] bg-[#1B1B1B] px-2.5 text-[#A3A3A3] focus-within:border-[#4690FF]">
        <SearchIcon className="size-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari client, item, warna, line, atau nama QC"
          aria-label="Cari barang"
          className="h-full w-full min-w-0 bg-transparent text-[13px] text-[#F2F2F2] outline-none placeholder:text-[#A3A3A3]"
        />
      </label>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${tab}|${query.trim().toLowerCase()}|${rows.length}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="space-y-2.5"
        >
          {rows.length === 0 ? (
            <div className="flex min-h-[100px] items-center justify-center rounded-xl border border-[#333] px-4 text-center text-[13px] text-[#A3A3A3]">
              Tidak ada barang yang cocok. Coba ubah kata pencarian atau pilihan
              tab.
            </div>
          ) : (
            rows.map((r) => {
              const status = STATUS_LABEL[r.status]
              return (
                <div
                  key={r.id}
                  className="space-y-2.5 rounded-xl border border-[#333] bg-[#1B1B1B] p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F2F2F2]">
                        {r.client}
                      </p>
                      <p className="text-xs text-[#A3A3A3]">
                        {r.item} · {r.color} ·{" "}
                        <span className="font-mono">{r.id}</span>
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={status.tone}>{status.text}</Badge>
                    {r.late && (
                      <Badge tone="bg-[#4A2024] text-[#FF5C5C]">
                        Lewat batas waktu
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#A3A3A3]">
                      <span>Diperiksa {r.count}</span>
                      <span>{r.percent}%</span>
                    </div>
                    <Bar
                      percent={r.percent}
                      className="mt-1 h-1"
                      track="bg-[#3A3A3A]"
                      barClassName="bg-[#4690FF]"
                    />
                  </div>
                  <p className="text-xs text-[#A3A3A3]">
                    {r.qc} · {r.line} · Batas {r.time} · Lolos {r.pass} · Defect{" "}
                    {r.defect}
                  </p>
                </div>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PenggunaPage() {
  const [tab, setTab] = useState<"semua" | Role>("semua")
  const users = USERS.filter((u) => tab === "semua" || u.role === tab)

  return (
    <div className="space-y-4 px-4 py-5">
      <p className="text-[13px] leading-relaxed text-[#A3A3A3]">
        Buat akun untuk admin line dan petugas QC. Setiap orang masuk dengan
        username dan password dari Anda, lalu hanya melihat halaman sesuai
        role-nya.
      </p>
      <span className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#4690FF] text-sm font-medium text-[#0A0A0A]">
        <UserPlusIcon className="size-4" /> Tambah pengguna
      </span>
      <Segmented tabs={USER_TABS} value={tab} onChange={setTab} />
      <div className="space-y-2.5">
        {users.map((u) => (
          <motion.div
            key={u.username}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="space-y-3 rounded-xl border border-[#333] bg-[#1B1B1B] p-3"
          >
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#262626] text-sm font-medium text-[#F2F2F2]">
                {u.name.charAt(0)}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#F2F2F2]">
                    {u.name}
                  </span>
                  <Badge tone="bg-[#1B2C4F] text-[#7DB1FF]">{u.role}</Badge>
                </div>
                <p className="text-[13px] text-[#A3A3A3]">
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
            <div className="flex flex-wrap gap-2 text-[13px] font-medium">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1F1F1F] px-2.5 py-[5px] text-[#F2F2F2]">
                <KeyRoundIcon className="size-3.5" /> Buat password baru
              </span>
              <span
                className={`rounded-lg border border-[#333] bg-[#1F1F1F] px-2.5 py-[5px] ${
                  u.open > 0 ? "text-[#A3A3A3]" : "text-[#F2F2F2]"
                }`}
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

export function MockPhone() {
  const [page, setPage] = useState<Page>("barang")
  const [menu, setMenu] = useState(false)

  const go = (p: Page) => {
    setPage(p)
    setMenu(false)
  }
  const nav = (key: Page) =>
    `flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-sm font-medium ${
      page === key ? "bg-[#1B2C4F] text-[#7DB1FF]" : "text-[#F2F2F2]"
    }`

  return (
    <div className="mx-auto h-[660px] w-full max-w-[380px] rounded-[40px] border-x-2 border-t-2 border-[#FFFFFF2A] bg-[linear-gradient(to_bottom_left,#1C1C1C,#080808)] p-2.5 text-left">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#121212]">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-[#333] px-4 text-[15px] font-medium text-[#F2F2F2]">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setMenu(true)}
            className="-m-2 cursor-pointer p-2"
          >
            <PanelLeftIcon className="size-[18px]" />
          </button>
          <span className="h-4 w-px bg-[#333]" />
          {page === "barang" ? "Daftar Barang" : "Pengguna"}
        </div>

        <div className={`flex-1 overflow-y-auto ${noBar}`}>
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

        <AnimatePresence>
          {menu && (
            <>
              <motion.button
                type="button"
                aria-label="Tutup menu"
                className="absolute inset-0 z-10 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenu(false)}
              />
              <motion.aside
                className="absolute inset-y-0 left-0 z-20 flex w-[240px] flex-col justify-between border-r border-[#333] bg-[#1B1B1B]"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div>
                  <div className="flex h-12 items-center gap-2 px-4 text-base font-semibold text-[#F2F2F2]">
                    <ShieldCheckIcon className="size-5" /> Monitoring QC
                  </div>
                  <nav className="space-y-0.5 p-2">
                    <button
                      type="button"
                      className={nav("barang")}
                      onClick={() => go("barang")}
                    >
                      <ListChecksIcon className="size-4" /> Daftar Barang
                    </button>
                    <button
                      type="button"
                      className={nav("pengguna")}
                      onClick={() => go("pengguna")}
                    >
                      <UsersIcon className="size-4" /> Pengguna
                    </button>
                  </nav>
                </div>
                <div className="px-4 pb-3 text-sm text-[#F2F2F2]">
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
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
