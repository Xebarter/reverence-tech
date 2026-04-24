/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // During migration we keep existing ESLint config; don't block builds on legacy files.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Keep behavior predictable during migration.
    optimizePackageImports: [],
  },
};

export default nextConfig;

