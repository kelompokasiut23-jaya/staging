import { Reveal, WordReveal } from "./motion-kit"
import { afterWords } from "./timing"

export const BG = "#050505"
export const CARD =
  "rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom_left,#303030_0%,#0C0C0C_65%,#070707_100%)]"
export const TILE =
  "border border-[#FFFFFF12] bg-[linear-gradient(to_bottom_left,#242424,#0E0E0E)]"
export const PAD_X = "px-5 sm:px-10 lg:px-20"
export const TITLE =
  "text-[32px] leading-[1.08] font-medium tracking-[-0.042em] text-[#F5F5F5] sm:text-[44px] lg:text-[52px]"

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full border border-[#FFFFFF1F] bg-[linear-gradient(to_bottom_left,#242424,#0E0E0E)] px-4 py-[7px] text-xs font-medium text-[#D8D8D8]`}
    >
      {children}
    </span>
  )
}

export function SectionHead({
  id,
  badge,
  title,
  text,
}: {
  id?: string
  badge: string
  title: string
  text: string
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Reveal y={12}>
        <div id={id} className="scroll-mt-24">
          <Pill>{badge}</Pill>
        </div>
      </Reveal>
      <h2 className={`max-w-[820px] ${TITLE}`}>
        <WordReveal text={title} delay={0.1} />
      </h2>
      <Reveal delay={afterWords(title)} y={16}>
        <p className="max-w-[520px] text-[15px] leading-[1.6] text-[#8C8C8C] sm:text-base">
          {text}
        </p>
      </Reveal>
    </div>
  )
}

export function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 h-full w-[1440px] -translate-x-1/2">
        {children}
      </div>
    </div>
  )
}

export function Glow({
  x,
  y,
  w,
  h,
  color,
}: {
  x: number
  y: number
  w: number
  h: number
  color: string
}) {
  return (
    <div
      className="absolute rounded-[50%]"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        background: `radial-gradient(closest-side, ${color} 0%, ${BG} 100%)`,
      }}
    />
  )
}

export function Beam({
  x,
  y,
  w,
  rotate,
  mid,
}: {
  x: number
  y: number
  w: number
  rotate: number
  mid: string
}) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: 900,
        transform: `rotate(${rotate}deg)`,
        background: `linear-gradient(to bottom, ${BG} 0%, ${mid} 35%, #080808 70%, ${BG} 100%)`,
      }}
    />
  )
}

export function Beams({ side }: { side: "right" | "left" }) {
  const set =
    side === "right"
      ? {
          rotate: 28,
          items: [
            [1260, 90, 520, "#0F0F0F"],
            [1322, 123, 380, "#131313"],
            [1384, 156, 240, "#171717"],
          ] as const,
        }
      : {
          rotate: -28,
          items: [
            [150, 70, 520, "#0F0F0F"],
            [212, 37, 380, "#131313"],
            [274, 4, 240, "#171717"],
          ] as const,
        }
  return (
    <>
      {set.items.map(([x, y, w, mid]) => (
        <Beam key={x} x={x} y={y} w={w} rotate={set.rotate} mid={mid} />
      ))}
    </>
  )
}

export function HeroBeams() {
  const layers = [
    [0, 640, "#1E1E1E"],
    [60, 520, "#282828"],
    [120, 400, "#333333"],
    [180, 280, "#404040"],
    [240, 160, "#4E4E4E"],
  ] as const
  return (
    <div className="absolute" style={{ left: 400, top: -494, opacity: 0.25 }}>
      {layers.map(([x, w, top]) => (
        <div
          key={x}
          className="absolute"
          style={{
            left: x,
            top: 0,
            width: w,
            height: 1700,
            background: `linear-gradient(to bottom, ${top} 0%, #141414 50%, ${BG} 85%)`,
          }}
        />
      ))}
    </div>
  )
}
