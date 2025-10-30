import { z } from "zod";
import { Context } from "./context";
import { Collection } from "../collections";
import { generateDatabase } from "./generate";

export const query = <TCollections extends readonly Collection[], Schema extends z.ZodTypeAny, T>(config: {
  args?: Schema
  handler: (
    ctx: Context<TCollections>,
    args: Schema extends undefined ? undefined : z.infer<Schema>,
  ) => Promise<T>
}): (args?: Schema extends undefined ? undefined : z.infer<Schema>) => Promise<T> => {
  return async (args?: Schema extends undefined ? undefined : z.infer<Schema>) => {
    const ctx: Context<TCollections> = { db: generateDatabase([]) };
    if (config.args) config.args.parse(args ?? {})

    return config.handler(ctx, args ?? ({} as any))
  }
}

export const mutation = <TCollections extends readonly Collection[], Schema extends z.ZodTypeAny, T>(config: {
  args?: Schema
  handler: (
    ctx: Context<TCollections>,
    args: Schema extends undefined ? undefined : z.infer<Schema>,
  ) => Promise<T>
}): (args?: Schema extends undefined ? undefined : z.infer<Schema>) => Promise<T> => {
  return async (args?: Schema extends undefined ? undefined : z.infer<Schema>) => {
    const ctx: Context<TCollections> = { db: undefined };
    if (config.args) config.args.parse(args ?? {})

    return config.handler(ctx, args ?? ({} as any))
  }
}
