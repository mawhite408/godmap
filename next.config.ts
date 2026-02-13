import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/godmap" : "",
  assetPrefix: isProd ? "/godmap/" : "",
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
