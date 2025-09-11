/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Static export disabled temporarily for client components
  // output: 'export',
  // trailingSlash: true,
}

module.exports = nextConfig