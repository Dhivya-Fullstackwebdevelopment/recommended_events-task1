const ApiError = require("./ApiError");

const INTEREST_RE = /^[\w .+#/-]+$/;
const FORMATS = ["online", "in-person"];
const DATE_RANGES = ["week", "month", "quarter", "all"];

// Returns the parsed interests array or throws a 400 with details.
function validateRecommendationQuery(q, { technologies, categories }) {
  const details = [];
  const interests = String(q.interests || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (interests.length > 10) details.push("interests: at most 10 allowed");
  interests.forEach((i) => {
    if (i.length > 40 || !INTEREST_RE.test(i)) details.push(`interests: "${i.slice(0, 20)}" is not a valid interest`);
  });
  if (q.format && !FORMATS.includes(q.format)) details.push("format: must be online or in-person");
  if (q.dateRange && !DATE_RANGES.includes(q.dateRange)) details.push("dateRange: must be week, month, quarter or all");
  if (q.category && !categories.includes(q.category)) details.push("category: unknown category");
  if (q.technology && !technologies.includes(q.technology)) details.push("technology: unknown technology");

  if (details.length) throw new ApiError("Some filters are invalid.", 400, details);
  return interests;
}

// Mirrors the frontend's registration.js (the backend must validate again).
function validateRegistration(f, levels = []) {
  const e = {};
  const name = String(f.fullName || "").trim();
  if (name.length < 2 || name.length > 80 || !/^[\p{L} .'-]+$/u.test(name)) e.fullName = "Enter your full name (2-80 letters).";
  const email = String(f.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) e.email = "Enter a valid email, like name@example.com.";
  const phone = String(f.phone || "").trim();
  if (phone && !/^\+?[0-9 -]{7,15}$/.test(phone)) e.phone = "Use 7-15 digits. Spaces, - and a leading + are allowed.";
  if (!levels.includes(f.experience)) e.experience = "Choose your experience level.";
  if (f.consent !== true) e.consent = "Please agree to receive event updates.";
  return e;
}

module.exports = { validateRecommendationQuery, validateRegistration };
