import type { Metadata } from "next"

import { Cta, Footer } from "@/components/landing/cta-footer"
import { Faq } from "@/components/landing/faq"
import { Hero } from "@/components/landing/hero"
import { Nav } from "@/components/landing/nav"
import { Features, Roles, Stats, Steps } from "@/components/landing/sections"

export const metadata: Metadata = {
  title: "Monitoring QC — pantau hasil QC garmen",
  description:
    "Catat barang, tugaskan QC, dan pantau hasil lolos dan defect per size secara langsung.",
}

export default function LandingPage() {
  return (
    <div className="dark min-h-svh bg-[#070b14] text-slate-200 antialiased">
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Steps />
        <Roles />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
