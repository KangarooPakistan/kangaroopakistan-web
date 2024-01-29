/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
  images: {
    domains: [
      "https://kangaroo-pakistan-local-kainat.s3.us-east-1.amazonaws.com/",
      "kangaroo-pakistan-local-kainat.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig
