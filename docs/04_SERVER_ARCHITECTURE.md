# Server Architecture

## Technology and packages

The core server is located in `server/`.

| Package | Purpose |
|---|---|
| `express` | REST application, routes, middleware, and responses |
| `pg` | PostgreSQL connection pool and parameterized SQL |
| `bcryptjs` | Password hashing and comparison |
| `jsonwebtoken` | JWT creation and verification |
| `ws` | WebSocket server |
| `helmet` | Security-related HTTP headers |
| `cors` | Allowed browser origin configuration |
| `morgan` | HTTP request logs |
| `dotenv` | Environment-variable loading |
| `nodemon` | Development restart tool |

The AI and report services use Node's built-in HTTP and fetch capabilities and therefore have no external runtime dependencies.

## Architectural style

The server follows a layered structure similar to MVC:

```text
Route -> Middleware -> Controller -> Service -> PostgreSQL
                                      |
                                      -> AI/report gateway
```

It is not a traditional server-rendered MVC application because React is the view. The mapping is:

| MVC idea | ExamFlow implementation |
|---|---|
| Model | PostgreSQL tables, JSONB data, service mapping functions |
| Controller | Files in `server/src/controllers/` |
| View | React client |

## Folder structure

```text
server/src/
├── app.js             Express composition and route mounting
├── server.js          HTTP/WebSocket startup
├── config/            Environment parsing
├── routes/            URLs, methods, and middleware order
├── middleware/        Authentication, roles, rate limits, errors
├── controllers/       HTTP input/output translation
├── services/          Business rules and SQL
├── db/                Pool, schema migration, and demo seed
├── utils/             Shared errors and validation
├── tests/             Unit tests
└── websocket.js       Real-time connection and message handling
```

## Request lifecycle

Example: lecturer creates an exam.

1. `POST /api/exams` matches an exam route.
2. Authentication middleware verifies the JWT and reads the active database user.
3. Role middleware requires the `teacher` role.
4. The controller reads the request body and calls `examService.createExam`.
5. The service validates exam fields and questions.
6. The service executes parameterized SQL.
7. PostgreSQL returns the new record.
8. The service maps database names such as `duration_minutes` into API names such as `durationMinutes`.
9. The controller returns `201 Created` JSON.

## Responsibilities by layer

### Routes
- Define HTTP method and URL.
- Choose authentication and role middleware.
- Select the controller function.

### Middleware
- Request identifiers and IP context.
- API and login rate limits.
- JWT verification.
- Active-user and role checks.
- 404 and centralized error responses.

### Controllers
- Read route parameters and request bodies.
- Call one service operation.
- Select response status and body.

### Services
- Business validation.
- Ownership and workflow checks.
- SQL queries.
- Automatic and manual grading.
- Notifications and audits.
- Analytics calculations.
- Calls to private AI/report services.

### Database
- Primary/foreign keys.
- Uniqueness and check constraints.
- Durable user, exam, attempt, notification, and audit data.

## Security controls

- Passwords are hashed with bcrypt.
- JWTs are verified on protected requests.
- Roles are checked by middleware.
- Services check ownership of exams and submissions.
- SQL values use placeholders such as `$1` and `$2`.
- Helmet sets safer response headers.
- CORS allows the configured client origin.
- Request bodies are size-limited.
- Login attempts can lock an account temporarily.
- Important actions create audit records.
- Student responses do not receive correct answers before result publication.

## Core API and supporting services

The core server owns all critical data. `aiGatewayService` and `reportGatewayService` call the two stateless services through internal HTTP URLs. Those services cannot read PostgreSQL directly, so authorization remains centralized in the core API.
