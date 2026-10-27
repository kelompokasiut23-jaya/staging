import {
  BellRingIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  EyeIcon,
  GaugeIcon,
  LockKeyholeIcon,
  RulerIcon,
  UsersIcon,
} from "lucide-react"

import { Bar, Counter, Reveal, Stagger, StaggerItem } from "./motion-kit"

function SectionHead({
  id,
  eyebrow,
  title,
  text,
}: {
  id?: string
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p id={id} className="scroll-mt-24 text-sm font-medium text-[#7db1ff]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-slate-400">{text}</p>
    </Reveal>
  )
}

const card =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#3d8bff]/40 hover:bg-white/[0.05]"

export function Stats() {
  const items = [
    { to: 3, label: "peran dengan akses berbeda" },
    { to: 100, label: "hasil tercatat terpisah per size", suffix: "%" },
    {
      to: 10,
      label: "jeda paling lama sampai data diperbarui",
      suffix: " dtk",
    },
  ]
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <Stagger className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-center sm:grid-cols-3 sm:px-6">
        {items.map((s) => (
          <StaggerItem key={s.label}>
            <p className="text-4xl font-semibold text-white tabular-nums">
              <Counter to={s.to} />
              {s.suffix}
            </p>
            <p className="mt-2 text-sm text-slate-400">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export function Features() {
  const items = [
    {
      icon: RulerIcon,
      title: "Hasil per size",
      text: "Lolos dan defect dicatat terpisah untuk setiap size, jadi tidak ada angka yang bercampur.",
    },
    {
      icon: GaugeIcon,
      title: "Progres terlihat jelas",
      text: "Setiap barang punya batang progres dan sisa waktu sampai batas jam QC selesai.",
    },
    {
      icon: BellRingIcon,
      title: "Data masuk langsung",
      text: "Barang baru dari admin muncul di layar QC tanpa perlu memuat ulang halaman.",
    },
    {
      icon: LockKeyholeIcon,
      title: "Akses sesuai peran",
      text: "Setiap orang hanya melihat menu dan data yang memang menjadi bagiannya.",
    },
  ]
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="fitur"
        eyebrow="Fitur"
        title="Semua yang dibutuhkan tim QC"
        text="Sederhana dipakai di lantai produksi, lengkap untuk dipantau dari kantor."
      />
      <Stagger className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <StaggerItem key={f.title} className={card}>
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#3d8bff]/15 text-[#7db1ff]">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-5 font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {f.text}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mx-auto mt-4 max-w-6xl">
        <div className={`${card} grid items-center gap-8 md:grid-cols-2`}>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Batas waktu tidak terlewat
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Barang yang hampir melewati batas jam ditandai, sehingga QC dan
              admin tahu mana yang perlu didahulukan.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { name: "Kaos Polo · Navy", p: 82 },
              { name: "Kemeja Flanel · Merah", p: 56 },
              { name: "Celana Chino · Krem", p: 24 },
            ].map((r, i) => (
              <div key={r.name}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-200">{r.name}</span>
                  <span className="text-slate-500">{r.p}%</span>
                </div>
                <Bar percent={r.p} delay={0.2 + i * 0.15} />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function Steps() {
  const steps = [
    {
      icon: ClipboardListIcon,
      title: "Admin mencatat barang",
      text: "Isi brand, item, warna, size, jumlah, batas jam, dan pilih QC yang bertugas.",
    },
    {
      icon: ClipboardCheckIcon,
      title: "QC memeriksa dan mengisi",
      text: "QC membuka tugasnya, lalu mengisi jumlah lolos dan defect untuk tiap size.",
    },
    {
      icon: EyeIcon,
      title: "Admin memantau hasil",
      text: "Laporan terbarui otomatis. Saat QC menandai selesai, status berubah untuk semua orang.",
    },
  ]
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="cara-kerja"
        eyebrow="Cara kerja"
        title="Tiga langkah dari barang masuk sampai laporan"
        text="Alurnya mengikuti cara kerja tim QC sehari-hari."
      />
      <Stagger className="relative mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <StaggerItem key={s.title} className={card}>
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[#3d8bff] text-white">
                <s.icon className="size-5" />
              </span>
              <span className="text-4xl font-semibold text-white/10">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-5 font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {s.text}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export function Roles() {
  const roles = [
    {
      name: "Super Admin",
      text: "Mengatur akun pengguna dan memegang seluruh data barang.",
      points: [
        "Membuat akun admin dan QC",
        "Mengganti password dan menonaktifkan akun",
        "Melihat semua barang",
      ],
    },
    {
      name: "Admin",
      text: "Penanggung jawab yang memantau pekerjaan QC.",
      points: [
        "Mencatat barang dan menugaskan QC",
        "Memantau progres dan hasil",
        "Tidak bisa membuat akun lain",
      ],
    },
    {
      name: "QC",
      text: "Pemeriksa barang di lini produksi.",
      points: [
        "Hanya melihat tugasnya sendiri",
        "Mengisi lolos dan defect per size",
        "Menandai tugas selesai",
      ],
    },
  ]
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead
        id="peran"
        eyebrow="Peran"
        title="Tiga peran, tiga tampilan"
        text="Login menentukan halaman yang terbuka, jadi tidak ada menu yang membingungkan."
      />
      <Stagger className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <StaggerItem key={r.name} className={card}>
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#3d8bff]/15 text-[#7db1ff]">
              <UsersIcon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{r.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{r.text}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {r.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#3d8bff]" />
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
