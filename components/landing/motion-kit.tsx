"use client"

import { useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

export const EASE = [0.22, 1, 0.36, 1] as const

/** Muncul dengan naik dan memudar saat masuk layar. Dimatikan bila pengguna memilih tanpa animasi. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Anak-anaknya muncul bergantian. */
export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: React.ReactNode
  className?: string
  gap?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: gap }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 32,
}: {
  children: React.ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
      }}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  )
}

/** Angka yang berhitung naik saat terlihat. */
export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduce = useReducedMotion()
  const value = useMotionValue(reduce ? to : 0)
  const text = useTransform(value, (v) => Math.round(v).toLocaleString("id-ID"))

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(value, to, { duration: 1.6, ease: "easeOut" })
    return () => controls.stop()
  }, [inView, reduce, to, value])

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  )
}

/** Batang progres yang terisi saat terlihat. */
export function Bar({
  percent,
  className = "",
  barClassName = "bg-[#3d8bff]",
  delay = 0.2,
}: {
  percent: number
  className?: string
  barClassName?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}
    >
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, delay, ease: EASE }}
      />
    </div>
  )
}
