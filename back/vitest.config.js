import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.spec.{js,ts}"],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    passWithNoTests: false,
    reporters: ["default"],
    setupFiles: ["tests/setupTests.js"],
    env: {
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "lcov"],
    },
  },
});
