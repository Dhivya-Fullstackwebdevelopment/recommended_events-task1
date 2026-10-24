# Eventfit - Recommended Events

React + Vite + Tailwind CSS frontend, Node.js (Express) REST API, PostgreSQL.

## Quick start (frontend only, mock API)
```bash
npm install && cp .env.example .env && npm run dev   # http://localhost:5173
```

## Full stack
```bash
# 1. database
createdb eventfit
cd backend && npm install && cp .env.example .env     # edit DATABASE_URL
npm run migrate                                       # schema + seed data
npm start                                             # http://localhost:4000
# 2. frontend (new terminal, project root)
echo "VITE_API_BASE_URL=http://localhost:4000" > .env && npm run dev
```
Tests: `npm test` (frontend) and `cd backend && npm test` (scoring + validation).

## Environment variables
| Name | Where | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | frontend | Backend URL. Empty = built-in mock API. |
| `PORT` | backend | API port (default 4000) |
| `DATABASE_URL` | backend | PostgreSQL connection string (placeholder only in `.env.example`) |
| `CORS_ORIGIN` | backend | Allowed frontend origin |

## REST API
`GET /api/health` -> `{ "ok": true }`

`GET /api/filters` -> `{ "technologies": [...], "categories": [...] }` (read from the database)

`GET /api/events/recommendations?interests=React.js,PostgreSQL&technology=&category=&format=online|in-person&dateRange=week|month|quarter|all`
-> `{ "data": [{ id, title, description, category, skills, startsAt, isOnline, location, registrationUrl, score, maxScore, matchedSkills, reasons }], "meta": { "total": n } }`

`POST /api/events/:id/registrations`
Body: `{ "fullName": "Asha Kumar", "email": "asha@example.com", "phone": "+91 98765 43210", "experience": "Beginner|Intermediate|Advanced", "consent": true }`
-> `201 { "data": { id, eventId, fullName, email } }`

Errors use one shape: `{ "error": { "code", "message", "details": ["field: message"] } }`
Statuses: 400 invalid input, 404 unknown event or route, 409 email already registered for the event, 500 server error.

## Database
`backend/db/schema.sql` (events, event_skills, registrations with a unique `(event_id, lower(email))` index) and `backend/db/seed.sql` (10 events with dates relative to now). `npm run migrate` drops and recreates the tables, so use it for development only.

## Scoring
Skill match +40 per interest, whole-word keyword match +12, category match +5, date relevance up to +20 (sooner is higher). Ties break by earliest date. Past events are excluded. Every result carries `reasons`.

## Assumptions
- Interests match skills by name (`Node.js Backend` matches `Node.js`).
- Registration is stored in PostgreSQL; no confirmation email is sent. The event's `registrationUrl` stays available as an "Event page" link.
- Re-registering the same email for the same event is rejected.

## Known limitations / for production
Pagination, authentication and rate limiting, real email confirmation, proper migrations tooling (not drop-and-recreate), a skills taxonomy with aliases, HTTPS, logging and monitoring, backend API integration tests against a test database.

## Screenshots
Save yours as `docs/screenshot.png`:

![Eventfit screenshot](docs/screenshot.png)
