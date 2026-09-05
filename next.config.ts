import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: [
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
    "pdf-parse",
    "tesseract.js",
  ],
  devIndicators: false,
};

export default config;
