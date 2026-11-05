/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    cpus: 1
  },
  async redirects() {
    return [
      {
        source: '/collections',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/collection',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
