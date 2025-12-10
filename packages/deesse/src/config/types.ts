import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzle as createDrizzle } from "drizzle-orm/node-postgres";

export type Config = {
  database: ReturnType<typeof createDrizzle>;
  auth?: Omit<BetterAuthOptions, "secret" | "database">;
};

export type FinalConfig = Config & {
  auth: ReturnType<typeof betterAuth>;
  database: ReturnType<typeof createDrizzle>;
};
