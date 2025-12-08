import type { Config } from "./types";

let _config: Config | null = null;

export const defineConfig = (config: Config): Config => {
  _config = config;
  return config;
};

export const getConfig = (): Config => {
  if (!_config) {
    throw new Error("Config not defined. Call defineConfig() first.");
  }
  return _config;
};
