import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzle as createDrizzle } from "drizzle-orm/node-postgres";
import { Plugin } from "../plugins/types";

export type Config = {
  database: ReturnType<typeof createDrizzle>;
  auth?: Omit<BetterAuthOptions, "secret" | "database">;
  plugins: Plugin[]
};

export type FinalConfig = Config & {
  auth: ReturnType<typeof betterAuth>;
};
