/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    turbopack: {
      root: '.',
    },
  },

  // Skip ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add font optimization
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
  },
};

export default nextConfig;
