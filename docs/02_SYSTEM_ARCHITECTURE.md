# General Project Architecture

![System architecture](diagrams/system-architecture.svg)

## Top-level components

| Component | Responsibility | Stores persistent data? |
|---|---|---|
| React client | Pages, forms, navigation, local UI state, API calls, WebSocket connection | No; only the JWT is kept in browser storage |
| Express core API | Authentication, authorization, exams, submissions, grading, analytics, admin operations | No direct file storage; writes through PostgreSQL |
| PostgreSQL | Users, exams, submissions, notifications, audit logs | Yes |
| AI service | Creates editable question/feedback suggestions | No |
| Report service | Converts supplied report data into CSV or printable HTML | No |
| WebSocket server | Live notifications and exam-monitoring messages | No; persistent notification history remains in PostgreSQL |

## Who communicates with whom

```text
User -> React client
React client -> Express API       REST/JSON + JWT
React client <-> WebSocket server real-time JSON messages
Express API <-> PostgreSQL        parameterized SQL
Express API -> AI service         internal HTTP/JSON
Express API -> Report service     internal HTTP/JSON
```

The browser never connects directly to PostgreSQL or the private services.

## Where users are stored

Users are stored in the PostgreSQL `users` table. A user record contains the name, email, password hash, role, active status, login-failure count, lock deadline, and timestamps. The original password is never stored.

After login:

1. React sends the email and password to `/api/auth/login`.
2. Express finds the user by normalized email.
3. bcrypt compares the submitted password with `password_hash`.
4. Express signs a JWT containing public identity claims.
5. React stores the JWT and sends it with later protected requests.
6. The server still checks the current database user and permissions for protected operations.

## How data moves through the system

### Normal REST request

```text
User action
  -> React event handler
  -> apiRequest(...)
  -> Express route
  -> authentication/role middleware
  -> controller
  -> service/business rules
  -> parameterized SQL
  -> PostgreSQL result
  -> JSON response
  -> React state
  -> updated screen
```

### Real-time notification

```text
Business service changes data
  -> notification row inserted in PostgreSQL
  -> WebSocket event broadcast to the correct user
  -> notification hook receives event
  -> notification center reloads unread history
```

### AI/report request

```text
React -> core API -> ownership/role validation
                    -> private service over HTTP
                    -> private service response
       <- safe result returned to React
```

The core API is the security boundary. The client cannot call the AI/report services through a privileged browser route and cannot choose another user's exam data.

## Data ownership

- PostgreSQL owns durable application data.
- The core API owns business rules and authorization.
- React owns temporary interface state.
- AI output is only a suggestion and must be reviewed.
- Report services receive already-authorized report data and do not query the database directly.

## Reliability decisions

- Authentication, exams, attempts, grading, and results remain in one core API and one database.
- Optional stateless work is separated into AI and report services.
- If WebSocket disconnects, REST and PostgreSQL remain the source of truth.
- If AI or report generation fails, the basic exam workflow continues working.
