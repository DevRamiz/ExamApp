# ExamFlow — Final Project Submission

ExamFlow is a full-stack exam-management system built with React, Node.js/Express, PostgreSQL, WebSockets, Docker, and two small supporting services.

## Submission information

| Item | Value |
|---|---|
| Student | `<Ramiz Dweiry` — `<208131557>` |
| Course | `<FULLSTACK WEB>` |
| GitHub repository | `<https://github.com/DevRamiz/ExamFlow-FullStack>` |
| Deployed application | `<PENDING DEPLOY URL>` |

Replace the placeholders before submission.

## Main implemented features

### Authentication and roles
- Registration and login with JWT authentication.
- Password hashing with bcrypt.
- Three roles: administrator, lecturer, and student.
- Server-side role and resource-ownership checks.
- Account lockout, rate limiting, active-user checks, and audit logs.

### Lecturer
- Create, edit, publish, close, and delete exams.
- Multiple-choice and open-text questions stored as JSONB.
- View submissions and grade open questions manually.
- Automatic grading for multiple-choice questions.
- Publish results and feedback.
- View analytics, live monitoring, reports, and notifications.

### Student
- View available exams and start one attempt per exam.
- Automatic answer saving every ten seconds.
- Server-enforced duration and deadline.
- Submit answers and receive notifications.
- View results, feedback, and personal analytics after publication.

### Administrator
- View system statistics.
- Create and manage users and roles.
- Enable, disable, and unlock accounts.
- View all exams and audit logs.
- Remove invalid exam data and reset attempts through the API.

### Supporting engineering features
- PostgreSQL relational tables with JSONB question/answer models.
- WebSocket notifications and live exam-monitoring events.
- AI question/feedback suggestions through a separate optional service.
- CSV and printable HTML reports through a separate report service.
- Docker Compose, GitHub Actions CI, Render deployment configuration, and unit tests.
- Responsive desktop and mobile interface.

## Main client pages

| Role | Main pages |
|---|---|
| Public | Login, registration |
| Lecturer | Dashboard, exam list, exam editor, submissions, grading, monitoring, analytics |
| Student | Dashboard, take exam, results, analytics |
| Administrator | Dashboard, users, exams, audit logs |

## Main API groups

| Group | Base path | Responsibility |
|---|---|---|
| Authentication | `/api/auth` | Register, login, current user |
| Exams | `/api/exams` | Exam CRUD, publication, attempts and results |
| Submissions | `/api/submissions` | Auto-save, submit, read and grade |
| Dashboard | `/api/dashboard` | Role-specific summary data |
| Analytics | `/api/analytics` | Lecturer, exam and student statistics |
| Monitoring | `/api/monitoring` | Live exam progress |
| Notifications | `/api/notifications` | Notification history and read status |
| AI | `/api/ai` | Question and feedback suggestions |
| Reports | `/api/reports` | CSV and printable reports |
| Administration | `/api/admin` | Users, exams, attempts and audits |

The complete endpoint list is in [`docs/01_API.md`](docs/01_API.md).

## General architecture

```text
Admin / Lecturer / Student
            |
            v
       React Client
      REST + JWT / WebSocket
            |
            v
      Express Core API
       |       |       |
       v       v       v
 PostgreSQL   AI     Report
             Service Service
```

- Users and passwords are stored in PostgreSQL in the `users` table. Only password hashes are stored.
- The React client never connects directly to PostgreSQL.
- React sends HTTP requests to Express and includes the JWT for protected requests.
- Express validates the user, applies business rules, and runs parameterized SQL.
- Questions and answers are stored as JSONB inside relational exam and submission records.
- WebSockets deliver live notifications and monitoring updates.
- The core API calls the AI and report services using internal HTTP requests.

See [`docs/02_SYSTEM_ARCHITECTURE.md`](docs/02_SYSTEM_ARCHITECTURE.md) for the full explanation.

## Run locally with Docker

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Open `http://localhost:3000`.

Demo accounts use password `123456`:

| Role | Email |
|---|---|
| Administrator | `admin@test.com` |
| Lecturer | `teacher@test.com` |
| Student | `student@test.com` |
| Second student | `student2@test.com` |

Stop the project:

```powershell
docker compose down
```

## Verification

```powershell
npm ci
npm test
npm run build
docker compose config
```

## Required submission documentation

1. [`docs/01_API.md`](docs/01_API.md) — main pages and API endpoints.
2. [`docs/02_SYSTEM_ARCHITECTURE.md`](docs/02_SYSTEM_ARCHITECTURE.md) — client, server, database, services, interfaces, and data flow.
3. [`docs/03_CLIENT_ARCHITECTURE.md`](docs/03_CLIENT_ARCHITECTURE.md) — client packages, folders, components, routing, and state.
4. [`docs/04_SERVER_ARCHITECTURE.md`](docs/04_SERVER_ARCHITECTURE.md) — server packages, layered/MVC structure, middleware, controllers, and services.
5. [`docs/05_DATABASE_ERD_JSON.md`](docs/05_DATABASE_ERD_JSON.md) — ERD, tables, relations, and JSON models.
6. [`docs/06_UML_AND_SEQUENCE_FLOWS.md`](docs/06_UML_AND_SEQUENCE_FLOWS.md) — OOP UML and three central sequence scenarios.
7. [`docs/07_MILESTONES_AND_BRANCHES.md`](docs/07_MILESTONES_AND_BRANCHES.md) — project stages, commits, and branch structure.
8. [`docs/08_WORKFLOW_DOCKER_TESTS_LOGS_DEPLOY.md`](docs/08_WORKFLOW_DOCKER_TESTS_LOGS_DEPLOY.md) — configuration, Docker, tests, logs, CI/CD, and deployment.
