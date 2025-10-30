import { Collection } from "../collections";
import { Database } from "./types";

export type Context<TCollections extends readonly Collection[]> = {
  db: Database<TCollections>;
};
