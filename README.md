# Trip Ship — 90s Sound System

A community platform for the Trip Ship sound system crew. Share rave memories, catch DJ mixes, and connect with the family.

Built with **Vue 3**, **Node.js/Express**, and **Terraform** for backend infrastructure. Deploys to [Vessl](https://vessl.sh/) on your own VPS.

## Features

- **User accounts** — Register, login, and manage your crew profile
- **Memory vault** — Share stories from warehouse parties, sound clashes, and free raves
- **DJ mixes** — Selectors upload jungle, dub, garage, and hardcore sessions
- **90s aesthetic** — Neon CRT vibes, bass-bin energy

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3, Vite, Vue Router, Pinia |
| Backend | Node.js, Express, JWT auth |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Infra | Terraform (Docker Postgres + volumes) |
| Deploy | Vessl, Docker, Nixpacks |

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

## Terraform (Backend Infrastructure)

Provision PostgreSQL and upload volumes on your VPS:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your db_password

terraform init
terraform apply
```

Set the output `database_url` as `DATABASE_URL` in your deployment environment.

## Deploy to Vessl

1. Connect your GitHub repo in the [Vessl dashboard](https://vessl.sh/)
2. Add your VPS via SSH
3. Set environment variables:
   - `JWT_SECRET` — strong random secret
   - `DATABASE_URL` — from Terraform output (or use SQLite for small setups)
   - `PORT` — `3000`
4. Push to your configured branch — Vessl auto-builds via Nixpacks

The root `nixpacks.toml` and `Dockerfile` are both supported.

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
├── terraform/         Infrastructure as code
├── Dockerfile         Production container
├── nixpacks.toml      Vessl build config
└── docker-compose.yml Local full stack
```

## License

MIT
