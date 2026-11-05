import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Every test file in the repo, not an allowlist of directories. The
    // previous list named three paths, so five test files written outside
    // them never ran under `npm test` — 40 passing assertions nobody was
    // checking, including a whole game's question generator. A pattern means
    // a new test file is picked up the moment it is written.
    //
    // `.mjs` is here because four of those files are plain JavaScript using
    // node:assert. They stay JavaScript: tsconfig typechecks the .ts files,
    // and renaming these would mean annotating them before they compile
    // under `strict` — a separate job from getting them to run at all.
    include: ["{app,lib,components}/**/*.test.{ts,mts,mjs}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      // `server-only`'s main entry throws the moment it is imported, and
      // only resolves to a no-op under the `react-server` export condition,
      // which Next applies and a node test run does not. Every module
      // carrying the marker was therefore untestable — which is why the
      // server-side admin helpers had no tests at all. See the stub for why
      // this does not weaken the real build.
      "server-only": path.resolve(import.meta.dirname, "test/server-only-stub.ts"),
    },
  },
});
