/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone server mode for persistent Node.js deployment on Hostinger VPS
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
