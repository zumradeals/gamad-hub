import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
    NEXT_PUBLIC_CORE_URL: process.env.NEXT_PUBLIC_CORE_URL ?? 'http://localhost:3000',
  },
};

export default nextConfig;
