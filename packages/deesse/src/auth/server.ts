import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { Config } from "../config/types";

export const createAuth = (config: Config) =>
  betterAuth({
    database: drizzleAdapter(config.database, { provider: "pg" }),
    ...config.auth,
    secret: process.env.DEESSE_SECRET,
  });
