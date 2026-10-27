"use client"

import {
  AlarmClockIcon,
  ArrowUpRightIcon,
  BellRingIcon,
  CircleCheckIcon,
  ClipboardCheckIcon,
  FileCheckIcon,
  GaugeIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  RulerIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Bar, Counter, EASE, Stagger, StaggerItem } from "./motion-kit"
import { Beams, CARD, Glow, PAD_X, SectionHead, Stage, TILE } from "./ui"

const card = `${CARD} flex flex-col gap-[22px] p-6 sm:p-7`

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
    <div className="flex flex-col gap-3.5">
      <span className="flex size-[42px] items-center justify-center rounded-full border border-[#FFFFFF14] bg-[#FFFFFF14] text-white">
        {icon}
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl leading-[1.15] font-medium tracking-[-0.033em] text-[#F5F5F5]">
          {title}
        </h3>
        <p className="text-sm leading-[1.55] text-[#8C8C8C]">{text}</p>
      </div>
    </div>
  )
}

function Donut({ percent }: { percent: number }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 78 78" className="size-[78px] -rotate-90">
      <circle
        cx="39"
        cy="39"
        r="35.1"
        fill="none"
        stroke="#2A2A2A"
        strokeWidth="7.8"
      />
      <motion.circle
        cx="39"
        cy="39"
        r="35.1"
        fill="none"
        stroke="#4690FF"
        strokeWidth="7.8"
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
    <section className={`relative ${PAD_X} pt-[72px] pb-[120px]`}>
      <Stage>
        <Glow x={620} y={40} w={1000} h={560} color="#0D1B30" />
        <Glow x={-320} y={790} w={860} h={560} color="#0A1424" />
        <Beams side="right" />
      </Stage>

      <div className="relative flex flex-col items-center gap-14">
        <SectionHead
          id="fitur"
          badge="Fitur"
          title="Informasi Lebih Jelas. Tebakan Lebih Sedikit."
          text="Setiap kali QC menyimpan hasil, angka di dashboard ikut berubah. Tidak perlu menunggu laporan."
        />

        <Stagger className="flex w-full max-w-[1280px] flex-col gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <StaggerItem className={card}>
              <CardHead
                icon={<LayoutDashboardIcon className="size-[19px]" />}
                title="Angka yang penting, sekali lihat"
                text="Total barang, yang sudah diperiksa, defect, dan tugas terlambat. Selalu terbaru."
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Total barang", 3850, "2 tugas", "text-[#8C8C8C]"],
                  ["Diperiksa", 2000, "52%", "text-[#2DD36F]"],
                  ["Defect", 165, "8,3%", "text-[#FF7A45]"],
                  ["Terlambat", 2, "Cek", "text-[#F0525A]"],
                ].map(([l, n, s, tone]) => (
                  <div
                    key={l as string}
                    className={`${TILE} flex flex-col gap-1.5 rounded-[20px] p-4`}
                  >
                    <span className="text-xs text-[#8C8C8C]">{l}</span>
                    <span className="text-[28px] leading-tight font-medium tracking-[-0.036em] text-[#F5F5F5] tabular-nums">
                      <Counter to={n as number} />
                    </span>
                    <span className={`text-xs font-medium ${tone}`}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8C8C8C]">
                    Sudah diperiksa dari seluruh target
                  </span>
                  <span className="font-medium text-[#F5F5F5]">
                    2.000 / 3.850
                  </span>
                </div>
                <Bar
                  percent={52}
                  className="h-2"
                  barClassName="bg-[linear-gradient(90deg,#7DB2FF,#4690FF)]"
                />
              </div>
            </StaggerItem>

            <StaggerItem className={`${card} lg:justify-between`}>
              <CardHead
                icon={<AlarmClockIcon className="size-[19px]" />}
                title="Terlambat? Langsung ketahuan"
                text="Tugas yang lewat batas waktu dan belum selesai ditandai merah."
              />
              <div
                className={`${TILE} flex items-center justify-between gap-3 rounded-[20px] px-4 py-3.5`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-[#F5F5F5]">
                    UNIQLO
                  </span>
                  <span className="text-xs text-[#8C8C8C]">
                    Celana Jeans · batas 17.00
                  </span>
                </div>
                <span className="rounded-full border border-[#F0525A55] bg-[#F0525A26] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#FF7B82]">
                  Lewat 426 jam
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-[20px] border border-[#F0525A55] bg-[linear-gradient(to_bottom_left,#F0525A33,#F0525A08)] px-4 py-3.5">
                <BellRingIcon className="size-5 shrink-0 text-[#FF7B82]" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#F5F5F5]">
                    2 tugas perlu dicek
                  </span>
                  <span className="text-xs text-[#8C8C8C]">
                    Lewat batas waktu, belum selesai
                  </span>
                </div>
                <ArrowUpRightIcon className="size-[18px] text-[#FF7B82]" />
              </div>
            </StaggerItem>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <StaggerItem className={card}>
              <CardHead
                icon={<GaugeIcon className="size-[19px]" />}
                title="Progres tiap tugas"
                text="Lihat berapa barang yang sudah diperiksa dari targetnya."
              />
              <div
                className={`${TILE} flex items-center gap-4 rounded-[22px] p-4`}
              >
                <div className="relative shrink-0">
                  <Donut percent={52} />
                  <span className="absolute inset-0 flex items-center justify-center text-[17px] font-semibold text-[#F5F5F5]">
                    52%
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#8C8C8C]">
                    Sudah diperiksa
                  </span>
                  <span className="text-[17px] font-medium text-[#F5F5F5]">
                    2.000 dari 3.850
                  </span>
                  <span className="text-xs text-[#8C8C8C]">
                    Sisa 1.850 barang
                  </span>
                </div>
              </div>
              {[
                ["H&M · Kaos Polo Pria", 100, "2.000 / 2.000 barang"],
                ["UNIQLO · Celana Jeans", 0, "0 / 1.850 barang"],
              ].map(([n, p, s]) => (
                <div key={n as string} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium text-[#F5F5F5]">{n}</span>
                    <span className="text-[#8C8C8C]">{p}%</span>
                  </div>
                  <Bar percent={p as number} className="h-1.5" />
                  <span className="text-xs text-[#8C8C8C]">{s}</span>
                </div>
              ))}
            </StaggerItem>

            <StaggerItem className={card}>
              <CardHead
                icon={<RulerIcon className="size-[19px]" />}
                title="Rincian per ukuran"
                text="Lolos, defect, dan sisa yang belum diperiksa untuk S, M, L, dan seterusnya."
              />
              <div
                className={`${TILE} flex flex-1 flex-col rounded-[20px] text-[13px]`}
              >
                <div className="grid grid-cols-4 px-[18px] py-2.5 font-medium text-[#6E6E6E]">
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
                    className="grid flex-1 grid-cols-4 items-center px-[18px] py-2.5"
                  >
                    <span className="font-medium text-[#F5F5F5]">{s}</span>
                    <span className="text-right text-[#F5F5F5]">{t}</span>
                    <span className="text-right text-[#2DD36F]">{p}</span>
                    <span className="text-right text-[#F0525A]">{d}</span>
                  </div>
                ))}
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-[#F0525A]">
                <motion.div
                  className="h-full bg-[#2DD36F]"
                  initial={{ width: 0 }}
                  whileInView={{ width: "91.7%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#8C8C8C]">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#2DD36F]" /> Lolos 1.835
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#F0525A]" /> Defect 165
                  (8,3%)
                </span>
              </div>
            </StaggerItem>

            <StaggerItem className={`${card} md:col-span-2 lg:col-span-1`}>
              <CardHead
                icon={<HistoryIcon className="size-[19px]" />}
                title="Riwayat dari QC"
                text="Setiap simpan hasil tercatat lengkap dengan nama, waktu, dan catatan."
              />
              {[
                ["1 Okt, 17.31", "Banyak defect jahitan kerut pada ukuran M"],
                ["1 Okt, 16.46", ""],
                ["1 Okt, 16.43", ""],
              ].map(([t, note]) => (
                <div key={t} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-[26px] items-center justify-center rounded-full bg-[#4690FF] text-[11px] font-semibold text-[#0A0A0A]">
                      F
                    </span>
                    <span className="text-sm font-medium text-[#F5F5F5]">
                      Hasil disimpan
                    </span>
                    <span className="text-xs text-[#8C8C8C]">
                      · Fathiya · {t}
                    </span>
                  </div>
                  {note && (
                    <p
                      className={`${TILE} rounded-2xl px-3.5 py-2.5 text-[13px] text-[#CFCFCF]`}
                    >
                      {note}
                    </p>
                  )}
                </div>
              ))}
              <div
                className={`${TILE} flex flex-1 items-center gap-3 rounded-[20px] px-4 py-3.5`}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#4690FF33] text-[#6AA5FF]">
                  <FileCheckIcon className="size-[17px]" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[#F5F5F5]">
                    3 hasil tersimpan
                  </span>
                  <span className="text-xs text-[#8C8C8C]">
                    Terakhir 1 Okt, 17.31
                  </span>
                </div>
              </div>
            </StaggerItem>
          </div>
        </Stagger>
      </div>
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full bg-[#4690FF] px-3 py-[5px] text-xs font-semibold text-[#0A0A0A]">
          Langkah {n}
        </span>
        <span className="rounded-full bg-[#FFFFFF14] px-3 py-[5px] text-xs font-medium text-[#D8D8D8]">
          {role}
        </span>
      </div>
      <h3 className="text-2xl leading-[1.15] font-medium tracking-[-0.033em] text-[#F5F5F5]">
        {title}
      </h3>
      <p className="text-sm leading-[1.6] text-[#8C8C8C]">{children}</p>
    </div>
  )
}

const mini = `${TILE} flex min-h-[196px] flex-col gap-3 rounded-3xl p-[18px]`
const field =
  "rounded-xl border border-[#FFFFFF14] bg-[#0A0A0A] px-3 py-[9px] text-[13px] text-[#F5F5F5]"

export function Steps() {
  return (
    <section className={`relative ${PAD_X} pt-6 pb-[120px]`}>
      <Stage>
        <Glow x={260} y={20} w={920} h={520} color="#0B182A" />
        <Glow x={840} y={260} w={700} h={520} color="#09121F" />
      </Stage>

      <div className="relative flex flex-col items-center gap-14">
        <SectionHead
          id="cara-kerja"
          badge="Cara kerja"
          title="Tiga Langkah, Dari Barang Masuk Sampai Laporan."
          text="Tanpa spreadsheet dan tanpa rekap lewat chat. Setiap peran tahu persis apa tugasnya."
        />

        <Stagger className="grid w-full max-w-[1280px] gap-5 lg:grid-cols-3">
          <StaggerItem className={`${CARD} flex flex-col gap-6 p-6`}>
            <div className={mini}>
              <span className="text-sm font-semibold text-[#F5F5F5]">
                Barang yang masuk
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#8C8C8C]">Client</span>
                  <span className={field}>H&M</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#8C8C8C]">Item</span>
                  <span className={field}>Kaos Polo Pria</span>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  ["S", "1.000"],
                  ["M", "500"],
                  ["L", "500"],
                ].map(([s, n]) => (
                  <span
                    key={s}
                    className="flex gap-1.5 rounded-full bg-[#FFFFFF14] px-3 py-[5px] text-xs text-[#E0E0E0]"
                  >
                    <b className="font-semibold text-[#6AA5FF]">{s}</b> {n}
                  </span>
                ))}
              </div>
            </div>
            <StepFoot n={1} role="Admin" title="Admin menambah barang">
              Isi client, item, warna, dan jumlah per ukuran. Pilih QC yang
              memeriksa, lalu tentukan batas selesai.
            </StepFoot>
          </StaggerItem>

          <StaggerItem className={`${CARD} flex flex-col gap-6 p-6`}>
            <div className={mini}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F5F5F5]">
                  Kaos Polo Pria
                </span>
                <span className="rounded-full border border-[#4690FF55] bg-[#4690FF26] px-2.5 py-[3px] text-[11px] font-medium text-[#8DB8FF]">
                  Sedang diperiksa
                </span>
              </div>
              {[
                ["S", "900", "100"],
                ["M", "445", "55"],
                ["L", "490", "10"],
              ].map(([s, p, d]) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-3.5 text-[13px] font-semibold text-[#F5F5F5]">
                    {s}
                  </span>
                  <span className="flex flex-1 justify-between rounded-xl border border-[#FFFFFF12] bg-[#0A0A0A] px-3 py-1.5 text-[11px] text-[#8C8C8C]">
                    Lolos{" "}
                    <b className="text-[13px] font-semibold text-[#2DD36F]">
                      {p}
                    </b>
                  </span>
                  <span className="flex flex-1 justify-between rounded-xl border border-[#FFFFFF12] bg-[#0A0A0A] px-3 py-1.5 text-[11px] text-[#8C8C8C]">
                    Defect{" "}
                    <b className="text-[13px] font-semibold text-[#F0525A]">
                      {d}
                    </b>
                  </span>
                </div>
              ))}
            </div>
            <StepFoot n={2} role="QC" title="QC mengisi hasil">
              QC membuka tugasnya dan menyimpan angka lolos dan defect untuk
              setiap ukuran, dengan catatan bila perlu.
            </StepFoot>
          </StaggerItem>

          <StaggerItem className={`${CARD} flex flex-col gap-6 p-6`}>
            <div className={mini}>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ["Diperiksa", "52%", "text-[#2DD36F]"],
                  ["Defect", "8,3%", "text-[#F0525A]"],
                ].map(([l, v, tone]) => (
                  <div
                    key={l}
                    className="flex flex-col gap-0.5 rounded-2xl border border-[#FFFFFF12] bg-[#0A0A0A] p-3"
                  >
                    <span className="text-[11px] text-[#8C8C8C]">{l}</span>
                    <span className={`text-2xl font-medium ${tone}`}>{v}</span>
                  </div>
                ))}
              </div>
              <Bar percent={26} className="h-1.5" />
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-[#F0525A44] bg-[#F0525A1F] px-3 py-[9px] text-xs font-medium text-[#FF7B82]">
                <TriangleAlertIcon className="size-3.5" />
                Lewat batas waktu 426 jam
              </div>
            </div>
            <StepFoot n={3} role="Admin" title="Admin memantau">
              Progres, defect, dan tugas terlambat tampil di dashboard, lengkap
              dengan riwayat dari QC.
            </StepFoot>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
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
    <section className={`relative ${PAD_X} pt-6 pb-[120px]`}>
      <Stage>
        <Glow x={-260} y={40} w={820} h={600} color="#0A1424" />
        <Glow x={760} y={30} w={900} h={560} color="#0D1B30" />
        <Beams side="left" />
      </Stage>

      <div className="relative flex flex-col items-center gap-14">
        <SectionHead
          id="peran"
          badge="Peran"
          title="Setiap Orang Hanya Melihat Yang Perlu Dilihat."
          text="Super admin membuat akun dan membagikan username serta password. Halaman yang muncul menyesuaikan peran masing-masing."
        />

        <Stagger className="grid w-full max-w-[1280px] gap-5 lg:grid-cols-3">
          {ROLES.map((r) => (
            <StaggerItem
              key={r.name}
              className={`${CARD} flex flex-col gap-6 p-7 ${r.featured ? "!border-[#4690FF66]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-14 items-center justify-center rounded-full ${
                    r.featured
                      ? "bg-[#4690FF] text-[#0A0A0A]"
                      : "border border-[#FFFFFF14] bg-[#FFFFFF14] text-white"
                  }`}
                >
                  <r.icon className="size-6" />
                </span>
                <span className="flex gap-1">
                  {r.chips.map((c) => (
                    <span
                      key={c}
                      className="flex size-[30px] items-center justify-center rounded-full border border-[#FFFFFF1A] bg-[#FFFFFF1A] text-xs font-semibold text-[#F5F5F5]"
                    >
                      {c}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex min-h-24 flex-col gap-2.5">
                <h3 className="text-[28px] font-medium tracking-[-0.036em] text-[#F5F5F5]">
                  {r.name}
                </h3>
                <p className="text-sm leading-[1.6] text-[#8C8C8C]">{r.text}</p>
              </div>
              <ul className={`${TILE} flex flex-col gap-3 rounded-[20px] p-4`}>
                {r.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 text-[13px] text-[#E0E0E0]"
                  >
                    <CircleCheckIcon className="size-4 shrink-0 text-[#6AA5FF]" />
                    {p}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
