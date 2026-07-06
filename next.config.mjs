/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'ais-dev-4px4mwjktqru3ns3gi2sgh-361291877326.asia-southeast1.run.app',
    'ais-pre-4px4mwjktqru3ns3gi2sgh-361291877326.asia-southeast1.run.app',
  ],
};

export default nextConfig;
