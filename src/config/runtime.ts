type NodeEnv = "development" | "test" | "production"

function resolveNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test") return value
  return "development"
}

const nodeEnv = resolveNodeEnv(process.env.NODE_ENV)

export const runtime = {
  nodeEnv,
  isDevelopment: nodeEnv === "development",
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
} as const
