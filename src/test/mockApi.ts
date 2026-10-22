import { vi } from 'vitest';
import { defaultHandler, type Handler } from './apiHandlers';

export { defaultHandler, failing, json, type Handler } from './apiHandlers';

export interface Recorded {
  method: string;
  url: URL;
}

/**
 * Replaces global fetch. Returns the list of requests made so tests can
 * assert what the API was asked for. `override` runs first; when it
 * returns undefined the default handler answers.
 */
export function mockApi(override?: Handler) {
  const requests: Recorded[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      requests.push({ method: init?.method ?? (input instanceof Request ? input.method : 'GET'), url });
      const response = override?.(url, init) ?? defaultHandler(url, init);
      if (!response) throw new Error(`Unhandled request in test: ${url.pathname}`);
      return response;
    }),
  );
  return {
    requests,
    /** The most recent request to a path, or undefined. */
    last: (path: string) => [...requests].reverse().find((r) => r.url.pathname === path),
    /** Every request to a path. */
    all: (path: string) => requests.filter((r) => r.url.pathname === path),
  };
}
