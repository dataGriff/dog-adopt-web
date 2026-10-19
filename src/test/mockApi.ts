import { vi } from 'vitest';
import type { Problem } from '@dogadopt/contracts';
import { ALL_DOGS, BREEDS, CARDIFF, DOGS_TRUST, DOG_PAGE, RESCUE_PAGE, page } from './fixtures';

export interface Recorded {
  method: string;
  url: URL;
}

export type Handler = (url: URL, init: RequestInit | undefined) => Response | undefined;

const problem = (status: number, errorCode: Problem['errorCode'], title: string): Response =>
  new Response(JSON.stringify({ type: `https://api.dogadopt.co.uk/problems/${errorCode}`, title, status, errorCode } satisfies Problem), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Default routing that answers like the real API would for the fixtures. */
export const defaultHandler: Handler = (url) => {
  const p = url.pathname;
  if (p === '/v1/dogs') return json(DOG_PAGE);
  if (p === '/v1/rescues') return json(RESCUE_PAGE);
  if (p === '/v1/breeds') return json({ items: BREEDS });
  const dog = p.match(/^\/v1\/dogs\/([^/]+)$/);
  if (dog) {
    const found = ALL_DOGS.find((d) => d.id === dog[1]);
    return found ? json(found) : problem(404, 'not_found', 'No such dog');
  }
  const rescueDogs = p.match(/^\/v1\/rescues\/([^/]+)\/dogs$/);
  if (rescueDogs) return json(page(ALL_DOGS.filter((d) => d.rescue.id === rescueDogs[1])));
  const rescue = p.match(/^\/v1\/rescues\/([^/]+)$/);
  if (rescue) {
    const found = [CARDIFF, DOGS_TRUST].find((r) => r.id === rescue[1]);
    return found ? json(found) : problem(404, 'not_found', 'No such rescue');
  }
  return undefined;
};

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

export const failing: Handler = () => problem(500, 'internal_error', 'Something broke');
