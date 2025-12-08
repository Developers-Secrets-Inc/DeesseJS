import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/test/**",
        "**/__tests__/**",
        "vitest.config.ts",
      ],

      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
    include: [
      "test/**/*.test.{js,ts,jsx,tsx}",
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist", "coverage"],
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
