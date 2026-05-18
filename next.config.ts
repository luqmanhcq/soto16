import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "jsonwebtoken", "postgres", "xlsx"],

  // Diperlukan agar Next.js percaya pada X-Forwarded-* headers dari reverse proxy
  // Tanpa ini, request.url di Proxy/API routes akan menunjuk ke http://localhost bukan https://domain.com
  // Sehingga cookie Secure & redirect URL menjadi salah
  async headers() {
    return [
      {
        // Terapkan security headers pada semua response
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
