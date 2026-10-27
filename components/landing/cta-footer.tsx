import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Logo } from "./nav"
import { Reveal } from "./motion-kit"
import { Pill } from "./sections"

const LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#peran", label: "Peran" },
  { href: "#faq", label: "FAQ" },
]

export function CtaFooter() {
  return (
    <section className="px-3 pb-3 sm:px-5 sm:pb-5">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.1] via-white/[0.03] to-black sm:rounded-[36px]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent" />

          <div className="px-6 pt-16 text-center sm:pt-24">
            <Pill>Mulai sekarang</Pill>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-white sm:text-6xl">
              Siap Melihat Kondisi
              <span className="block text-white/55">QC Anda Hari Ini?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed text-white/55 sm:text-sm">
              Masuk dengan username dan password dari super admin, lalu lihat
              progres setiap lini dalam satu layar.
            </p>
            <Link
              href="/masuk/"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 text-sm font-medium text-white transition-colors hover:bg-[#5b9bff]"
            >
              Masuk ke Dashboard <ArrowUpRightIcon className="size-4" />
            </Link>
            <p className="mt-5 text-[11px] text-white/40">
              Belum punya akun? Hubungi super admin.
            </p>
          </div>

          <footer className="mx-5 mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] text-white/50 sm:mx-10 sm:flex-row">
            <Logo />
            <nav className="flex items-center gap-5">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-white">
                  {l.label}
                </a>
              ))}
              <Link href="/masuk/" className="hover:text-white">
                Masuk
              </Link>
            </nav>
            <span>© 2026 Monitoring QC</span>
          </footer>

          <p
            aria-hidden
            className="pointer-events-none mt-6 h-[0.62em] overflow-hidden text-center text-[22vw] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap text-white/[0.06] select-none sm:text-[17vw] lg:text-[200px]"
          >
            Monitoring QC
          </p>
        </div>
      </Reveal>
    </section>
  )
}
