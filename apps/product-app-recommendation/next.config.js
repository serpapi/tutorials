/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure allowed image domains for product thumbnails
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS image sources (product thumbnails come from various domains)
      },
    ],
  },
  
  // Environment variables that should be available on the client side
  env: {
    NEXT_PUBLIC_APP_NAME: 'AI Product Recommendations',
  },
};

module.exports = nextConfig;


