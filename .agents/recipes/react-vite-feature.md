# Recipe — React + Vite feature

Use with profile `web-react-vite-netlify`. Do not invent a new folder layout if the repo already has one.

## Steps

1. Read `apps/web/AGENTS.md` and the nearest sibling feature under `src/`.
2. Add files under `src/features/<name>/` (or the repo’s equivalent):
   - `ui/<Name>Page.tsx` — screen
   - `api.ts` — fetch / query / mutation wrappers typed from the API contract
   - `types.ts` — only if not already generated from OpenAPI
3. Wire the route the same way existing routes are wired.
4. Loading / empty / error states before polish.
5. Colocate `ui/<Name>Page.test.tsx`. Assert behavior with RTL + `userEvent`.
6. Run: `pnpm test <file> && pnpm lint && pnpm typecheck`.

## Acceptance checklist

- [ ] Types match the backend contract (no guessed fields)
- [ ] Keyboard usable; buttons are `<button>`
- [ ] No new global state unless ≥3 consumers need it
- [ ] Frontend track only — no `apps/api` edits
