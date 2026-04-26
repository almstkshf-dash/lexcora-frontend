/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for i18n
  experimental: {
    // Enable server components
  },

  // Skip ESLint during production builds — warnings are addressed incrementally
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add font optimization
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
  },

};

export default nextConfig;
