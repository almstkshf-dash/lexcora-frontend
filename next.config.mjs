/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages that ship old-style React.createElement (legacy JSX transform)
  // react-big-calendar depends on `uncontrollable` which triggers the warning.
  transpilePackages: ['react-big-calendar', 'uncontrollable'],

  // Skip ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable browser source maps in production — reduces bundle size and avoids
  // leaking source to end-users on Vercel.
  productionBrowserSourceMaps: false,

  // Optimize barrel imports for common libraries — reduces per-click JS evaluation
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Replace legacy `domains` array with the modern `remotePatterns` API.
  // fonts.gstatic.com / fonts.googleapis.com are only needed for <Image> src usage;
  // the actual Google Fonts stylesheet is injected via next/font so no remote
  // image optimisation is required — keep the list intentionally minimal.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
    ],
  },

  // Webpack: source maps in dev only; no changes needed for production.
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
