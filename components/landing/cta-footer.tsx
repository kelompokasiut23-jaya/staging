import Link from "next/link"
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react"

import { Reveal } from "./motion-kit"

export function Cta() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#3d8bff]/25 via-[#0c1220] to-[#0c1220] px-6 py-14 text-center sm:py-20">
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Siap memantau QC dengan lebih rapi?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-slate-300">
          Masuk dengan akun dari super admin dan mulai dari halaman yang sesuai
          peran Anda.
        </p>
        <Link
          href="/masuk/"
          className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3d8bff] px-7 font-medium text-white transition-colors hover:bg-[#5a9dff]"
        >
          Masuk ke platform
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
        <span className="flex items-center gap-2 text-slate-300">
          <ShieldCheckIcon className="size-4 text-[#3d8bff]" /> Monitoring QC
        </span>
        <span>Platform pemantauan QC garmen · Proyek belajar</span>
        <Link href="/masuk/" className="hover:text-white">
          Masuk
        </Link>
      </div>
    </footer>
  )
}
