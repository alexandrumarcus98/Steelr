# Project overview

This repository is a pnpm monorepo with:
- `client/`: React 18 + TypeScript + Vite + TailwindCSS + Redux Toolkit
- `server/`: Node.js + Express + TypeScript + MongoDB (Mongoose)

Consult area-specific rules in:
- `.github/instructions/client.instructions.md`
- `.github/instructions/server.instructions.md`
- `CLAUDE.md`, `.clinerules`, `server/.clientrules` where present.

## Build, test, and lint commands

Run commands from the package directory (`client/` or `server/`).

### Client (frontend)
- Install: `pnpm install` (run in repo root or `client/`).
- Dev (Vite): `pnpm dev` (defaults to port 5173).
- Build: `pnpm build` (runs `tsc && vite build`).
- Preview build: `pnpm preview`.
- Tests (Jest): `pnpm test`.
  - Run a single test file: `pnpm test -- src/path/to/file.test.tsx`.
  - Run tests matching a name: `pnpm test -- -t "test name"`.

### Server (backend)
- Dev: `pnpm dev` (ts-node-dev using `server.ts`).
- Build: `pnpm build` (`tsc && tsc-alias`).
- Start built server: `pnpm start` (runs `dist/index.js`).
- Seed mock data: `pnpm seed`.
- Delete seeded data: `pnpm delete`.

Note: server currently has no built-in test/lint scripts. Add tests under `server/src` and expose scripts in `server/package.json` if needed.

## High-level architecture

### App entry points
- Frontend: `client/src/main.tsx` — sets up Redux, toast, auth provider and routes.
- Backend: `server/server.ts` — loads env, connects to MongoDB, starts Express app and handles graceful shutdown.

### Backend layering (strong convention)
- Route -> Controller -> Service.
  - Routes define endpoints + middleware wiring (`server/src/routes/**`).
  - Controllers handle request parsing, status codes and use services (`server/src/controllers/**`).
  - Services contain business logic and Mongoose queries (`server/src/services/**`).
- Models are exported from `server/src/models/index.ts` and must be imported from that barrel.
- Global middleware: `server/src/middleware` contains `authenticate`, RBAC, and `errorHandler`.
- Error shape: handlers return { message, status?, field? } and central error middleware formats responses. Use `AppError` pattern when appropriate.

### Auth & security
- JWT-based auth: access + refresh tokens; `authenticate` middleware reads Bearer token and attaches `req.user` (see `server/src/middleware/auth-middleware`).
- Login uses OTP flow: `/auth/login` triggers OTP email; `/auth/verify-otp` issues tokens.
- App-level protections: Helmet, CORS (origins from env), HPP, and rate-limiter applied in `server/src/app.ts`.

### Frontend patterns
- API layer: `client/src/lib/api.ts` (axios instance) with `setAuthToken(token)` to set Authorization header.
- Data fetching: async thunks in `client/src/store/api/*.tsx` normalize server responses and map `_id` → `id`.
- Auth state: centralized in `client/src/store/slices/authSlice.ts` and used by `providers/auth`.
- Routing uses layouts (`providers/layouts`) and route guards (`RequireAuth`, `RequireGuest`).

## Key conventions and gotchas

- Use strict TypeScript across codebase: avoid `any`, `as unknown`, and prefer named exports.
- Use `@/` alias for imports (configured in both client and server tsconfigs).
- Backend queries: prefer `.lean()` for read-only queries and `select('-passwordHash')` or exclude sensitive fields explicitly.
- Use barrel exports from `server/src/models/index.ts` for model access.
- Normalize API data on the client because backend responses sometimes wrap payloads in `data`, `items`, or raw arrays.
- Env loading: `server/src/config/env.ts` loads `.env` and `.env.dev` when available — do not commit secrets.
- EditorConfig: repository enforces tab indentation (tab size 2) and LF endings; follow it for consistency.
- Tests: frontend uses Jest + babel-jest; refer to `client/jest.config.cjs` for setup.

## Where to look for more rules
- `.github/instructions/client.instructions.md` and `.github/instructions/server.instructions.md` (area-specific constraints)
- `CLAUDE.md` (behavioral guidelines for AI edits)
- `.clinerules`, `server/.clientrules`, `server/cline.md` (project-specific assistant rules)

---

Summary: added concrete commands, described the Route→Controller→Service pattern, auth/OTP flow, and several repo-specific conventions. If you'd like, configure an MCP server for Playwright E2E or another tool next.
