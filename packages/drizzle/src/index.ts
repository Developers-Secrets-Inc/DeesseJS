import { drizzle as createDrizzle } from "drizzle-orm/node-postgres";

export const drizzle = (databaseUrl: string) => createDrizzle(databaseUrl);
