/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for GitHub Pages compatibility
  output: process.env.NODE_ENV === 'production' && process.env.EXPORT_MODE ? 'export' : undefined,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' && process.env.EXPORT_MODE ? '/Fitness_Health_Monitoring_AI' : '',
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.EXPORT_MODE ? '/Fitness_Health_Monitoring_AI/' : '',
}

export default nextConfig
