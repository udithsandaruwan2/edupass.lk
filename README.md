# edupass.lk

Multi-tenant education SaaS for Sri Lanka O/L & A/L — **Seminar Ops** + **Institute Management**.

## Packages

| Package | Path | Stack |
|---|---|---|
| Frontend | `frontend/` | React 19 · Vite 6 · React Router 7 · Tailwind 4 · Netlify |
| Backend | `backend/` | NestJS 11 · Fastify · TypeScript · Prisma/Postgres (planned) |
| Product docs | `docs/product/` | Vision, domain, API, roadmap, billing |
| DevOpt | `project/` · `docs/` · `AGENTS.md` | Delivery framework |

## Quick start

```sh
npm install
npm run dev:backend    # :3000+
npm run dev:frontend   # :5174+
```

## DevOpt

Agent operating system for this repo. Start at [`AGENTS.md`](AGENTS.md) and [`project/STATE.md`](project/STATE.md).

Product source of truth for scope/stack: [`docs/product/README.md`](docs/product/README.md).
