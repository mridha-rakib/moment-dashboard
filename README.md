# Xenog Admin Dashboard

React + Vite admin dashboard for Xenog.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Local URL:

```text
http://127.0.0.1:5173/sign-in
```

## Environment

```text
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_API_TIMEOUT_MS=15000
```

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Frontend Architecture

```text
src
  features
    auth
      services       auth endpoints, API service, session storage, guards
      store          Zustand auth store
      types.ts       auth feature types
  shared
    api             Axios client, interceptors, token manager, API errors
    config          environment config
    storage         browser storage helpers
    store           reusable store state helpers
```

Admin login uses:

```text
POST /auth/admin/login
```

The Axios client adds the bearer token automatically, handles unauthorized responses centrally, normalizes API errors, and keeps token management separate from feature state.
