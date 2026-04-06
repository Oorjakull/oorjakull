const PRODUCTION_API_BASE_URL = 'https://oorjakull-backend.vercel.app'
const LOCAL_DEV_API_BASE_URL = 'http://localhost:8000'

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/api\/?$/, '').replace(/\/$/, '')
}

/**
 * Resolve the backend API base URL for web + Android builds.
 *
 * Priority:
 * 1) VITE_API_BASE_URL (explicit env override)
 * 2) localhost for local development
 * 3) production backend for built apps (prevents Android localhost breakage)
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (envUrl) return normalizeBaseUrl(envUrl)

  if (import.meta.env.DEV) return LOCAL_DEV_API_BASE_URL

  return PRODUCTION_API_BASE_URL
}

export const API_BASE_URL = getApiBaseUrl()
