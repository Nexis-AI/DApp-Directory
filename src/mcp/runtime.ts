export interface McpRuntimeConfig {
  host: string;
  port: number;
  transport: "http" | "stdio";
}

type RuntimeEnv = Record<string, string | undefined>;

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getMcpRuntimeConfig = (
  env: RuntimeEnv = process.env,
): McpRuntimeConfig => ({
  host: env.MCP_HOST?.trim() || "0.0.0.0",
  port: parsePort(env.MCP_PORT ?? env.PORT, 8788),
  transport: env.MCP_TRANSPORT === "http" ? "http" : "stdio",
});
