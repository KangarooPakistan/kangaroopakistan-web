/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations (only applied in production, not with Turbopack)
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),

  // Experimental features for Next.js 14.x
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bcrypt",
      "@react-pdf/renderer",
    ],
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'axios', '@tanstack/react-table'],
  },

  // Reduce bundle size
  transpilePackages: ["@react-pdf/renderer", "@tanstack/react-table"],

  // Speed up development
  swcMinify: true,

  // Fix chunk loading issues and improve performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2, // Reduced from 5 to 2 for faster compilation
  },

  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      // Faster source maps in development
      config.devtool = 'cheap-module-source-map';
      
      // Reduce the number of modules to compile
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    // Font handling
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

    // Module parsing for .m?js files
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        constants: false,
      };
    }

    // Increase chunk size limit to prevent timeout issues
    config.performance = {
      ...config.performance,
      maxAssetSize: 1000000, // 1MB
      maxEntrypointSize: 1000000, // 1MB
    };

    // Cache configuration for faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    return config;
  },

  // Note: api.bodyParser is not supported with Turbopack
  // If you need large request bodies, handle it in the API route itself
  // using: export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }

  async headers() {
    return [
      {
        source: "/_next/static/fonts/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
      // Most permissive iframe embedding - allows embedding anywhere
      {
        source: "/results",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kangaroopakistan-prod.s3.us-east-1.amazonaws.com",
      },
    ],
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
  },
};

// Only use bundle analyzer in development when explicitly enabled
if (process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
    module.exports = withBundleAnalyzer(nextConfig);
  } catch (error) {
    console.warn('Bundle analyzer not available, proceeding without it');
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}

