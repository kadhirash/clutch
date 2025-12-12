/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-media*.fl.yelpcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.yelpcdn.com",
      },
    ],
  },
};

module.exports = nextConfig;
