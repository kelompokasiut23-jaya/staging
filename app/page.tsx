import type { Metadata } from "next"

import { CtaFooter } from "@/components/landing/cta-footer"
import { Faq } from "@/components/landing/faq"
import { Hero } from "@/components/landing/hero"
import { Nav } from "@/components/landing/nav"
import { Features, Roles, Steps } from "@/components/landing/sections"

export const metadata: Metadata = {
  title: "Monitoring QC — pantau, periksa, putuskan",
  description:
    "Admin menugaskan barang, QC mengisi hasil lolos dan defect per ukuran, dan dashboard langsung ikut berubah.",
}

export default function LandingPage() {
  return (
    <div className="dark min-h-svh overflow-x-clip bg-[#050505] text-[#F5F5F5]">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Roles />
        <Faq />
        <CtaFooter />
      </main>
    </div>
  )
}
