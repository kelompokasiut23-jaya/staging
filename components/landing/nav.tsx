"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { MenuIcon, ShieldCheckIcon, XIcon } from "lucide-react"

import { EASE } from "./motion-kit"

const LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#peran", label: "Peran" },
  { href: "#faq", label: "FAQ" },
]

export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  const lg = size === "lg"
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center bg-[#4690FF] text-[#0A0A0A] ${
          lg ? "size-8 rounded-[10px]" : "size-7 rounded-[9px]"
        }`}
      >
        <ShieldCheckIcon className={lg ? "size-[18px]" : "size-[15px]"} />
      </span>
      <span
        className={`font-semibold text-[#F5F5F5] ${
          lg ? "text-lg tracking-[-0.022em]" : "text-[15px]"
        }`}
      >
        Monitoring QC
      </span>
    </span>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-white/10 bg-[#050505]/80 backdrop-blur-xl"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-10 lg:h-[88px] lg:px-20">
        <Link href="/" aria-label="Monitoring QC">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#CFCFCF] transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/masuk/"
            className="inline-flex items-center rounded-full border border-[#FFFFFF22] bg-[linear-gradient(135deg,#242424,#0E0E0E)] px-[22px] py-2.5 text-sm font-semibold text-[#F5F5F5] transition-colors hover:border-white/30"
          >
            Masuk
          </Link>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
          >
            {open ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col px-5 pb-4">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-[#CFCFCF] hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
