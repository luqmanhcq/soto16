import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "jsonwebtoken", "postgres", "xlsx"],
};

export default nextConfig;
