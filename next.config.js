/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["bcryptjs", "jsonwebtoken", "postgres", "xlsx", "axios", "axios-cookiejar-support", "tough-cookie", "cheerio"],

  // Konfigurasi untuk next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },

  // Diperlukan agar Next.js percaya pada X-Forwarded-* headers dari reverse proxy
  // Tanpa ini, request.url di Proxy/API routes akan menunjuk ke http://localhost bukan https://domain.com
  // Sehingga cookie Secure & redirect URL menjadi salah
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    return [
      {
        // Cache jangka panjang untuk aset statis dengan nama unik (gambar/font publik)
        source: "/:path*.(jpg|jpeg|png|webp|gif|svg|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" },
        ],
      },
      {
        // Terapkan security headers pada semua response
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Content Security Policy — allow PDF/video preview di manajemen pengetahuan & sertifikat (self, blob:, youtube, drive)
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; " +
              "style-src 'self' 'unsafe-inline' https:; " +
              "img-src 'self' data: https: blob:; " +
              "font-src 'self' data: https:; " +
              "connect-src 'self' blob: https:; " +
              "media-src 'self' blob: https:; " +
              "frame-src 'self' blob: https: https://www.youtube.com https://youtube.com https://drive.google.com https://docs.google.com; " +
              "object-src 'self' blob: https:; " +
              "frame-ancestors 'self' blob:; " +
              "base-uri 'self'; " +
              "form-action 'self';"
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(), microphone=(), camera=(), payment=(), usb=(), " +
              "magnetometer=(), gyroscope=(), accelerometer=()"
          },
          // Strict Transport Security (HSTS) - hanya untuk production
          ...(isProduction
            ? [{
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains; preload"
              }]
            : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;
