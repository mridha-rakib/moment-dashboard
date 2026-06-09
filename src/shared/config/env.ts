const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";
const DEFAULT_API_TIMEOUT_MS = 15000;

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const readNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const appConfig = Object.freeze({
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL),
  apiTimeoutMs: readNumber(import.meta.env.VITE_API_TIMEOUT_MS, DEFAULT_API_TIMEOUT_MS),
  mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "",
});
