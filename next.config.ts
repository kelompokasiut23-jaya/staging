import type { NextConfig } from "next"

// Saat dipublikasikan ke GitHub Pages, situs berada di subpath repositori
// (contoh: /staging). Nilainya diisi lewat variabel lingkungan saat build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
