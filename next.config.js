/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is default in Next.js 16.2.6
  experimental: {
    // Enable server actions if needed in future phases
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
