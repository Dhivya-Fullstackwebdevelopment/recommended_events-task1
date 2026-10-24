require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const { Counter } = require("./models/Counter");

const at = (days, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const E = (id, title, description, category, skills, days, isOnline, location, slug) => ({
  id, title, description, category, skills, startsAt: at(days), isOnline, location,
  registrationUrl: `https://example.com/register/${slug}`,
});

const EVENTS = [
  E(1, "React Server Components Deep Dive", "Streaming, suspense and data fetching patterns with modern React.js.", "Workshop", ["React.js", "TypeScript"], 3, true, null, "rsc"),
  E(2, "Next.js Conf Bengaluru", "App Router, caching and edge rendering from teams shipping Next.js at scale.", "Conference", ["Next.js", "React.js", "TypeScript"], 12, false, "Bengaluru, IN", "nextjs-blr"),
  E(3, "Node.js Backend Patterns Meetup", "Layered Express APIs, validation, error handling and observability.", "Meetup", ["Node.js", "Express"], 6, false, "Coimbatore, IN", "node-meetup"),
  E(4, "PostgreSQL Indexing Clinic", "Read query plans, fix slow queries and design indexes that last.", "Workshop", ["PostgreSQL"], 9, true, null, "pg-index"),
  E(5, "NestJS + PostgreSQL in Production", "Modules, migrations and testing for a real NestJS service.", "Webinar", ["NestJS", "Node.js", "PostgreSQL"], 20, true, null, "nest-pg"),
  E(6, "Full-Stack Hack Weekend", "48 hours to ship a Next.js, Node.js and PostgreSQL product with mentors.", "Hackathon", ["Next.js", "Node.js", "PostgreSQL", "React.js"], 28, false, "Chennai, IN", "hack-weekend"),
  E(7, "Tailwind CSS Design Systems", "Build a themeable component library on Tailwind CSS and React.js.", "Webinar", ["Tailwind CSS", "React.js"], 15, true, null, "tailwind-ds"),
  E(8, "Docker for Backend Engineers", "Containerise Node.js services and run PostgreSQL locally with Compose.", "Workshop", ["Docker", "Node.js", "PostgreSQL"], 40, true, null, "docker-be"),
  E(9, "React.js Testing Night", "Testing Library, mocks and confidence-first frontend testing.", "Meetup", ["React.js", "TypeScript"], 2, false, "Coimbatore, IN", "react-testing"),
  E(10, "API Security Summit", "Authentication, input validation and secrets handling for Node.js APIs.", "Conference", ["Node.js", "Express"], 75, false, "Hyderabad, IN", "api-sec"),
];

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  await Promise.all([Event.deleteMany({}), Registration.deleteMany({}), Counter.deleteMany({})]);
  await Event.insertMany(EVENTS);
  await Registration.syncIndexes();
  console.log(`Seeded ${EVENTS.length} events`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });