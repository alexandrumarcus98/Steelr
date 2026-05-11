# Cline Context — Steelr Backend

## Overview

Node.js/Express REST API for Steelr. TypeScript, MongoDB Atlas via Mongoose. JWT auth with access + refresh tokens.

## Tech Stack

- **Runtime**: Node.js v22+, pnpm
- **Framework**: Express.js + TypeScript strict
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JWT (access token 15m + refresh token 7d, httpOnly cookie)
- **Validation**: Zod or express-validator
- **Container**: Docker + Dockerfile

## Exact Project Structure

```
server/
├── src/
│   ├── config/                  → DB connection, env config, constants
│   ├── controllers/
│   │   ├── auth-controller/
│   │   │   └── auth.controller.ts
│   │   ├── comments-controller/
│   │   ├── posts-controller/
│   │   └── users-controller/
│   ├── middleware/               → auth, error handler, validation, rate limit
│   ├── mock-up/
│   │   ├── delete/index.ts      → DB cleanup scripts
│   │   └── seed/index.ts        → DB seed scripts
│   ├── models/
│   │   ├── index.ts             → barrel export of all models
│   │   ├── comment.model.ts
│   │   ├── like.model.ts
│   │   ├── post.model.ts
│   │   ├── user.model.ts
│   │   └── view.model.ts
│   ├── routes/
│   │   ├── index.ts             → mounts all routers
│   │   ├── auth-routes/
│   │   ├── comments-routes/
│   │   ├── posts-routes/
│   │   └── users-routes/
│   ├── services/                → business logic (all DB queries live here)
│   ├── types/                   → shared TypeScript interfaces and DTOs
│   └── utils/
│       └── errors.ts            → AppError class and error helpers
├── app.ts                       → Express app setup, middleware stack, routes mount
├── server.ts                    → Entry point: DB connect + app.listen
├── .env.dev                     → Development env vars (never touch)
├── Dockerfile
├── tsconfig.json
└── package.json (pnpm)
```

## Architecture Pattern: Route → Controller → Service

**Routes** — define endpoint, attach middleware, delegate to controller only:

```typescript
// routes/posts-routes/index.ts
router.get("/", authenticate, postController.getAll);
router.post("/", authenticate, validatePost, postController.create);
```

**Controllers** — parse req, call service, send res. No DB calls ever:

```typescript
// controllers/posts-controller/post.controller.ts
export const create = async (req: Request, res: Response) => {
	const post = await postService.create(req.user.id, req.body);
	res.status(201).json(post);
};
```

**Services** — all business logic, Mongoose queries, external calls:

```typescript
// services/post.service.ts
export const create = async (userId: string, data: CreatePostDto) => {
	return Post.create({ ...data, author: userId });
};
```

## Models (Existing)

| File               | Description                                 |
| ------------------ | ------------------------------------------- |
| `user.model.ts`    | User schema — never return `password` field |
| `post.model.ts`    | Post schema                                 |
| `comment.model.ts` | Comment schema — ref to Post + User         |
| `like.model.ts`    | Like schema — ref to Post/Comment + User    |
| `view.model.ts`    | View tracking — ref to Post + User          |
| `index.ts`         | Barrel export — import models from here     |

All new models follow the same pattern and are added to `models/index.ts`.

## Error Handling

- Throw `AppError` from `utils/errors.ts` everywhere
- Central error middleware in `middleware/` catches all errors
- Response shape always: `{ message: string, status: number, field?: string }`
- Never expose stack traces or Mongoose internals in API responses
- Use `asyncHandler` wrapper on all async controllers

## TypeScript Rules

- Strict mode — no `any`, no `as unknown`
- DTOs for all request bodies: `CreatePostDto`, `UpdateUserDto`
- `req.user` typed via Express namespace extension in `types/`
- Import models via `models/index.ts` barrel

## Mongoose Rules

- `.lean()` on all read-only queries
- `select('-password')` on every user query
- Paginate all list queries — never unbounded `.find()`
- Index fields used in `.find()` or `.sort()`
- Transactions for multi-document writes

## Common Commands

```bash
pnpm dev             # ts-node-dev hot reload (port 3000)
pnpm build           # tsc compile
pnpm start           # node dist/server.js
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
docker-compose up    # Start MongoDB locally
```

## Environment

- Env file: `.env.dev` (development)
- Package manager: **pnpm** (not npm or yarn)
- Entry: `server.ts` → `app.ts`
