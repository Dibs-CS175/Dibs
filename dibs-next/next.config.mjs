/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repo root has its own package-lock.json (for the Supabase CLI). Pinning the root here
  // stops Next from guessing between the two lockfiles and warning on every build.
  turbopack: { root: import.meta.dirname },
  experimental: {
    // Photo uploads go through a Server Action (lib/live/actions/photos.ts). The default limit is 1 MB;
    // photos are capped at 5 MB in lib/photos.ts, plus room for the form encoding.
    serverActions: { bodySizeLimit: '6mb' },
  },
};

export default nextConfig;
