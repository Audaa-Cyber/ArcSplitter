import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimisticClientCache: true,
  },
  images: {
    remotePatterns: [],
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
