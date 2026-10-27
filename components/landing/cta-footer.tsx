import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Reveal } from "./motion-kit"
import { Logo } from "./nav"
import { CARD, Pill } from "./ui"

const LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#peran", label: "Peran" },
  { href: "#faq", label: "FAQ" },
]

export function CtaFooter() {
  return (
    <section className="px-3 pb-3 sm:px-10 sm:pb-10">
      <Reveal>
        <div
          className={`${CARD} relative mx-auto flex max-w-[1360px] flex-col items-center gap-[72px] overflow-hidden !rounded-[32px] px-6 pt-20 sm:!rounded-[48px] sm:px-16 sm:pt-[104px]`}
        >
          <div className="absolute top-0 left-1/2 h-0.5 w-[600px] max-w-full -translate-x-1/2 bg-[linear-gradient(90deg,#4690FF00,#6AA5FF,#4690FF00)]" />

          <div className="flex flex-col items-center gap-[26px] text-center">
            <Pill>Mulai sekarang</Pill>
            <h2 className="text-[40px] leading-[1.04] font-medium tracking-[-0.044em] text-[#F5F5F5] sm:text-[56px] lg:text-[72px]">
              Siap Melihat Kondisi
              <span className="block text-[#B5B5B5]">QC Anda Hari Ini?</span>
            </h2>
            <p className="max-w-[520px] text-[15px] leading-[1.6] text-[#8C8C8C] sm:text-base">
              Masuk dengan username dan password dari super admin, lalu lihat
              progres setiap lini dalam satu layar.
            </p>
            <Link
              href="/masuk/"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#4690FF] py-3.5 pr-5 pl-[26px] text-[15px] font-semibold text-[#0A0A0A] transition-colors hover:bg-[#6AA5FF]"
            >
              Masuk ke Dashboard <ArrowUpRightIcon className="size-4" />
            </Link>
            <p className="text-[13px] text-[#6E6E6E]">
              Belum punya akun? Hubungi super admin.
            </p>
          </div>

          <footer className="w-full">
            <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 py-7 sm:flex-row">
              <Logo size="sm" />
              <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[13px] text-[#CFCFCF]">
                {LINKS.map((l) => (
                  <a key={l.href} href={l.href} className="hover:text-white">
                    {l.label}
                  </a>
                ))}
                <Link href="/masuk/" className="hover:text-white">
                  Masuk
                </Link>
              </nav>
              <span className="text-[13px] text-[#6E6E6E]">
                © 2026 Monitoring QC
              </span>
            </div>
            <div
              aria-hidden
              className="h-[0.74em] overflow-hidden text-[clamp(56px,16vw,230px)]"
            >
              <p className="text-center leading-none font-medium tracking-[-0.04em] whitespace-nowrap text-[#161616] select-none">
                Monitoring QC
              </p>
            </div>
          </footer>
        </div>
      </Reveal>
    </section>
  )
}
