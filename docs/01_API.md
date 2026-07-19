# Main Pages and API

## Client routes

### Public routes

| Route | Page | Purpose |
|---|---|---|
| `/login` | `LoginPage` | Authenticate an existing user |
| `/register` | `RegisterPage` | Create a new student account |

### Lecturer routes

| Route | Page | Purpose |
|---|---|---|
| `/teacher` | `TeacherDashboard` | Lecturer summary and recent activity |
| `/teacher/exams` | `TeacherExamsPage` | View and manage owned exams |
| `/teacher/exams/new` | `ExamEditorPage` | Create an exam |
| `/teacher/exams/:id/edit` | `ExamEditorPage` | Edit a draft exam |
| `/teacher/exams/:id/submissions` | `ExamSubmissionsPage` | View exam submissions |
| `/teacher/exams/:id/monitor` | `TeacherMonitoringPage` | Monitor active students |
| `/teacher/submissions/:id` | `SubmissionReviewPage` | Grade a submission |
| `/teacher/analytics` | `TeacherAnalyticsPage` | View performance statistics |

### Student routes

| Route | Page | Purpose |
|---|---|---|
| `/student` | `StudentDashboard` | Available exams and activity |
| `/student/exams/:examId` | `TakeExamPage` | Start, continue, auto-save, and submit an exam |
| `/student/results` | `StudentResultsPage` | View published grades and feedback |
| `/student/analytics` | `StudentAnalyticsPage` | View grade history and pass statistics |

### Administrator routes

| Route | Page | Purpose |
|---|---|---|
| `/admin` | `AdminDashboard` | System statistics |
| `/admin/users` | `AdminUsersPage` | Manage users, roles, status, and locks |
| `/admin/exams` | `AdminExamsPage` | Review and remove exams |
| `/admin/audits` | `AdminAuditPage` | Review audit records |

## REST API endpoints

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Read the current authenticated user |

### Exams

| Method | Endpoint | Role / purpose |
|---|---|---|
| GET | `/api/exams` | List exams visible to the current role |
| GET | `/api/exams/:id` | Read one authorized exam |
| POST | `/api/exams` | Lecturer creates a draft |
| PUT | `/api/exams/:id` | Lecturer edits an owned draft |
| DELETE | `/api/exams/:id` | Lecturer deletes an owned draft |
| PATCH | `/api/exams/:id/publish` | Lecturer publishes an exam |
| PATCH | `/api/exams/:id/close` | Lecturer closes an exam |
| GET | `/api/exams/:id/submissions` | Lecturer views submissions |
| PATCH | `/api/exams/:id/results/publish` | Lecturer publishes graded results |
| POST | `/api/exams/:examId/start` | Student creates or resumes one attempt |

### Submissions

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/submissions/my` | Student reads personal attempts/results |
| GET | `/api/submissions/:id` | Authorized student/lecturer reads one submission |
| PATCH | `/api/submissions/:id/autosave` | Save in-progress answers |
| POST | `/api/submissions/:id/submit` | Final submission and automatic grading |
| PATCH | `/api/submissions/:id/grade` | Lecturer performs manual grading |

### Dashboard, analytics, monitoring, and notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Role-specific dashboard data |
| GET | `/api/analytics/teacher` | Lecturer overview statistics |
| GET | `/api/analytics/exams/:id` | Statistics for one owned exam |
| GET | `/api/analytics/student` | Student grade-history statistics |
| GET | `/api/monitoring/exams/:id` | Lecturer reads live exam progress |
| GET | `/api/notifications` | Read notification history |
| PATCH | `/api/notifications/:id/read` | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

### AI and reports

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/ai/generate-questions` | Return editable question suggestions |
| POST | `/api/ai/submissions/:id/feedback-suggestion` | Return an editable feedback suggestion |
| GET | `/api/reports/exams/:id.csv` | Download an exam-results CSV |
| GET | `/api/reports/exams/:id.html` | Open a printable HTML report |

### Administration

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/users` | Create a user |
| PATCH | `/api/admin/users/:id` | Change role/status or unlock account |
| GET | `/api/admin/exams` | List all exams |
| DELETE | `/api/admin/exams/:id` | Delete an invalid/test exam |
| PATCH | `/api/admin/submissions/:id/reset` | Reset an attempt |
| GET | `/api/admin/audits` | Read audit logs |

## WebSocket

The client connects to:

```text
/ws?token=<JWT>
```

Main messages:

- `notification_created` — a new persistent notification is available.
- `exam_monitor_update` — a lecturer receives updated student progress.
- `exam_heartbeat` — a student sends answered count, current question, connection state, and tab-switch count.
