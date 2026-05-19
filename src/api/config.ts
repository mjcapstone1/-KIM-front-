const DEPLOYMENT_DEFAULT_API_BASE = "https://api.finvibe.kr";

function readEnvValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export const API_BASE_URL =
  readEnvValue(import.meta.env.VITE_API_BASE_URL) ??
  readEnvValue(import.meta.env.VITE_API_BASE) ??
  (import.meta.env.DEV ? "/api" : DEPLOYMENT_DEFAULT_API_BASE);

export function buildMarketWebSocketUrl(): string {
  const explicitWsUrl = readEnvValue(import.meta.env.VITE_WS_MARKET_URL);
  if (explicitWsUrl) return explicitWsUrl;

  const explicitApiBase =
    readEnvValue(import.meta.env.VITE_API_BASE_URL) ?? readEnvValue(import.meta.env.VITE_API_BASE);

  if (explicitApiBase && !explicitApiBase.startsWith("/")) {
    try {
      const apiUrl = new URL(explicitApiBase);
      const wsProtocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${apiUrl.host}/api/market/ws`;
    } catch {
      // Fall back to same-origin websocket if an invalid URL is provided.
    }
  }

  const { protocol, host } = window.location;
  const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${host}/api/market/ws`;
}
