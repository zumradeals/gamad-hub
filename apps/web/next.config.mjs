/**
 * Si une requête /api/* arrive sur Next (mauvais routage Nginx ou accès direct au port 3000),
 * on la renvoie vers l’API Nest. INTERNAL_API_URL doit être défini au build Docker (voir Dockerfile.web).
 */
const internalBase = (process.env.INTERNAL_API_URL || "http://127.0.0.1:4000/api").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${internalBase}/:path*` }];
  }
};

export default nextConfig;
