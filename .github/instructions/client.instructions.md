---
name: Client rules
description: Rules for React and frontend code in client/
applyTo: "client/**/*.{ts,tsx,js,jsx,css,scss}"
---

# Client rules

Apply the shared repo guidance from [copilot-instructions.md](../copilot-instructions.md).

## Architecture
- All API calls must live in `client/src/lib/` or a dedicated API layer, never directly in React components.
- Use functional components only.
- Put reusable stateful logic into custom hooks with `use*` naming.
- Keep components focused; split oversized components into smaller pieces.
- Prefer existing providers, hooks, and store patterns before creating new ones.
- When importing components, prefer relative imports within `client/src/` and absolute imports for external libraries. (example:import App from "@/App"; instead of import App from "../../App";)

## TypeScript and React
- Use named exports only.
- Avoid `any`.
- Define clear props and state interfaces for non-trivial shapes.
- Keep presentational and data-fetching concerns separated.
- Handle loading, error, and empty states in UI flows that fetch data.

## Styling
- Follow the existing Vite/Tailwind/CSS organization already present in the project.
- Reuse existing utility and style patterns before introducing new CSS structures.

## Output expectations
- For UI changes, list changed files first.
- Keep diffs minimal.
- Do not move API logic into components.

## Import ordering for JSX/TSX files

For all `client/**/*.jsx` and `client/**/*.tsx` files, organize imports into separated groups with exactly one blank line between groups.

Order the groups like this:

1. React and third-party libraries
2. Providers, layouts, and Redux/store imports
3. Pages
4. Components
5. Hooks
6. Lib / API / utils
7. Types
8. Assets / styling

Rules:
- Group imports by purpose using the order above.
- Leave exactly one empty line between groups.
- Inside every group except the first one, sort imports alphabetically by path.
- Keep React / third-party imports in the first group.
- Prefer relative or project alias imports consistently based on the existing client convention.
- Apply this rule only to the client app.
- Do not reorder imports in server files using this convention unless explicitly asked.
