"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowUpRightIcon, PlayIcon, RadioIcon } from "lucide-react"

import { MockDashboard } from "./mock-dashboard"
import { EASE } from "./motion-kit"

function Words({
  text,
  start,
  className,
}: {
  text: string
  start: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span className={`block ${className ?? ""}`}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-1.5 align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: start + i * 0.07, ease: EASE }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const reduce = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stage,
    offset: ["start 95%", "start 35%"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 12, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.95, 1])

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-24 left-1/2 h-[480px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-[#1d4ed8]/25 blur-[130px]"
        animate={
          reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.07, 1] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            {...fade(0)}
            className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/90"
          >
            <RadioIcon className="size-3 text-[#3b82f6]" /> Pemantauan QC
            real-time
          </motion.p>

          <h1 className="mt-7 text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            <Words text="Pantau. Periksa. Putuskan." start={0.1} />
            <Words
              text="QC Lini Produksi, Tanpa Menebak."
              start={0.35}
              className="text-white/55"
            />
          </h1>

          <motion.p
            {...fade(0.8)}
            className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/60 sm:text-[15px]"
          >
            Admin menugaskan barang, QC mengisi hasil lolos dan defect per
            ukuran, dan dashboard langsung ikut berubah. Tidak ada lagi rekap
            manual lewat chat.
          </motion.p>

          <motion.div
            {...fade(0.95)}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/masuk/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#3b82f6] px-6 text-sm font-medium text-white transition-colors hover:bg-[#5b9bff] sm:w-auto"
            >
              Masuk ke Dashboard <ArrowUpRightIcon className="size-4" />
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Lihat cara kerja <PlayIcon className="size-3.5" />
            </a>
          </motion.div>
        </div>

        <div ref={stage} className="mt-14 [perspective:1600px] sm:mt-20">
          <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }}>
            <MockDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
