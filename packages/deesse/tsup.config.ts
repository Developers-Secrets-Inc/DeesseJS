import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/config/index.ts", "src/collections/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
});
