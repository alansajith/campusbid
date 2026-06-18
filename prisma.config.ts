import dotenv from "dotenv";
import path from "path";

// Load env variables with .env.local taking precedence (matches Next.js behavior)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || process.env["DIRECT_URL"]!,
  },
});
