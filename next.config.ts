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
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/evento/orgullo-maestro",
  //       permanent: false,
  //     },
  //   ];
  // },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/evento/orgullo-maestro',
      },
    ];
  },
};

export default nextConfig;
