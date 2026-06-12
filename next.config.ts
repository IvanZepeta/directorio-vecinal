import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Las fotos de trabajos se suben por server action.
      // TODO: comprimir en el cliente antes de subir (browser-image-compression).
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
