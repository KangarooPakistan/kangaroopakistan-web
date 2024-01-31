/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
  images: {
    domains: [
      "https://kangaroopakistan-prod.s3.us-east-1.amazonaws.com/",
      "kangaroopakistan-prod.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig
