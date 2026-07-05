/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages that ship old-style React.createElement (legacy JSX transform)
  // react-big-calendar depends on `uncontrollable` which triggers the warning.
  transpilePackages: ['react-big-calendar', 'uncontrollable'],

  // Skip ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize barrel imports for common libraries — reduces per-click JS evaluation
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
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
