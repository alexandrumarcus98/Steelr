# Steelr Client

A React + TypeScript frontend for the Steelr application.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Update `VITE_API_URL` to match your backend API URL.

3. Start development server:
   ```bash
   pnpm run dev
   ```

## Backend Integration

This frontend connects to a backend API. Ensure the backend is running and the API URL is configured in `.env`.

### Auth Flow

- Register: POST /users/register
- Login: POST /auth/login (not implemented yet)
- Protected routes require JWT token in Authorization header.

## Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run test` - Run tests
