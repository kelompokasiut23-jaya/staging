"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRightIcon, PlayIcon, RadioIcon } from "lucide-react"

import { MockDashboard } from "./mock-dashboard"
import { EASE } from "./motion-kit"
import { MockupStage } from "./mockup-stage"
import { BG, Glow, HeroBeams, Stage } from "./ui"

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
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <section className="relative overflow-hidden bg-[#050505] pt-[72px] lg:pt-[88px]">
      <Stage>
        <Glow x={900} y={420} w={700} h={520} color="#0C1C38" />
        <Glow x={-240} y={520} w={760} h={560} color="#0C1C38" />
        <motion.div
          className="absolute"
          animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: 0, top: 0, width: 1440, height: 1340 }}
        >
          <Glow x={300} y={60} w={860} h={560} color="#10264A" />
        </motion.div>
        <HeroBeams />
      </Stage>

      <div className="relative flex flex-col items-center gap-[26px] px-5 pt-12 text-center sm:px-10 lg:pt-[72px]">
        <motion.p
          {...fade(0)}
          className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF1F] bg-[linear-gradient(135deg,#242424,#0E0E0E)] px-3.5 py-[7px] text-xs font-medium text-[#D8D8D8]"
        >
          <RadioIcon className="size-3.5 text-[#4690FF]" /> Pemantauan QC
          real-time
        </motion.p>

        <h1 className="text-[40px] leading-[1.05] font-medium tracking-[-0.044em] text-[#F5F5F5] sm:text-[56px] lg:text-[68px]">
          <Words text="Pantau. Periksa. Putuskan." start={0.1} />
          <Words
            text="QC Lini Produksi, Tanpa Menebak."
            start={0.35}
            className="text-[#B5B5B5]"
          />
        </h1>

        <motion.p
          {...fade(0.8)}
          className="max-w-[640px] text-[15px] leading-[1.6] text-[#8C8C8C] sm:text-base"
        >
          Admin menugaskan barang, QC mengisi hasil lolos dan defect per ukuran,
          dan dashboard langsung ikut berubah. Tidak ada lagi rekap manual lewat
          chat.
        </motion.p>

        <motion.div
          {...fade(0.95)}
          className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/masuk/"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#4690FF] py-3.5 pr-5 pl-6 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#6AA5FF] sm:w-auto"
          >
            Masuk ke Dashboard <ArrowUpRightIcon className="size-4" />
          </Link>
          <a
            href="#cara-kerja"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#FFFFFF1F] bg-[linear-gradient(135deg,#242424,#0E0E0E)] px-[22px] py-3.5 text-sm font-semibold text-[#F5F5F5] transition-colors hover:border-white/30 sm:w-auto"
          >
            Lihat cara kerja <PlayIcon className="size-3.5 fill-current" />
          </a>
        </motion.div>
      </div>

      <div className="relative mt-12 px-4 sm:px-5 lg:mt-8 lg:px-[30px]">
        <MockupStage>
          <MockDashboard />
        </MockupStage>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[236px]"
        style={{ background: `linear-gradient(to bottom, ${BG}00, ${BG})` }}
      />
    </section>
  )
}
