/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "/_next/static/fonts/",
          outputPath: "static/fonts/",
        },
      },
    });
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bcrypt",
      "@react-pdf/renderer",
    ],
  },
  transpilePackages: ["@react-pdf/renderer"],
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },

  images: {
    domains: [
      "https://kangaroopakistan-prod.s3.us-east-1.amazonaws.com/",
      "kangaroopakistan-prod.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
