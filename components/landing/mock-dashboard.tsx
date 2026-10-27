import {
  ChevronRightIcon,
  KeyRoundIcon,
  ListChecksIcon,
  LogOutIcon,
  PackagePlusIcon,
  PanelLeftIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import { Bar, Counter } from "./motion-kit"

/*
 * Salinan halaman "Daftar Barang" pada ukuran aslinya (1380 x 760).
 * Datanya contoh, bukan data asli. Ukurannya diperkecil oleh MockupStage.
 */

const STATS = [
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

const TABS = [
  ["Semua", "2"],
  ["Belum dimulai", "1"],
  ["Sedang diperiksa", "1"],
  ["Selesai", "0"],
  ["Terlambat", "2"],
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

function Badge({
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

function Row({
  client,
  item,
  id,
  qc,
  line,
  time,
  count,
  percent,
  pass,
  defect,
  status,
  statusTone,
  last,
}: {
  client: string
  item: string
  id: string
  qc: string
  line: string
  time: string
  count: string
  percent: number
  pass: string
  defect: string
  status: string
  statusTone: string
  last?: boolean
}) {
  return (
    <div
      className={`flex h-[53px] items-center ${last ? "" : "border-b border-[#333]"}`}
    >
      <div className={`${COLS[0]} px-2`}>
        <p className="text-sm font-medium text-[#F2F2F2]">{client}</p>
        <p className="flex gap-1 text-xs text-[#A3A3A3]">
          {item} <span className="font-mono">{id}</span>
        </p>
      </div>
      <div className={`${COLS[1]} px-2`}>
        <p className="text-sm text-[#F2F2F2]">{qc}</p>
        <p className="text-xs text-[#A3A3A3]">{line}</p>
      </div>
      <div
        className={`${COLS[2]} flex items-center gap-2 px-2 text-sm text-[#F2F2F2]`}
      >
        {time}
        <Badge tone="bg-[#4A2024] text-[#FF5C5C]">Lewat batas waktu</Badge>
      </div>
      <div className={`${COLS[3]} px-2`}>
        <div className="flex justify-between text-xs text-[#A3A3A3]">
          <span>{count}</span>
          <span>{percent}%</span>
        </div>
        <Bar
          percent={percent}
          className="mt-1 h-1"
          track="bg-[#3A3A3A]"
          barClassName="bg-[#4690FF]"
        />
      </div>
      <div className={`${COLS[4]} px-2 text-right text-sm text-[#F2F2F2]`}>
        {pass}
      </div>
      <div className={`${COLS[5]} px-2 text-right text-sm text-[#F2F2F2]`}>
        {defect}
      </div>
      <div className={`${COLS[6]} px-2`}>
        <Badge tone={statusTone}>{status}</Badge>
      </div>
      <div className={`${COLS[7]} flex justify-end px-2 text-[#A3A3A3]`}>
        <ChevronRightIcon className="size-4" />
      </div>
    </div>
  )
}

export function MockDashboard() {
  return (
    <div className="h-[760px] w-[1380px] overflow-hidden rounded-[40px] border-x-2 border-t-2 border-[#FFFFFF2A] bg-[linear-gradient(to_bottom_left,#1C1C1C,#080808)] p-3 text-left">
      <div className="flex h-full overflow-hidden rounded-[30px] bg-[#121212]">
        <aside className="flex w-[288px] shrink-0 flex-col justify-between border-r border-[#333] bg-[#1B1B1B]">
          <div>
            <div className="flex h-12 items-center gap-2 px-4 text-base font-semibold text-[#F2F2F2]">
              <ShieldCheckIcon className="size-5" /> Monitoring QC
            </div>
            <div className="space-y-0 p-2 text-sm font-medium">
              <div className="flex h-8 items-center gap-2 rounded-lg bg-[#1B2C4F] px-2 text-[#7DB1FF]">
                <ListChecksIcon className="size-4" /> Daftar Barang
              </div>
              <div className="flex h-8 items-center gap-2 px-2 text-[#F2F2F2]">
                <UsersIcon className="size-4" /> Pengguna
              </div>
            </div>
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
            Daftar Barang
          </div>

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
                  className="flex-1 overflow-hidden rounded-xl border border-[#333] bg-[#1B1B1B]"
                >
                  <div className="space-y-2 p-4">
                    <p className="text-sm text-[#A3A3A3]">{s.label}</p>
                    <p className="text-[32px] leading-tight font-bold text-[#F2F2F2] tabular-nums">
                      <Counter to={s.to} />
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-[#333] bg-[#262626] p-4">
                    <span className="inline-flex rounded-full border border-[#333] px-2 py-0.5 text-xs font-medium text-[#F2F2F2]">
                      {s.chip}
                    </span>
                    <p className="text-sm text-[#A3A3A3]">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3.5">
              <div className="inline-flex gap-0.5 rounded-[10px] bg-[#1B1B1B] p-[3px] text-sm">
                {TABS.map(([name, n], i) => (
                  <span
                    key={name}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                      i === 0
                        ? "border border-[#333] bg-[#121212] font-medium text-[#F2F2F2]"
                        : "text-[#A3A3A3]"
                    }`}
                  >
                    {name}
                    <span className="flex h-5 items-center rounded-full bg-[#3A4156] px-1.5 text-xs font-medium text-[#DDE1EA]">
                      {n}
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex h-8 items-center gap-2 rounded-lg border border-[#333] bg-[#1B1B1B] px-2.5 text-sm text-[#A3A3A3]">
                <SearchIcon className="size-4" /> Cari client, item, warna,
                line, atau nama QC
              </div>
            </div>

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
              <Row
                client="UNIQLO"
                item="Celana Jeans · Denim ·"
                id="QC-002"
                qc="Maharani"
                line="Line 2"
                time="17.00"
                count="0 / 1.850"
                percent={0}
                pass="0"
                defect="0"
                status="Belum dimulai"
                statusTone="bg-[#2A3042] text-[#E6E9F0]"
              />
              <Row
                client="H&M"
                item="Kaos Polo Pria · Navy ·"
                id="QC-001"
                qc="Fathiya"
                line="Line 1"
                time="12.00"
                count="2.000 / 2.000"
                percent={100}
                pass="1.835"
                defect="165"
                status="Sedang diperiksa"
                statusTone="bg-[#1B2C4F] text-[#7DB1FF]"
                last
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
