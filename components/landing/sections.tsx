"use client"

import {
  AlarmClockIcon,
  ArrowUpRightIcon,
  BellRingIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  GaugeIcon,
  HistoryIcon,
  LayoutGridIcon,
  ListChecksIcon,
  RulerIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Bar, Counter, EASE, Reveal, Stagger, StaggerItem } from "./motion-kit"

export const card =
  "rounded-[22px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 sm:p-6"

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/90">
      {children}
    </span>
  )
}

export function SectionHead({
  id,
  badge,
  title,
  text,
}: {
  id?: string
  badge: string
  title: string
  text: string
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <div id={id} className="scroll-mt-24">
        <Pill>{badge}</Pill>
      </div>
      <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
        {text}
      </p>
    </Reveal>
  )
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
      {children}
    </span>
  )
}

function CardHead({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <>
      <IconBox>{icon}</IconBox>
      <h3 className="mt-5 text-lg font-medium text-white">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-white/50">{text}</p>
    </>
  )
}

const inner = "rounded-xl border border-white/10 bg-black/30 p-3"

function Ring({ percent }: { percent: number }) {
  const reduce = useReducedMotion()
  const r = 22
  return (
    <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="5"
      />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="5"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: percent / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
      />
    </svg>
  )
}

export function Features() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="fitur"
        badge="Fitur"
        title="Informasi Lebih Jelas. Tebakan Lebih Sedikit."
        text="Setiap kali QC menyimpan hasil, angka di dashboard ikut berubah. Tidak perlu menunggu laporan."
      />

      <Stagger className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-6">
        <StaggerItem className={`${card} md:col-span-3`}>
          <CardHead
            icon={<LayoutGridIcon className="size-4" />}
            title="Angka yang penting, sekali lihat"
            text="Total barang, yang sudah diperiksa, defect, dan tugas terlambat. Selalu terbaru."
          />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Total barang", 3850, "2 tugas", "text-white/50"],
              ["Diperiksa", 2000, "52%", "text-emerald-400"],
              ["Defect", 165, "8,3%", "text-orange-400"],
              ["Terlambat", 2, "Cek", "text-red-400"],
            ].map(([l, n, s, tone]) => (
              <div key={l as string} className={inner}>
                <p className="text-[10px] text-white/45">{l}</p>
                <p className="mt-1 text-xl font-semibold text-white tabular-nums">
                  <Counter to={n as number} />
                </p>
                <p className={`mt-1 text-[10px] ${tone}`}>{s}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-white/50">
            <span>Sudah diperiksa dari seluruh target</span>
            <span className="text-white">2.000 / 3.850</span>
          </div>
          <Bar percent={52} className="mt-2" barClassName="bg-[#3b82f6]" />
        </StaggerItem>

        <StaggerItem className={`${card} md:col-span-3`}>
          <CardHead
            icon={<AlarmClockIcon className="size-4" />}
            title="Terlambat? Langsung ketahuan"
            text="Tugas yang lewat batas waktu dan belum selesai ditandai merah."
          />
          <div
            className={`${inner} mt-5 flex items-center justify-between gap-3`}
          >
            <div>
              <p className="text-sm font-medium text-white">UNIQLO</p>
              <p className="text-[10px] text-white/45">
                Celana Jeans · batas 17.00
              </p>
            </div>
            <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-1 text-[10px] text-red-400">
              Lewat 426 jam
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-500/20 to-red-500/5 p-3">
            <BellRingIcon className="size-4 shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white">
                2 tugas perlu dicek
              </p>
              <p className="text-[10px] text-white/50">
                Lewat batas waktu, belum selesai
              </p>
            </div>
            <ArrowUpRightIcon className="size-3.5 text-red-400" />
          </div>
        </StaggerItem>

        <StaggerItem className={`${card} md:col-span-2`}>
          <CardHead
            icon={<GaugeIcon className="size-4" />}
            title="Progres tiap tugas"
            text="Lihat berapa barang yang sudah diperiksa dari targetnya."
          />
          <div className={`${inner} mt-5 flex items-center gap-3`}>
            <div className="relative">
              <Ring percent={52} />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">
                52%
              </span>
            </div>
            <div>
              <p className="text-[10px] text-white/45">Sudah diperiksa</p>
              <p className="text-sm font-medium text-white">2.000 dari 3.850</p>
              <p className="text-[10px] text-white/45">Sisa 1.850 barang</p>
            </div>
          </div>
          {[
            ["H&M · Kaos Polo Pria", 100, "2.000 / 2.000 barang"],
            ["UNIQLO · Celana Jeans", 0, "0 / 1.850 barang"],
          ].map(([n, p, s]) => (
            <div key={n as string} className="mt-4">
              <div className="flex justify-between text-[11px] text-white">
                <span>{n}</span>
                <span className="text-white/50">{p}%</span>
              </div>
              <Bar percent={p as number} className="mt-1.5 h-1" />
              <p className="mt-1 text-[10px] text-white/40">{s}</p>
            </div>
          ))}
        </StaggerItem>

        <StaggerItem className={`${card} md:col-span-2`}>
          <CardHead
            icon={<RulerIcon className="size-4" />}
            title="Rincian per ukuran"
            text="Lolos, defect, dan sisa yang belum diperiksa untuk S, M, L, dan seterusnya."
          />
          <div className={`${inner} mt-5 text-[11px]`}>
            <div className="grid grid-cols-4 pb-2 text-[10px] text-white/45">
              <span>Ukuran</span>
              <span className="text-right">Target</span>
              <span className="text-right">Lolos</span>
              <span className="text-right">Defect</span>
            </div>
            {[
              ["S", "1.000", "900", "100"],
              ["M", "500", "445", "55"],
              ["L", "500", "490", "10"],
            ].map(([s, t, p, d]) => (
              <div
                key={s}
                className="grid grid-cols-4 border-t border-white/5 py-2 text-white"
              >
                <span>{s}</span>
                <span className="text-right">{t}</span>
                <span className="text-right text-emerald-400">{p}</span>
                <span className="text-right text-red-400">{d}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              whileInView={{ width: "91.7%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            />
            <div className="h-full flex-1 bg-red-500" />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/50">
            <span>● Lolos 1.835</span>
            <span>● Defect 165 (8,3%)</span>
          </div>
        </StaggerItem>

        <StaggerItem className={`${card} md:col-span-2`}>
          <CardHead
            icon={<HistoryIcon className="size-4" />}
            title="Riwayat dari QC"
            text="Setiap simpan hasil tercatat lengkap dengan nama, waktu, dan catatan."
          />
          <div className={`${inner} mt-5 space-y-3`}>
            {[
              ["1 Okt, 17.31", "Banyak defect jahitan kerut pada ukuran M"],
              ["1 Okt, 16.46", ""],
              ["1 Okt, 16.43", ""],
            ].map(([t, note]) => (
              <div key={t}>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-semibold text-white">
                    F
                  </span>
                  <span className="text-white">Hasil disimpan</span>
                  <span className="text-[10px] text-white/40">
                    Fathiya · {t}
                  </span>
                </div>
                {note && (
                  <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] text-white/70">
                    {note}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#3b82f6]/20 text-[#7db1ff]">
              <ClipboardCheckIcon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-white">
                3 hasil tersimpan
              </p>
              <p className="text-[10px] text-white/45">Terakhir 1 Okt, 17.31</p>
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  )
}

export function Steps() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="cara-kerja"
        badge="Cara kerja"
        title="Tiga Langkah, Dari Barang Masuk Sampai Laporan."
        text="Tanpa spreadsheet dan tanpa rekap lewat chat. Setiap peran tahu persis apa tugasnya."
      />
      <Stagger className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
        <StaggerItem className={card}>
          <div className={`${inner} h-44`}>
            <p className="text-xs font-medium text-white">Barang yang masuk</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-white/40">Client</p>
                <p className="mt-1 rounded-md bg-white/5 px-2 py-1.5 text-white">
                  H&M
                </p>
              </div>
              <div>
                <p className="text-white/40">Item</p>
                <p className="mt-1 rounded-md bg-white/5 px-2 py-1.5 text-white">
                  Kaos Polo Pria
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-[10px]">
              {[
                ["S", "1.000"],
                ["M", "500"],
                ["L", "500"],
              ].map(([s, n]) => (
                <span
                  key={s}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-white"
                >
                  <span className="text-[#7db1ff]">{s}</span> {n}
                </span>
              ))}
            </div>
          </div>
          <StepFoot n={1} role="Admin" title="Admin menambah barang">
            Isi client, item, warna, dan jumlah per ukuran. Pilih QC yang
            memeriksa, lalu tentukan batas selesai.
          </StepFoot>
        </StaggerItem>

        <StaggerItem className={card}>
          <div className={`${inner} h-44`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">Kaos Polo Pria</p>
              <span className="rounded-full bg-[#3b82f6]/20 px-2 py-0.5 text-[9px] text-[#7db1ff]">
                Sedang diperiksa
              </span>
            </div>
            <div className="mt-3 space-y-2 text-[10px]">
              {[
                ["S", 900, 100],
                ["M", 445, 55],
                ["L", 490, 10],
              ].map(([s, p, d]) => (
                <div
                  key={s}
                  className="grid grid-cols-[auto_1fr_1fr] items-center gap-2"
                >
                  <span className="font-medium text-white">{s}</span>
                  <span className="flex justify-between rounded-md bg-white/5 px-2 py-1.5">
                    <span className="text-white/40">Lolos</span>
                    <span className="text-emerald-400">{p}</span>
                  </span>
                  <span className="flex justify-between rounded-md bg-white/5 px-2 py-1.5">
                    <span className="text-white/40">Defect</span>
                    <span className="text-red-400">{d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <StepFoot n={2} role="QC" title="QC mengisi hasil">
            QC membuka tugasnya dan menyimpan angka lolos dan defect untuk
            setiap ukuran, dengan catatan bila perlu.
          </StepFoot>
        </StaggerItem>

        <StaggerItem className={card}>
          <div className={`${inner} h-44`}>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/5 p-2.5">
                <p className="text-[9px] text-white/40">Diperiksa</p>
                <p className="text-lg font-semibold text-emerald-400">52%</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2.5">
                <p className="text-[9px] text-white/40">Defect</p>
                <p className="text-lg font-semibold text-red-400">8,3%</p>
              </div>
            </div>
            <Bar percent={52} className="mt-3 h-1" />
            <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-[10px] text-red-400">
              ⚠ Lewat batas waktu 426 jam
            </p>
          </div>
          <StepFoot n={3} role="Admin" title="Admin memantau">
            Progres, defect, dan tugas terlambat tampil di dashboard, lengkap
            dengan riwayat dari QC.
          </StepFoot>
        </StaggerItem>
      </Stagger>
    </section>
  )
}

function StepFoot({
  n,
  role,
  title,
  children,
}: {
  n: number
  role: string
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="mt-5 flex gap-2">
        <span className="rounded-full bg-[#3b82f6] px-2.5 py-0.5 text-[10px] font-medium text-white">
          Langkah {n}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/80">
          {role}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-medium text-white">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-white/50">{children}</p>
    </>
  )
}

const ROLES = [
  {
    name: "Super admin",
    chips: ["S"],
    icon: ShieldCheckIcon,
    featured: true,
    text: "Membuat dan mengelola akun admin line dan QC, termasuk membuat password baru bila ada yang lupa.",
    points: [
      "Membuat akun admin line dan QC",
      "Membuat password baru",
      "Menonaktifkan pengguna",
    ],
  },
  {
    name: "Admin line",
    chips: ["R"],
    icon: ListChecksIcon,
    text: "Memantau progres, defect, dan keterlambatan barang di lini yang dipegang.",
    points: [
      "Melihat progres tiap tugas",
      "Memantau defect per ukuran",
      "Mengecek tugas terlambat",
    ],
  },
  {
    name: "QC",
    chips: ["F", "M"],
    icon: ClipboardCheckIcon,
    text: "Melihat tugas miliknya, menyimpan hasil lolos dan defect per ukuran, dan menambahkan catatan.",
    points: [
      "Mengisi lolos dan defect",
      "Menambah catatan hasil",
      "Melihat riwayat sendiri",
    ],
  },
]

export function Roles() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="peran"
        badge="Peran"
        title="Setiap Orang Hanya Melihat Yang Perlu Dilihat."
        text="Super admin membuat akun dan membagikan username serta password. Halaman yang muncul menyesuaikan peran masing-masing."
      />
      <Stagger className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
        {ROLES.map((r) => (
          <StaggerItem
            key={r.name}
            className={`${card} ${r.featured ? "border-[#3b82f6]/40" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex size-10 items-center justify-center rounded-full ${
                  r.featured
                    ? "bg-[#3b82f6] text-white"
                    : "border border-white/10 bg-white/5 text-white/80"
                }`}
              >
                <r.icon className="size-4.5" />
              </span>
              <span className="flex gap-1">
                {r.chips.map((c) => (
                  <span
                    key={c}
                    className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70"
                  >
                    {c}
                  </span>
                ))}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-medium text-white">{r.name}</h3>
            <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-white/50">
              {r.text}
            </p>
            <ul
              className={`${inner} mt-5 space-y-2.5 text-[11px] text-white/80`}
            >
              {r.points.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-3.5 text-[#3b82f6]" />
                  {p}
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
