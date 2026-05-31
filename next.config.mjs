/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimisticClientCache: true,
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
