// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require("next-transpile-modules")([
  "@walletconnect/legacy-client",
  "@walletconnect/legacy-provider",
  "ws",
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR),
  },
  eslint: {
    ignoreDuringBuilds: Boolean(process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR),
  },
  swcMinify: true, // Untuk optimasi build
  output: "standalone", // Mempermudah deploy di Vercel / Docker
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Mencegah Webpack mencoba menggunakan modul "fs" di client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = withTM(nextConfig);
