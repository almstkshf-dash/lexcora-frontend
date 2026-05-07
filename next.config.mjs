/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  // experimental: {},

  // Skip ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Add font optimization
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
  },

  // Configure favicon and enable source maps for debugging
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
