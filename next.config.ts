import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // 🚀 Permite cualquier subdominio de Supabase
        port: '',
        pathname: '/storage/v1/object/public/**', // Ruta pública de tus buckets
      },
    ],
  },
};

export default nextConfig;
