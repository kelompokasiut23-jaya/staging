"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowRightIcon } from "lucide-react"

import { MockDashboard } from "./mock-dashboard"
import { EASE } from "./motion-kit"

const HEADING = "Pantau hasil QC garmen, langsung dari lini produksi".split(" ")

export function Hero() {
  const reduce = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stage,
    offset: ["start 90%", "start 30%"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 14, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.94, 1])

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-[#3d8bff]/20 blur-[120px]"
        animate={
          reduce ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
          >
            Untuk tim QC dan admin pabrik garmen
          </motion.p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {HEADING.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden pb-1 align-bottom"
              >
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 + i * 0.07,
                    ease: EASE,
                  }}
                >
                  {word}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg"
          >
            QC cukup mengisi berapa yang lolos dan berapa yang defect untuk
            setiap size. Admin langsung melihat hasilnya, tanpa menunggu laporan
            di akhir hari.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/masuk/"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3d8bff] px-6 font-medium text-white transition-colors hover:bg-[#5a9dff] sm:w-auto"
            >
              Masuk ke platform
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/15 px-6 font-medium text-white transition-colors hover:bg-white/5 sm:w-auto"
            >
              Lihat cara kerjanya
            </a>
          </motion.div>
        </div>

        <div ref={stage} className="mt-14 [perspective:1400px] sm:mt-20">
          <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }}>
            <MockDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
