import { Collection } from "../collections";

export type CollectionMethods = {
  create: any;
  update: any;
  delete: any;
  find: any;
};


export type DatabaseFromCollections<TCollections extends readonly Collection[]> = {
  [K in TCollections[number]['slug']]: CollectionMethods
}

export type Database<TCollections extends readonly Collection[]> = DatabaseFromCollections<TCollections>
