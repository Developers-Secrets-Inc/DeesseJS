import { createAuth } from "../auth";
import type { Config, FinalConfig } from "./types";

export const defineConfig = (config: Config): FinalConfig => {
  return {
    ...config,
    auth: createAuth(config),
  };
};
