/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Netlify's Next.js runtime handles SSR/ISR; no "export" output needed.
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
