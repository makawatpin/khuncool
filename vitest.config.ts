import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Scoped to this module: the repo also has pre-existing *.test.mjs
    // files under app/media/**/ that run via node:test, not Vitest.
    include: [
      "lib/**/*.test.ts",
      "app/gift-exchange/**/*.test.ts",
      "app/media/english/halloween-wordle/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
