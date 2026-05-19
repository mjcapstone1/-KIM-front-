# Frontend Deployment

## Vercel

Connect GitHub repo `mjcapstone1/-KIM-front-`.

Build settings:

- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://replace-with-your-backend.up.railway.app
```

`VITE_API_BASE_URL` must be the Railway backend public domain for the first deploy.

After changing Vercel environment variables, redeploy the frontend.

## Final Domain

If the final domain is `finvibe.kr`, use this structure:

```text
Frontend: https://finvibe.kr
Backend:  https://api.finvibe.kr
```

Vercel variables:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://api.finvibe.kr
```

The app automatically builds the WebSocket URL from `VITE_API_BASE_URL`, so `VITE_WS_MARKET_URL` is usually unnecessary.
