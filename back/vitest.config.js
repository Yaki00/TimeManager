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
    setupFiles: ["allure-vitest/setup", "tests/setupTests.js"],
    reporters: [
      "default",
      ["allure-vitest/reporter", { resultsDir: "allure-results" }],
    ],
    env: {
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "lcov"],
      // Force Unix paths in coverage reports
      all: true,
      include: ["**/*.js"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "coverage/**",
        "prisma/migrations/**",
        "**/*.spec.js",
        "**/*.test.js",
        "vitest.config.js",
        "html/assets/**",
      ],
    },
  },
});
