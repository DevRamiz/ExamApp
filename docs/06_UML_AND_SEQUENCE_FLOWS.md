# OOP UML and Central Sequence Flows

## OOP UML diagram

![OOP UML](diagrams/class-diagram.svg)

The project is implemented with JavaScript objects and service modules rather than many explicit JavaScript `class` declarations. The UML diagram describes the main domain objects and the operations that act on them:

- `User` represents an administrator, lecturer, or student.
- `Exam` owns question objects and lifecycle operations.
- `Submission` owns answer objects and grading/monitoring state.
- `Notification` and `AuditLog` support communication and traceability.
- Core services implement authentication, exams, submissions, analytics, monitoring, administration, and notifications.
- AI and report services are separate stateless collaborators.

## Scenario 1 — Lecturer creates and publishes an exam

![Create exam sequence](diagrams/sequence-create-exam.svg)

1. The lecturer fills the React exam form.
2. React sends `POST /api/exams` with the JWT.
3. Express verifies authentication and the lecturer role.
4. The controller calls the exam service.
5. The service validates title, timing, question type, options, correct answers, and points.
6. PostgreSQL inserts the draft and stores questions as JSONB.
7. The API returns the created exam.
8. Later, the lecturer sends the publish action.
9. The service changes the status to `published` and creates/broadcasts notifications.

## Scenario 2 — Student starts, auto-saves, and submits

![Submit exam sequence](diagrams/sequence-submit-exam.svg)

1. The student opens a published exam.
2. React calls `POST /api/exams/:examId/start`.
3. The server checks exam availability and creates or resumes one authorized attempt.
4. Correct answers are removed before questions are returned.
5. React stores answers locally.
6. Every ten seconds React sends the current answers to the auto-save endpoint.
7. PostgreSQL updates `answers JSONB` and the monitoring state.
8. On final submission, automatic multiple-choice grading runs.
9. The submission becomes `graded` when no manual questions exist, otherwise it waits for lecturer grading.

## Scenario 3 — Lecturer grades and publishes results

![Grade and results sequence](diagrams/sequence-grade-results.svg)

1. The lecturer opens one submission.
2. The server verifies ownership of the submission's exam.
3. PostgreSQL returns the exam questions, answers, student, and current scores.
4. The lecturer assigns points/comments for open questions.
5. The service clamps points to each question's maximum and calculates the final score.
6. PostgreSQL stores the grade and feedback.
7. After all required submissions are graded, the lecturer publishes results.
8. Students receive a persistent notification and a live WebSocket event.
9. The student results page can now display scores, answers, and feedback.
