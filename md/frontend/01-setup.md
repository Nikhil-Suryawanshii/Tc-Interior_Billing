# Frontend step 01 — React project

**Depends on:** `md/backend/09-dashboard-and-reports.md`  
**Next:** `02-app-shell.md`

## Goal

A React app that calls the Node API. The first page is the dashboard. There is no login.

## Steps

1. Create `frontend/` with Vite and React.
2. Add React Router, Axios, and Tailwind CSS.
3. Put the API base URL in one config file, default `http://localhost:5000/api/v1`.
4. One Axios client parses `{ data, message, errors }`. A `422` returns field errors. Other failures show the message text.
5. Do not add token storage, an auth header, or a login route.
6. Format INR from API money strings with ₹ in one shared function.
7. Add an empty Dashboard route at `/` to prove the app launches.

## Done when

- `npm run dev` opens the dashboard shell at `http://localhost:5173`.
- A temporary call to `GET /company` shows THE CONCEPT DESIGNERS when the API is running.
- No login page exists.
