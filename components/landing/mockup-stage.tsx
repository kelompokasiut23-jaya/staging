"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"

const W = 1380
const H = 720

const TILT = 18
const SHRINK = 0.93

export function MockupStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 1, left: 0 })
  const [dist, setDist] = useState(400)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const scale = Math.min(1, w / W)
      setSize({ scale, left: Math.max(0, (w - W * scale) / 2) })
      const top = el.getBoundingClientRect().top + window.scrollY
      const need = top + H * scale - window.innerHeight + 24
      setDist(Math.min(800, Math.max(240, need)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { scrollY } = useScroll()
  const raw = useTransform(scrollY, (y) => Math.min(1, Math.max(0, y / dist)))
  const progress = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 })
  const rotateX = useTransform(progress, [0, 1], [reduce ? 0 : TILT, 0])
  const lift = useTransform(progress, [0, 1], [reduce ? 1 : SHRINK, 1])

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
