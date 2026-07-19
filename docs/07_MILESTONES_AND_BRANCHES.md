# Milestones and Branch Structure

The Git history is organized as incremental milestones rather than one final commit.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable integrated submission version |
| `dev` | Verified development baseline |
| `feature/full-stack-core` | React/Express exam workflow |
| `feature/database-jsonb` | PostgreSQL schema and JSONB models |
| `feature/docker-deployment` | Docker and deployment configuration |
| `feature/testing-documentation` | Tests, diagrams, and documentation |
| `feature/advanced-platform` | Monitoring, analytics, AI, reports, admin, security, and CI |

## Milestone history

| Commit | Milestone | Main result |
|---|---|---|
| `2f169ed` | Full-stack core and database | Authentication, roles, exam CRUD, attempts, grading, PostgreSQL and JSONB |
| `9e28d60` | Docker and cloud configuration | Container setup and deployment files |
| `af3e966` | Testing and documentation | Unit tests, project documentation, ERD/UML/sequence diagrams |
| `3c2785b` | API Docker correction | Complete server image configuration |
| `2f3430d` | Portable npm installation | Public npm-registry configuration |
| `b0c78ab` | Runtime verification | Clean production runtime checks recorded on `dev` |
| `407ca6a` | PostgreSQL/Windows correction | Seed parameter types and safer Windows launcher |
| `36ad07f` | Advanced platform | Monitoring, notifications, analytics, services, admin, security and CI |
| `29753e0` | Integration | Advanced branch merged into `main` |

## Development flow used

```text
feature branch
   -> local install and implementation
   -> tests/build
   -> commit
   -> integration into main
   -> Docker runtime verification
```

Examples of evidence available in Git:

```powershell
git branch --all
git log --oneline --decorate --graph --all
git status
```

Before final submission, push all branches:

```powershell
git push -u origin main
git push origin --all
```

The GitHub link in the root README must be replaced with the final repository URL.
