# Eventfit - Recommended Events (frontend)

React + Vite + Tailwind CSS v4 frontend. Runs standalone with a built-in mock API, or against your Express/NestJS + PostgreSQL backend.

## Run
```bash
npm install
cp .env.example .env     # leave VITE_API_BASE_URL empty for demo mode
npm run dev              # http://localhost:5173
npm test                 # scoring + validation tests
```

## Environment variables
| Name | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g. `http://localhost:4000`). Empty = mock API. |

## REST contract the backend must implement
`GET /api/filters` -> `{ "technologies": ["React.js"], "categories": ["Workshop"] }`

`GET /api/events/recommendations?interests=React.js,Node.js Backend&technology=&category=&format=online|in-person&dateRange=week|month|quarter|all`
```json
{ "data": [{ "id": 1, "title": "...", "description": "...", "category": "Workshop",
  "skills": ["React.js"], "startsAt": "2026-11-01T12:30:00Z", "isOnline": true, "location": null,
  "registrationUrl": "https://...", "score": 78, "maxScore": 60,
  "matchedSkills": ["React.js"], "reasons": ["Matches your React.js interest", "Starts in 3 days"] }],
  "meta": { "total": 1 } }
```
Errors: `400 { "error": { "code": "INVALID_FILTER", "message": "Some filters are invalid.", "details": ["format: must be online or in-person"] } }`

## Scoring (mirrored in `src/mockApi.js`)
Skill match +40 per interest, keyword match +12, category match +5, date relevance up to +20 (sooner is higher). Ties break by earliest date. Past events are excluded.

## Assumptions and limitations
- Interests are matched by name (`Node.js Backend` matches skill `Node.js`); production should use a skills taxonomy with aliases.
- Filtering and ranking happen server-side; the mock exists only so the UI is demoable.
- Production: pagination, auth/personalised profiles, caching, rate limiting, i18n and time zones.
