import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
  tablesFilter: ["admin_*"],
});
