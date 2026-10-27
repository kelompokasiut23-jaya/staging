"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { EASE, Reveal } from "./motion-kit"
import { Pill } from "./sections"

const ITEMS = [
  {
    q: "Siapa yang bisa membuat akun?",
    a: "Hanya super admin. Tidak ada pendaftaran mandiri. Admin line dan QC masuk dengan username dan password dari super admin.",
  },
  {
    q: "Bagaimana jika lupa password?",
    a: "Hubungi super admin. Super admin bisa membuat password baru untuk akun Anda kapan saja.",
  },
  {
    q: "Barang yang salah input bisa dihapus?",
    a: "Bisa, selama QC belum mulai memeriksa barang tersebut. Setelah ada hasil yang tersimpan, barang tidak bisa dihapus lagi agar riwayatnya tetap utuh.",
  },
  {
    q: "Kapan angka di dashboard berubah?",
    a: "Setiap kali QC menyimpan hasil. Angka di dashboard ikut berubah tanpa perlu memuat ulang halaman.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.7fr]">
        <Reveal>
          <div id="faq" className="scroll-mt-24">
            <Pill>FAQ</Pill>
          </div>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">
            Pertanyaan Yang Sering Muncul.
          </h2>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/50">
            Tidak menemukan jawabannya? Hubungi super admin di tempat Anda.
          </p>
        </Reveal>

        <Reveal className="space-y-2.5" delay={0.1}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className={`rounded-2xl border bg-gradient-to-b from-white/[0.07] to-white/[0.02] transition-colors ${
                  isOpen ? "border-[#3b82f6]/40" : "border-white/10"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm text-white"
                >
                  {item.q}
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? "bg-[#3b82f6] text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {isOpen ? (
                      <MinusIcon className="size-3" />
                    ) : (
                      <PlusIcon className="size-3" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-xs leading-relaxed text-white/55">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
