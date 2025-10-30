import { Collection } from "../collections";
import { DatabaseFromCollections } from "./types";

export const generateDatabase = <TCollections extends readonly Collection[]>(
  collections: TCollections,
): DatabaseFromCollections<TCollections> => {
  const database: any = [];

  collections.forEach((collection) => {
    database[collection.slug] = collection;
  });

  return database as DatabaseFromCollections<TCollections>;
};
