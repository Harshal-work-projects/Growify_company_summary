# Brand Summary Dashboard

This repo now contains a deployable full-stack version of your dashboard:

- `src/` contains the React frontend.
- `server.js` is the backend that reads from Supabase and serves the built frontend.
- `Brand Summary Dashboard.html` is kept as the original prototype reference.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_TABLE`.
3. Install dependencies with `npm install`.
4. Start local development with `npm run dev`.

## Production hosting

This app is now prepared for always-on deployment:

- `Dockerfile` builds the frontend and runs the Node server in production mode.
- `railway.toml` configures Railway with a Docker build, `/health` checks, and restart behavior.
- `render.yaml` configures a Render web service with Docker and a health check.

## Recommended platforms

### Railway

Best fit if you want the simplest 24/7 deployment for this app.

1. Push this project to GitHub.
2. Create a new Railway project.
3. Add a service from your GitHub repo.
4. Railway will detect the `Dockerfile` automatically.
5. In Railway variables, set:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_TABLE=Summ`
   - `SUPABASE_SCHEMA=public`
   - `SUPABASE_LIMIT=500`
   - `USE_DEMO_DATA=false`
6. Deploy and keep the service type as a persistent service.

### Render

Use a paid web service if you want true 24/7 uptime.

1. Push this project to GitHub.
2. In Render, create a new Web Service from the repo or sync `render.yaml`.
3. Render will build from `Dockerfile`.
4. Set these environment variables in Render:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_TABLE=Summ`
   - `SUPABASE_SCHEMA=public`
   - `SUPABASE_LIMIT=500`
   - `USE_DEMO_DATA=false`
5. Keep the health check path as `/health`.

## Manual deployment

If you deploy on any VPS or container host:

1. Run `npm run build`.
2. Start the app with `npm start`.
3. Ensure the platform provides `PORT`, or the app will default to `3001`.
4. Point your reverse proxy or host to the running Node service.

## Notes

- The browser no longer stores Supabase keys.
- All Supabase access now happens on the server through `/api/brand-summaries`.
- The public health endpoint is `/health`.
- If you want a preview without Supabase, set `USE_DEMO_DATA=true`.
- Do not commit your real `.env` file to Git.
