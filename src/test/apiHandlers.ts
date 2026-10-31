// The Dogs API as the fixtures describe it, as plain fetch Responses. Used
// by the unit tests (through mockApi) and by the Playwright suite, so both
// exercise the site against the same contract-validated data.
import type { Problem } from '@dogadopt/contracts';
import { ALL_DOGS, BREEDS, CARDIFF, DOGS_TRUST, DOG_PAGE, RESCUE_PAGE, page } from './fixtures';

export type Handler = (url: URL, init: RequestInit | undefined) => Response | undefined;

export const problem = (status: number, errorCode: Problem['errorCode'], title: string): Response =>
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

export const failing: Handler = () => problem(500, 'internal_error', 'Something broke');
