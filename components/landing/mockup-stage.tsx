"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

const W = 1380
const H = 720 // 40px bagian bawah jendela terpotong, seperti di desain

/** Memperkecil jendela 1380px agar muat di layar, dan memiringkannya saat digulir. */
export function MockupStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 1, left: 0 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const scale = Math.min(1, w / W)
      setSize({ scale, left: Math.max(0, (w - W * scale) / 2) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: box,
    offset: ["start 95%", "start 35%"],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 12, 0])
  const lift = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.95, 1])

  return (
    <div className="[perspective:1600px]">
      <div
        ref={box}
        className="relative w-full overflow-hidden"
        style={{ height: H * size.scale }}
      >
        <motion.div
          style={{
            rotateX,
            scale: lift,
            transformOrigin: "50% 0%",
            position: "absolute",
            top: 0,
            left: size.left,
            width: W * size.scale,
            height: H * size.scale,
          }}
        >
          <div
            style={{
              width: W,
              height: H,
              transform: `scale(${size.scale})`,
              transformOrigin: "0 0",
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
