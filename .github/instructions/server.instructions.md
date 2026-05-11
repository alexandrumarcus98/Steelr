---
name: Server rules
description: Rules for Express and backend code in server/
applyTo: "server/**/*.{ts,js}"
---

# Server rules

Apply the shared repo guidance from [copilot-instructions.md](../copilot-instructions.md).

## Architecture
- Follow Route -> Controller -> Service architecture.
- Routes only define endpoints and middleware/controller references.
- Controllers parse request, call services, and send responses only.
- Controllers must not contain business logic or database queries.
- Services contain business logic and database access.

## Data access
- Import models via `server/src/models/index.ts` barrel export only.
- Use `.lean()` on read-only queries.
- Use `select('-password')` on user queries.
- Paginate list queries.
- Use transactions for multi-document writes when consistency matters.

## Errors and safety
- Throw `AppError` from `server/src/utils/errors.ts` for handled errors.
- Preserve central error-handling middleware patterns.
- Never return password fields.
- Preserve auth and RBAC middleware patterns.

## Output expectations
- Prefer the smallest safe patch.
- Do not refactor unrelated layers.
- Call out any indexes, validation, or security concerns if they are relevant to the task.
