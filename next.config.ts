import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'phim.nguonc.com' },
      { protocol: 'https', hostname: '**.phimmoi.net' },
      { protocol: 'https', hostname: '**.streamc.xyz' },
    ],
  },
  async headers() {
    return [
      {
        // Áp dụng cho tất cả routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              // Cho phép iframe srcdoc (blob:) và domain embed
              "frame-src 'self' blob: https://*.streamc.xyz https://streamc.xyz",
              "media-src 'self' https: blob:",
              // Cho phép proxy fetch từ embed domains
              "connect-src 'self' https://phim.nguonc.com https://*.phimmoi.net https://*.streamc.xyz https://opstream.xyz https://vkstream.xyz",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
