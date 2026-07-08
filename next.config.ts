import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // React Compiler auto-memoizes components (Next 16 default). Kept on.
  reactCompiler: true,
  // Pin the workspace root. A stray package-lock.json above this project would
  // otherwise make Next infer the wrong root; this project is the root.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
