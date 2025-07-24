/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "motionbgs.com",
      "www.turkanime.co",
      "monomanga.com",
      "storage.googleapis.com",
      "monomanga.7108c887db85882602a558daa1896428.r2.cloudflarestorage.com",
      "7108c887db85882602a558daa1896428.r2.cloudflarestorage.com",
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
