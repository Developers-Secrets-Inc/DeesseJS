import { Plugin, PluginConfig } from "./types";

export const plugin = (config: PluginConfig): (() => Plugin) => {
  return () => config;
};
