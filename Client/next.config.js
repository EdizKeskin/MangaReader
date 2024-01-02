/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "motionbgs.com",
      "www.turkanime.co",
      "monomanga.com",
      "storage.googleapis.com",
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
