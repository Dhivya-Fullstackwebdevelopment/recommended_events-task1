// In-browser stand-in for the REST backend. Same contract + scoring as the server:
//   GET /api/filters
//   GET /api/events/recommendations?interests=a,b&technology=&category=&format=&dateRange=
import { ApiError } from './api.js';

const at = (days, hour = 18) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const E = (id, title, description, category, skills, days, isOnline, location, slug) => ({
  id, title, description, category, skills, startsAt: at(days), isOnline, location,
  registrationUrl: `https://example.com/register/${slug}`,
});

export const EVENTS = [
  E(1, 'React Server Components Deep Dive', 'Streaming, suspense and data fetching patterns with modern React.js.', 'Workshop', ['React.js', 'TypeScript'], 3, true, null, 'rsc'),
  E(2, 'Next.js Conf Bengaluru', 'App Router, caching and edge rendering from teams shipping Next.js at scale.', 'Conference', ['Next.js', 'React.js', 'TypeScript'], 12, false, 'Bengaluru, IN', 'nextjs-blr'),
  E(3, 'Node.js Backend Patterns Meetup', 'Layered Express APIs, validation, error handling and observability.', 'Meetup', ['Node.js', 'Express'], 6, false, 'Coimbatore, IN', 'node-meetup'),
  E(4, 'PostgreSQL Indexing Clinic', 'Read query plans, fix slow queries and design indexes that last.', 'Workshop', ['PostgreSQL'], 9, true, null, 'pg-index'),
  E(5, 'NestJS + PostgreSQL in Production', 'Modules, migrations and testing for a real NestJS service.', 'Webinar', ['NestJS', 'Node.js', 'PostgreSQL'], 20, true, null, 'nest-pg'),
  E(6, 'Full-Stack Hack Weekend', '48 hours to ship a Next.js, Node.js and PostgreSQL product with mentors.', 'Hackathon', ['Next.js', 'Node.js', 'PostgreSQL', 'React.js'], 28, false, 'Chennai, IN', 'hack-weekend'),
  E(7, 'Tailwind CSS Design Systems', 'Build a themeable component library on Tailwind CSS and React.js.', 'Webinar', ['Tailwind CSS', 'React.js'], 15, true, null, 'tailwind-ds'),
  E(8, 'Docker for Backend Engineers', 'Containerise Node.js services and run PostgreSQL locally with Compose.', 'Workshop', ['Docker', 'Node.js', 'PostgreSQL'], 40, true, null, 'docker-be'),
  E(9, 'React.js Testing Night', 'Testing Library, mocks and confidence-first frontend testing.', 'Meetup', ['React.js', 'TypeScript'], 2, false, 'Coimbatore, IN', 'react-testing'),
  E(10, 'API Security Summit', 'Authentication, input validation and secrets handling for Node.js APIs.', 'Conference', ['Node.js', 'Express'], 75, false, 'Hyderabad, IN', 'api-sec'),
];

const DATE_DAYS = { week: 7, month: 30, quarter: 90 };
const VALID = { format: ['online', 'in-person'], dateRange: ['week', 'month', 'quarter', 'all'] };
const norm = (s) => s.trim().toLowerCase();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text, w) => new RegExp(`(^|[^a-z0-9])${esc(w)}([^a-z0-9]|$)`).test(text);

export function validate(p) {
  const details = [];
  const interests = (p.interests || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (interests.length > 10) details.push('interests: at most 10 allowed');
  interests.forEach((i) => { if (i.length > 40 || !/^[\w .+#/-]+$/.test(i)) details.push(`interests: "${i.slice(0, 20)}" is not a valid interest`); });
  if (p.format && !VALID.format.includes(p.format)) details.push('format: must be online or in-person');
  if (p.dateRange && !VALID.dateRange.includes(p.dateRange)) details.push('dateRange: must be week, month, quarter or all');
  if (p.category && !CATEGORIES.includes(p.category)) details.push('category: unknown category');
  if (p.technology && !TECHS.includes(p.technology)) details.push('technology: unknown technology');
  if (details.length) throw new ApiError('Some filters are invalid.', 400, details);
  return interests;
}

export const TECHS = [...new Set(EVENTS.flatMap((e) => e.skills))].sort();
export const CATEGORIES = [...new Set(EVENTS.map((e) => e.category))].sort();

// Scoring: skill match 40/interest, keyword match 12, category 5, date relevance up to 20.
export function score(event, interests, now = new Date()) {
  const days = Math.max(0, Math.ceil((new Date(event.startsAt) - now) / 864e5));
  const reasons = [], matched = [];
  let total = 0;
  for (const raw of interests) {
    const i = norm(raw);
    const skill = event.skills.find((s) => i.includes(norm(s)) || norm(s).includes(i));
    if (skill) { total += 40; matched.push(skill); reasons.push(`Matches your ${raw} interest`); }
    else if (hasWord(norm(`${event.title} ${event.description}`), i)) { total += 12; reasons.push(`Mentions ${raw} in its agenda`); }
    else if (norm(event.category).includes(i)) { total += 5; reasons.push(`A ${event.category.toLowerCase()} you asked for`); }
  }
  const recency = Math.round(20 * Math.max(0, 1 - days / 60));
  total += recency;
  reasons.push(days === 0 ? 'Happening today' : days <= 7 ? `Starts in ${days} day${days > 1 ? 's' : ''}` : `Coming up in ${days} days`);
  return { score: total, reasons, matchedSkills: matched, maxScore: 40 * Math.max(interests.length, 1) + 20 };
}

export async function mockRequest(path, params = {}) {
  await new Promise((r) => setTimeout(r, 650));
  if (path === '/api/filters') return { technologies: TECHS, categories: CATEGORIES };
  const interests = validate(params);
  const now = new Date();
  const rows = EVENTS.filter((e) => new Date(e.startsAt) >= now)
    .filter((e) => !params.technology || e.skills.includes(params.technology))
    .filter((e) => !params.category || e.category === params.category)
    .filter((e) => !params.format || (params.format === 'online') === e.isOnline)
    .filter((e) => !params.dateRange || params.dateRange === 'all' || new Date(e.startsAt) - now <= DATE_DAYS[params.dateRange] * 864e5)
    .map((e) => ({ ...e, ...score(e, interests, n