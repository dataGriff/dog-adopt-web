# dog-adopt-web

The public Dog Adopt website: browse and filter dogs listed by UK rescues and find the rescue that holds each one. A static React site that reads only from the [Dogs API](https://github.com/dataGriff/dog-adopt-api) through the client generated from the [contracts](https://github.com/dataGriff/dog-adopt-spec), deployed to Cloudflare.

The acceptance criteria are `services/web/features/browse-dogs.feature` in the spec repository. Tests here are named after its scenarios.

## Running locally

```sh
pnpm install
cp .env.example .env          # VITE_API_BASE_URL, default http://localhost:8787
pnpm dev                      # http://localhost:5173
```

Run the API alongside it with `wrangler dev` in dog-adopt-api (it listens on 8787 by default). The site has no data of its own; with no API running every page shows its error state with a retry button.

```sh
pnpm lint
pnpm typecheck
pnpm test        # vitest + testing-library against a mocked, contract-validated API
pnpm build       # type-checks then builds dist/
pnpm preview
```

`task check` runs what CI runs.

## Layout

```
src/
  main.tsx            QueryClient + RouterProvider
  router.tsx          routes: / , /dogs/:dogId , /rescues , /rescues/:rescueId , /about , *
  api/client.ts       createDogsApiClient from @dogadopt/contracts, base URL from VITE_API_BASE_URL
  api/queries.ts      TanStack Query hooks, one per API operation, plus ApiError
  lib/dogFilters.ts   URL query string <-> home page filters (the URL is the source of truth)
  lib/format.ts       status labels, compatibility wording (Yes / No / Not known), relative dates
  components/         Header, Footer (with the data-freshness disclaimer), DogCard, FilterSidebar, SearchBar, ...
  components/ui/      small hand-written primitives (button, badge, card, input, select, checkbox, skeleton)
  pages/              one component per route, with its tests beside it
  test/               fixtures validated against the contract's zod schemas, a fetch mock, a render helper
public/_redirects     SPA fallback for Cloudflare Pages
wrangler.jsonc        `wrangler deploy` of dist/ as static assets with SPA not-found handling
```

## The contract package

`@dogadopt/contracts` is pinned to a git ref of dog-adopt-spec in `package.json`:

```json
"@dogadopt/contracts": "github:dataGriff/dog-adopt-spec#ccr-36d5f29f-ktwvoo"
```

Every API type, the typed `fetch` client and the enum lists used for filter options come from it; nothing about the API is hand-written here. When the contract moves, change the ref (a tag once released), run `pnpm update @dogadopt/contracts`, and let the typecheck and the fixture tests tell you what changed. `src/test/fixtures.test.ts` validates the test fixtures against the contract's response schemas so the mocked API cannot drift from the real one.

## Deploying

`wrangler.jsonc` configures the built `dist/` as Workers static assets with single-page-app not-found handling, so `pnpm deploy` (or `task deploy`) publishes it. The `Deploy` workflow does the same on pushes to `main` once the repository variable `CLOUDFLARE_DEPLOY_ENABLED` is `true` and the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` plus the variable `VITE_API_BASE_URL` are set. Until then the job is skipped.

## Deliberately out of scope

Admin pages, sign-in, the chat assistant and the availability reports from the previous site are not in this version. The site holds no service token and cannot write to the API. Dog descriptions and photos are never copied: a card shows the rescue's own image by link when the API has one, and links to the dog's profile on the rescue's website.
