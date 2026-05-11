# Steelr — OpenCode Agent Context

## Project Overview
Steelr is a full-stack social platform (Reddit/Twitter-style) built as a monorepo with two independently containerised apps.

- **Stack**: React 18 + TypeScript + Redux Toolkit + RTK Query (client) / Node.js + Express + Mongoose (server)
- **Infra**: Docker (separate Dockerfiles for client and server), Vite dev server, pnpm workspaces
- **Auth**: JWT-based with password recovery flow (recover-password + reset-password pages)

---

## Repository Structure
steelr/
├── client/ # React SPA
│ ├── Dockerfile
│ ├── vite.config.ts
│ ├── tsconfig.json
│ └── src/
│ ├── App.tsx # Root router + layout
│ ├── main.tsx # Redux Provider + React DOM entry
│ ├── global.d.ts
│ ├── assets/
│ ├── components/
│ │ ├── auth/ # Login/register form components
│ │ ├── posts/ # Post card, post list, post form
│ │ └── users/ # User card, user profile UI
│ ├── pages/
│ │ ├── login/
│ │ ├── register/
│ │ ├── recover-password/
│ │ ├── reset-password/
│ │ ├── feed/ # Main post feed
│ │ ├── post/ # Single post detail + comments
│ │ ├── dashboard/ # User dashboard
│ │ └── user/ # Public user profile
│ ├── store/
│ │ ├── index.ts # configureStore
│ │ ├── hooks.ts # useAppDispatch / useAppSelector
│ │ ├── slices/
│ │ │ ├── postsSlice.ts # Local post state (pagination, filters)
│ │ │ ├── commentsSlice.ts # Local comment state
│ │ │ └── dashboardSlice.ts # Dashboard UI state
│ │ ├── api/
│ │ │ ├── postsApi.tsx # RTK Query: posts CRUD, likes, views
│ │ │ ├── commentsApi.tsx # RTK Query: comments CRUD
│ │ │ └── dashboardApi.tsx # RTK Query: dashboard stats
│ │ └── types/ # Shared TS types for store
│ ├── lib/ # Shared utilities / helpers
│ └── providers/ # React context providers
│
└── server/ # Express API
├── Dockerfile
├── tsconfig.json
└── src/
├── index.ts # Express app bootstrap, DB connect, middleware setup
├── config/ # Environment config (DB URI, JWT secret, etc.)
├── models/
│ ├── user.model.ts # User schema (username, email, passwordHash, avatar)
│ ├── post.model.ts # Post schema (title, body, author ref, tags, media)
│ ├── comment.model.ts # Comment schema (postId ref, authorId ref, body)
│ ├── like.model.ts # Like schema (targetId, targetType, userId)
│ ├── view.model.ts # View tracking schema (postId, userId/IP)
│ └── index.ts # Re-exports all models
├── controllers/ # Request handler functions per domain
├── routes/
│ ├── index.ts # Mounts all routers
│ ├── auth.routes.ts # POST /register, /login, /recover, /reset
│ ├── posts.routes.ts # GET/POST/PUT/DELETE /posts + likes + views
│ ├── comments.routes.ts # GET/POST/PUT/DELETE /comments
│ └── users.routes.ts # GET/PUT /users (profile, avatar)
├── middleware/ # Auth guard (verifyToken), error handler, validators
├── services/ # Business logic layer (called by controllers)
├── types/ # Server-side TS types / interfaces
├── utils/ # Helpers (token generation, password hashing, etc.)
└── mock-up/ # Seed data / mock fixtures for development


---

## Domain Model

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| `User` | username, email, passwordHash, avatar, bio | authors Posts, Comments |
| `Post` | title, body, authorId, tags, mediaUrl, createdAt | has many Comments, Likes, Views |
| `Comment` | body, postId, authorId, parentId?, createdAt | belongs to Post + User |
| `Like` | targetId, targetType (post/comment), userId | polymorphic |
| `View` | postId, userId/IP, createdAt | belongs to Post |

---

## API Routes

### Auth — `/api/auth`
- `POST /register` — create account
- `POST /login` — returns JWT
- `POST /recover-password` — send reset email
- `POST /reset-password` — consume token, set new password

### Posts — `/api/posts`
- `GET /` — paginated feed
- `GET /:id` — single post + view tracking
- `POST /` — create post (auth required)
- `PUT /:id` — edit post (owner only)
- `DELETE /:id` — delete post (owner only)
- `POST /:id/like` — toggle like
- `GET /:id/likes` — like count

### Comments — `/api/comments`
- `GET /?postId=` — comments for a post
- `POST /` — add comment (auth required)
- `PUT /:id` — edit comment (owner only)
- `DELETE /:id` — delete comment (owner only)

### Users — `/api/users`
- `GET /:id` — public profile
- `PUT /:id` — update profile / avatar (auth required)

---

## Client State Architecture

- **RTK Query** handles all server data fetching and caching (`postsApi`, `commentsApi`, `dashboardApi`)
- **Redux slices** manage local UI state only: pagination cursors, active filters (`postsSlice`), comment thread expansion (`commentsSlice`), dashboard tab state (`dashboardSlice`)
- **Typed hooks** — always use `useAppDispatch` / `useAppSelector` from `store/hooks.ts`, never raw `useDispatch`/`useSelector`

---

## Key Conventions

### TypeScript
- Strict mode enabled on both client and server
- Server types live in `server/src/types/`, client store types in `client/src/store/types/`
- Mongoose models are fully typed with generic `Model<IUser>` pattern

### Naming
- Components: `PascalCase.tsx`
- Hooks: `camelCase` prefixed with `use`
- Redux slices: `camelCaseSlice.ts`
- RTK Query APIs: `camelCaseApi.tsx`
- Server files: `kebab-case.type.ts` (e.g. `post.model.ts`, `auth.routes.ts`)

### Auth Pattern
- JWT stored client-side (likely localStorage or httpOnly cookie — check `middleware/` before changing)
- Protected routes use the `verifyToken` middleware in `server/src/middleware/`
- Client guards are in `App.tsx` via React Router protected route wrappers

### Styling
- Tailwind CSS on the client (`custom.css.ts` for custom class generation)
- Prettier config at `client/prettier.json` and `server/prettier.json`

### Testing
- Client: Jest + React Testing Library (`jest.config.cjs`, `__mocks__/`)
- Test files co-located with components (e.g. `Greeting.test.tsx`)

---

## Docker
- `client/Dockerfile` — Vite build → serve
- `server/Dockerfile` — Node.js production build
- Run individually or orchestrate with a `docker-compose.yml` at the root (add if missing)

---

## Common Agent Tasks & Hints

**Adding a new feature (e.g. "bookmarks")**
1. Add Mongoose model in `server/src/models/`
2. Export from `server/src/models/index.ts`
3. Add controller in `server/src/controllers/`
4. Add route file in `server/src/routes/` and mount in `routes/index.ts`
5. Add RTK Query endpoints in a new `client/src/store/api/bookmarksApi.tsx`
6. Add slice if local UI state needed
7. Wire up components under `client/src/components/` and page under `client/src/pages/`

**Modifying auth**
- Touch `server/src/routes/auth.routes.ts`, the corresponding controller, and `server/src/middleware/` for guard changes
- Never store plain passwords — always use the hashing util in `server/src/utils/`

**Adding a new API endpoint**
- Controller function → route binding → test with mock-up data in `server/src/mock-up/`

**Touching Redux**
- Prefer RTK Query for any server-synced data
- Only use slices for pure UI state that doesn't need to be persisted
