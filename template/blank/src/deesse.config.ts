import { drizzle } from "@deessejs/drizzle";
import { defineConfig } from "deesse";

export const config = defineConfig({
  database: drizzle(process.env.DATABASE_URL!),
});
