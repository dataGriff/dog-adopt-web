import { createDogsApiClient } from '@dogadopt/contracts';

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8787';

export const api = createDogsApiClient({
  baseUrl: API_BASE_URL,
  // Resolve fetch at call time rather than at import time so the global can
  // be replaced (tests) or polyfilled after this module loads.
  fetch: (request) => globalThis.fetch(request),
});
