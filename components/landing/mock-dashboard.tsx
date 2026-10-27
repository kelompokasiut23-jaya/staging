import { CheckCircle2Icon, ClockIcon } from "lucide-react"

import { Bar, Counter } from "./motion-kit"

const SIZES = [
  { size: "S", target: 250, passed: 238, defect: 8 },
  { size: "M", target: 400, passed: 371, defect: 14 },
  { size: "L", target: 250, passed: 172, defect: 5 },
  { size: "XL", target: 100, passed: 31, defect: 2 },
]

/** Tampilan contoh halaman QC untuk hiasan landing page. Datanya contoh, bukan data asli. */
export function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220] shadow-2xl shadow-[#3d8bff]/10">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 truncate text-xs text-slate-500">
          Tugas Saya · Line 1
        </span>
      </div>

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Brand</p>
              <h3 className="text-lg font-semibold text-white">
                Kaos Polo · Navy
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3d8bff]/15 px-3 py-1 text-xs font-medium text-[#7db1ff]">
              <ClockIcon className="size-3.5" /> Sedang diperiksa
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {SIZES.map((s, i) => {
              const percent = Math.round(
                ((s.passed + s.defect) / s.target) * 100
              )
              return (
                <div key={s.size}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      Size {s.size}
                    </span>
                    <span className="text-slate-500">
                      {s.passed + s.defect} dari {s.target}
                    </span>
                  </div>
                  <Bar percent={percent} delay={0.25 + i * 0.12} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <Stat label="Lolos QC" tone="text-emerald-400">
            <Counter to={812} />
          </Stat>
          <Stat label="Defect" tone="text-rose-400">
            <Counter to={29} />
          </Stat>
          <div className="col-span-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400 lg:col-span-1">
            <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
            Hasil langsung terlihat oleh admin
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  tone,
  children,
}: {
  label: string
  tone: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tabular-nums ${tone}`}>
        {children}
      </p>
    </div>
  )
}
