"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { EASE, Reveal } from "./motion-kit"
import { CARD, Glow, PAD_X, Pill, Stage } from "./ui"

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
    <section className={`relative ${PAD_X} pt-6 pb-[120px]`}>
      <Stage>
        <Glow x={-240} y={20} w={820} h={520} color="#0B182A" />
        <Glow x={820} y={40} w={760} h={480} color="#09121F" />
      </Stage>

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 lg:flex-row lg:gap-16">
        <Reveal className="flex flex-col items-start gap-5 lg:w-[420px] lg:shrink-0">
          <div id="faq" className="scroll-mt-24">
            <Pill>FAQ</Pill>
          </div>
          <h2 className="text-[32px] leading-[1.08] font-medium tracking-[-0.041em] text-[#F5F5F5] sm:text-[40px] lg:text-[46px]">
            Pertanyaan Yang Sering Muncul.
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#8C8C8C]">
            Tidak menemukan jawabannya? Hubungi super admin di tempat Anda.
          </p>
        </Reveal>

        <Reveal className="flex flex-1 flex-col gap-3.5" delay={0.1}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className={`${CARD} !rounded-[28px] px-5 py-[22px] transition-colors sm:px-[26px] ${
                  isOpen ? "!border-[#4690FF55]" : ""
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-base font-medium tracking-[-0.022em] text-[#F5F5F5] sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? "bg-[#4690FF] text-[#0A0A0A]"
                        : "bg-[#FFFFFF14] text-white"
                    }`}
                  >
                    {isOpen ? (
                      <MinusIcon className="size-4" />
                    ) : (
                      <PlusIcon className="size-4" />
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
                      <p className="pt-3 text-[15px] leading-[1.6] text-[#8C8C8C]">
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
