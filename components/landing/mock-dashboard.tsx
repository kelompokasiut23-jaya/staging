import {
  ChevronRightIcon,
  ListChecksIcon,
  PackagePlusIcon,
  PanelLeftIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import { Bar, Counter } from "./motion-kit"

const STATS = [
  { label: "Total barang", to: 3850, a: "2 tugas", b: "0 tugas selesai" },
  { label: "Sudah diperiksa", to: 2000, a: "52%", b: "Sisa 1.850 barang" },
  { label: "Defect", to: 165, a: "8,3%", b: "Lolos 1.835 barang" },
  {
    label: "Terlambat",
    to: 2,
    a: "Perlu dicek",
    b: "Lewat batas waktu, belum selesai",
  },
]

const TABS = [
  ["Semua", "2"],
  ["Belum dimulai", "1"],
  ["Sedang diperiksa", "1"],
  ["Selesai", "0"],
  ["Terlambat", "2"],
]

const ROWS = [
  {
    client: "UNIQLO",
    item: "Celana Jeans · Denim · QC-002",
    qc: "Maharani",
    line: "Line 2",
    time: "17.00",
    done: "0 / 1.850",
    percent: 0,
    pass: "0",
    defect: "0",
    status: "Belum dimulai",
    tone: "bg-white/10 text-white/70",
  },
  {
    client: "H&M",
    item: "Kaos Polo Pria · Navy · QC-001",
    qc: "Fathiya",
    line: "Line 1",
    time: "12.00",
    done: "2.000 / 2.000",
    percent: 100,
    pass: "1.835",
    defect: "165",
    status: "Sedang diperiksa",
    tone: "bg-[#3b82f6]/20 text-[#7db1ff]",
  },
]

/** Tampilan contoh halaman Daftar Barang. Semua angka adalah contoh, bukan data asli. */
export function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111113] text-left shadow-[0_40px_120px_-30px_rgba(59,130,246,0.35)] md:grid md:grid-cols-[210px_1fr]">
      <aside className="hidden flex-col gap-4 border-r border-white/10 p-3 md:flex">
        <div className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-semibold text-white">
          <ShieldCheckIcon className="size-4" /> Monitoring QC
        </div>
        <div className="space-y-1 text-[12px]">
          <div className="flex items-center gap-2 rounded-md bg-[#3b82f6]/20 px-2.5 py-2 text-[#8bb8ff]">
            <ListChecksIcon className="size-3.5" /> Daftar Barang
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 text-white/70">
            <UsersIcon className="size-3.5" /> Pengguna
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-[12px] text-white">
          <PanelLeftIcon className="size-3.5 text-white/60" />
          <span className="h-3.5 w-px bg-white/15" />
          Daftar Barang
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[11px] text-white/50">
              Semua barang yang harus diperiksa QC. Angka lolos dan defect
              diperbarui oleh QC masing-masing.
            </p>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#3b82f6] px-3 text-[11px] font-medium text-white">
              <PackagePlusIcon className="size-3" /> Tambah barang
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <div className="p-3">
                  <p className="text-[10px] text-white/50">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white tabular-nums sm:text-[28px]">
                    <Counter to={s.to} />
                  </p>
                </div>
                <div className="space-y-1 border-t border-white/10 bg-white/[0.03] p-3 text-[10px]">
                  <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-white">
                    {s.a}
                  </span>
                  <p className="text-white/50">{s.b}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {TABS.map(([name, n], i) => (
              <span
                key={name}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${
                  i === 0 ? "bg-white/10 text-white" : "text-white/60"
                }`}
              >
                {name}
                <span className="rounded-full bg-white/10 px-1.5 text-[9px]">
                  {n}
                </span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-[11px] text-white/40">
            <SearchIcon className="size-3" /> Cari client, item, warna, line,
            atau nama QC
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[640px] text-[11px]">
              <thead className="text-left text-white/60">
                <tr className="border-b border-white/10">
                  {[
                    "Client / Item",
                    "QC",
                    "Batas selesai",
                    "Diperiksa",
                    "Lolos",
                    "Defect",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.client}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">{r.client}</p>
                      <p className="text-[10px] text-white/40">{r.item}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-white">{r.qc}</p>
                      <p className="text-[10px] text-white/40">{r.line}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-white">{r.time}</span>{" "}
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] text-red-400">
                        Lewat batas waktu
                      </span>
                    </td>
                    <td className="w-36 px-3 py-3">
                      <div className="flex justify-between text-[10px] text-white/50">
                        <span>{r.done}</span>
                        <span>{r.percent}%</span>
                      </div>
                      <Bar percent={r.percent} className="mt-1 h-1" />
                    </td>
                    <td className="px-3 py-3 text-white">{r.pass}</td>
                    <td className="px-3 py-3 text-white">{r.defect}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${r.tone}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white/40">
                      <ChevronRightIcon className="size-3.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
