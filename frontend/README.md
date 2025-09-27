# VenCura Frontend (Vite + React)

Minimal UI to create a wallet and interact with the backend API:

- Create wallet
- Get balance
- Sign message
- Send transaction

## Run

1. Install deps: `npm install`
2. Start dev server: `npm run dev`

By default the app targets `http://localhost:4000` for the API. Override with:

```
VITE_API_BASE_URL=https://your-backend.example.com
```

Create a `.env` file or export before running Vite.
