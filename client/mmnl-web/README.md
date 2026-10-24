# MMNL web (React)

Vite + React 18 + React Router + TanStack Query + Tailwind 4, plain JSX.

```
npm install
npm run dev      # http://localhost:5173, proxies /api, /oauth2, /logout to http://localhost:8080
npm run build
```

- Contact email shown on the error page and footer, upload limits and logout path: `src/config.js`.
- Backend contract: `API_ENDPOINTS.md`.
- There is no mock data. If the backend fails, the app shows the error page (`src/pages/System.jsx`).
- Your original sign-in flow (`/api/me` + Google link) lives in `src/auth/AuthContext.jsx`.
- `src/pages/public/Privacy.jsx` is draft text: get it reviewed before launch.
