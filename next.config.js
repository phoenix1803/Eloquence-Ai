/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['img.clerk.com'],
        formats: ['image/webp', 'image/avif'],
    },
    output: 'standalone',
    // Optimize for production
    swcMinify: true,
    // Enable compression
    compress: true,
}

module.exports = nextConfig