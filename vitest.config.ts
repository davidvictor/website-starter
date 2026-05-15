import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/themes/**", "src/lib/**"],
      exclude: ["src/**/__tests__/**", "src/**/*.test.ts"],
    },
  },
})
