# Steer Frontend Architecture

## State Management

- Redux Toolkit with slices in `src/store/slices/`
- Posts slice: handles feed, pagination, sorting (latest/mostViewed)
- Auth slice: handles login state, token storage
- RTK Query for API caching in `src/store/api/`

## API Layer

- `src/lib/api.ts`: Axios instance with auth interceptor
- `src/lib/postsEndpoints.ts`: Post-related API calls
- `src/lib/authEndpoints.ts`: Auth-related API calls

## Routing

- React Router in `src/App.tsx`
- Pages in `src/pages/` with lazy loading
- Route guards in `src/providers/auth/`

## Styling

- Tailwind CSS only
- No CSS modules or styled-components
