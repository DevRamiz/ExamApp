# Database ERD and JSON Models

![Database ERD](diagrams/erd.svg)

PostgreSQL combines relational integrity with JSONB flexibility.

## Tables

### `users`

Stores one login identity.

Important columns:

- `id` — primary key.
- `name`, `email` — public identity; email is unique.
- `password_hash` — bcrypt output, not the original password.
- `role` — `admin`, `teacher`, or `student`.
- `is_active` — controls access.
- `failed_login_attempts`, `locked_until` — account-lockout state.

### `exams`

Stores exam ownership and lifecycle.

Important columns:

- `lecturer_id` — foreign key to the owning lecturer.
- `status` — `draft`, `published`, or `closed`.
- `duration_minutes`, `available_from`, `closes_at` — timing rules.
- `pass_score` — passing percentage.
- `questions JSONB` — ordered question objects.

### `submissions`

Stores one student's attempt for one exam.

Important columns:

- `exam_id`, `student_id` — foreign keys.
- `UNIQUE (exam_id, student_id)` — prevents duplicate attempts.
- `answers JSONB` — current/final answer objects.
- automatic, manual, and final scores.
- feedback and result-publication status.
- deadline and real-time monitoring fields.

### `notifications`

Stores durable notifications. WebSocket delivery is immediate, but this table preserves history when the user is offline.

### `audit_logs`

Stores important security and administration actions with optional user, entity, JSONB details, IP address, and timestamp.

## Relationships

```text
users (teacher) 1 ---- many exams
users (student) 1 ---- many submissions
exams           1 ---- many submissions
users           1 ---- many notifications
users         0..1 ---- many audit_logs
```

Deleting an exam cascades to its submissions. Deleting a user cascades to owned records where the child record has no independent meaning. An audit log keeps its history by setting a deleted actor reference to `NULL`.

## Question JSON model

Multiple-choice question:

```json
{
  "id": "question-uuid",
  "type": "multiple_choice",
  "text": "Which HTTP method normally creates a resource?",
  "options": ["GET", "POST", "HEAD", "OPTIONS"],
  "correctAnswer": "POST",
  "points": 10
}
```

Open question:

```json
{
  "id": "question-uuid",
  "type": "text",
  "text": "Explain why passwords are hashed.",
  "points": 10
}
```

## Answer JSON model

```json
{
  "questionId": "question-uuid",
  "value": "POST",
  "automaticPoints": 10,
  "manualPoints": 0,
  "teacherComment": ""
}
```

Before grading, only `questionId` and `value` are needed. Grading adds point and comment fields.

## Why JSONB is used

Question and answer objects have different shapes. A multiple-choice question has options and a correct answer, while an open question does not. JSONB allows the complete ordered question set to be saved and returned naturally to React.

Relational columns are still used for values that require strong filtering, relationships, or constraints: users, ownership, status, score, deadlines, and timestamps.

## Integrity rules

- Unique user email.
- Allowed role, exam-status, submission-status, and connection-status values.
- Valid duration and pass-score ranges.
- One attempt per student and exam.
- Non-negative monitoring counters.
- Valid exam availability window.
- Foreign keys and indexes for common ownership/status queries.
