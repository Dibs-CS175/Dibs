/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Photo uploads go through a Server Action (lib/live/actions/photos.ts). The default limit is 1 MB;
    // photos are capped at 5 MB in lib/photos.ts, plus room for the form encoding.
    serverActions: { bodySizeLimit: '6mb' },
  },
};

export default nextConfig;
