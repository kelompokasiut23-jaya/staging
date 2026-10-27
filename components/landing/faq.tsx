"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { PlusIcon } from "lucide-react"

import { EASE, Reveal } from "./motion-kit"

const ITEMS = [
  {
    q: "Siapa yang bisa membuat akun?",
    a: "Hanya super admin. Super admin membuat username dan password, lalu memberikannya kepada admin atau QC yang bersangkutan.",
  },
  {
    q: "Apakah QC bisa melihat tugas QC lain?",
    a: "Tidak. QC hanya melihat tugas yang ditugaskan kepadanya, dan hanya bisa mengubah hasil pemeriksaan miliknya.",
  },
  {
    q: "Apakah data langsung berubah di layar admin?",
    a: "Ya. Setiap kali QC menyimpan hasil, layar admin diperbarui otomatis. Jika koneksi sempat terputus, data tetap dimuat ulang berkala.",
  },
  {
    q: "Apa yang terjadi kalau jumlah lolos dan defect belum lengkap?",
    a: "Tugas baru bisa ditandai selesai ketika jumlah lolos ditambah defect sudah sama dengan target di setiap size.",
  },
  {
    q: "Bisakah dipakai dari ponsel?",
    a: "Bisa. Semua halaman menyesuaikan ukuran layar, sehingga nyaman dipakai QC langsung di lantai produksi.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="border-t border-white/10 px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p
          id="tanya-jawab"
          className="scroll-mt-24 text-sm font-medium text-[#7db1ff]"
        >
          Tanya jawab
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Pertanyaan yang sering muncul
        </h2>
      </Reveal>
      <Reveal className="mx-auto mt-12 max-w-2xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
        {ITEMS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-white"
              >
                {item.q}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <PlusIcon className="size-4 shrink-0 text-slate-400" />
                </motion.span>
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
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </Reveal>
    </section>
  )
}
