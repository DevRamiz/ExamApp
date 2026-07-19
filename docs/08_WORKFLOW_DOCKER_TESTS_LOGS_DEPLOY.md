# Workflow, Configuration, Docker, Tests, Logs, and Deployment

## Important configuration files

| File | Purpose |
|---|---|
| `.env.example` | Documents database, API, security, and service environment variables |
| `package.json` | npm workspaces and shared commands |
| `docker-compose.yml` | Local multi-container environment |
| `Dockerfile` | Combined production React/API image |
| `client/Dockerfile` | Builds React and serves it with Nginx |
| `server/Dockerfile` | Builds the Express API image |
| `services/*/Dockerfile` | Builds the AI and report services |
| `client/nginx.conf` | Serves React and proxies API/WebSocket traffic |
| `render.yaml` | Render services and managed PostgreSQL blueprint |
| `.github/workflows/ci.yml` | Automatic install, test, build and Docker validation |
| `.github/workflows/deploy.yml` | Optional deployment-hook trigger |

## npm workflow

The root uses npm workspaces for `client`, `server`, and `services/*`.

```powershell
npm ci
npm test
npm run build
npm run verify
```

- `npm ci` installs the exact dependency versions from `package-lock.json`.
- `npm test` runs the server unit tests.
- `npm run build` creates the React production build.
- `npm run verify` runs tests followed by the frontend build.

## Unit tests

The project currently contains five focused unit tests:

1. Automatic grading awards points only for the correct choice.
2. Manual grading cannot exceed a question's maximum points.
3. Total exam points equal the sum of question points.
4. Email validation normalizes capitalization.
5. A multiple-choice correct answer must match one of its options.

Run:

```powershell
npm test
```

The verified result is `5 passed, 0 failed`.

## Local Docker architecture

| Service | Container | Port | Responsibility |
|---|---|---:|---|
| `client` | `examflow-client` | 3000 | Nginx + React |
| `server` | `examflow-server` | 4000 | Express core API and WebSocket |
| `db` | `examflow-db` | 5432 | PostgreSQL 16 |
| `ai-service` | `examflow-ai` | 4101 | AI suggestions |
| `report-service` | `examflow-reports` | 4102 | CSV/HTML reports |

Start:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Docker health checks ensure PostgreSQL and the services are ready before dependent containers start.

Stop without deleting data:

```powershell
docker compose down
```

Reset the local database volume:

```powershell
docker compose down -v
docker compose up --build -d
```

## Logs

Morgan writes HTTP request logs in the API process. Migration, seeding, startup, errors, AI/report requests, and container health are visible through Docker logs.

```powershell
docker compose logs --tail=100 server
docker compose logs --tail=100 ai-service
docker compose logs --tail=100 report-service
docker compose logs -f
```

Typical successful server startup:

```text
Database migration completed.
Database seed completed.
ExamFlow API listening on port 4000
```

Health endpoints:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
Invoke-RestMethod http://localhost:4101/health
Invoke-RestMethod http://localhost:4102/health
```

Application audit logs are different from technical console logs. Audit records are stored in PostgreSQL and displayed on the administrator audit page.

## CI/CD

On pushes to `main`, `dev`, or feature branches, GitHub Actions:

1. Checks out the repository.
2. Installs Node 22.
3. Runs `npm ci`.
4. Runs unit tests.
5. Builds the React client.
6. validates `docker compose config`.
7. Builds the server, client, AI, and report Docker images.

The optional deployment workflow calls a Render deploy hook only when the repository secret `RENDER_DEPLOY_HOOK_URL` is configured.

## Render deployment

`render.yaml` defines:

- a public combined React/API web service;
- a private AI service;
- a private report service;
- a managed PostgreSQL database.

Deployment flow:

```text
GitHub main branch
  -> GitHub Actions verification
  -> Render build/deploy
  -> migration/optional demo seed
  -> public health check
```

Production settings must include a strong `JWT_SECRET`. The demo seed can be disabled with `SEED_DATABASE=false` after demonstration accounts are no longer needed.

After deployment, add the public URL and GitHub repository URL to the root `README.md`.
