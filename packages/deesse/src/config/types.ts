import { AnyCollection } from "../collections";

export type AdminConfig = {
  defaultLanguage?: string;
};

export type AuthConfig = {};

export type Config = {
  admin: AdminConfig;
  auth: AuthConfig;
  collections: AnyCollection[];
};
