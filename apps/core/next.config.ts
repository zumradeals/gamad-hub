import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
    NEXT_PUBLIC_PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://gamad.net',
  },
};

export default nextConfig;
