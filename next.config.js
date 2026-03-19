/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.3tabz.app/v1'}/:path*`,
      },
    ]
  },
}
module.exports = nextConfig
