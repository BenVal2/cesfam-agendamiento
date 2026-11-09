import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Permite desarrollo local tanto por localhost como por 127.0.0.1.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
