# Trip Ship — 90s Sound System

A community platform for the Trip Ship sound system crew. Share rave memories, catch DJ mixes, and connect with the family.

Built with **Vue 3**, planned **Cloud Functions + Firestore** backend, and **Terraform** for Vercel/GCP infrastructure.

## View the design (fastest)

No backend needed — runs with mock data and auto-login as a DJ:

```bash
npm install
npm run design
```

Open http://localhost:5173 — you'll see the full Trip Ship UI with sample memories and mixes.

## Deploy live on Vercel (iterate from your phone)

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new) → connect `Programmusic/tripship`
3. Tap **Deploy** (settings auto-load from `vercel.json`)

Every push redeploys. See **[VERCEL.md](./VERCEL.md)** for the full mobile setup guide.

## Features

- **User accounts** — Register, login, and manage your crew profile
- **Memory vault** — Share stories from warehouse parties, sound clashes, and free raves
- **DJ mixes** — Selectors upload jungle, dub, garage, and hardcore sessions
- **90s aesthetic** — Neon CRT vibes, bass-bin energy

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3, Vite, Vue Router, Pinia |
| Backend (planned) | Cloud Functions + Firestore |
| Backend (current) | Express API for local dev |
| Infra (planned) | Terraform for Vercel + GCP |
| Deploy | Vercel (frontend) |

## Quick Start (Local Dev)

```bash
# Install dependencies
npm install

# Start frontend + backend
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## Production with Docker Compose

```bash
cp .env.example .env
# Edit JWT_SECRET in .env

docker compose up --build
```

App runs at http://localhost:3000

## Deploy to Vercel

The repo is configured for **frontend-only** deploys with demo data — no env vars required to start.

```bash
# Settings (already in vercel.json)
Install:  npm install --prefix frontend
Build:    npm run build --prefix frontend
Output:   frontend/dist
```

Push to GitHub → Vercel auto-deploys. Full mobile guide: **[VERCEL.md](./VERCEL.md)**

When Cloud Functions + Firestore are added, env vars will be configured via Terraform.

## Terraform (Optional Self-Hosted DB)

Provision PostgreSQL and upload volumes on your own VPS:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your db_password

terraform init
terraform apply
```

Use the output `database_url` as `DATABASE_URL` in Vercel or Docker.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/memories` | — | List memories |
| POST | `/api/memories` | ✓ | Share a memory |
| GET | `/api/mixes` | — | List DJ mixes |
| POST | `/api/mixes` | ✓ DJ | Upload a mix |
| GET | `/api/health` | — | Health check |

## Project Structure

```
tripship/
├── frontend/          Vue 3 SPA
├── backend/           Express API
├── api/               Vercel serverless entry
├── terraform/         Infrastructure as code (optional)
├── vercel.json        Vercel deployment config
├── Dockerfile         Docker production build
└── docker-compose.yml Local full stack
```

## License

MIT
