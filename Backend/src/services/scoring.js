// Scoring: skill match 40/interest, keyword match 12, category 5, date relevance up to 20.
const norm = (s) => s.trim().toLowerCase();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasWord = (text, w) => new RegExp(`(^|[^a-z0-9])${esc(w)}([^a-z0-9]|$)`).test(text);

function score(event, interests, now = new Date()) {
  const days = Math.max(0, Math.ceil((new Date(event.startsAt) - now) / 864e5));
  const reasons = [];
  const matched = [];
  let total = 0;

  for (const raw of interests) {
    const i = norm(raw);
    const skill = event.skills.find((s) => i.includes(norm(s)) || norm(s).includes(i));
    if (skill) {
      total += 40;
      matched.push(skill);
      reasons.push(`Matches your ${raw} interest`);
    } else if (hasWord(norm(`${event.title} ${event.description}`), i)) {
      total += 12;
      reasons.push(`Mentions ${raw} in its agenda`);
    } else if (norm(event.category).includes(i)) {
      total += 5;
      reasons.push(`A ${event.category.toLowerCase()} you asked for`);
    }
  }

  total += Math.round(20 * Math.max(0, 1 - days / 60));
  reasons.push(days === 0 ? "Happening today" : days <= 7 ? `Starts in ${days} day${days > 1 ? "s" : ""}` : `Coming up in ${days} days`);

  return { score: total, reasons, matchedSkills: matched, maxScore: 40 * Math.max(interests.length, 1) + 20 };
}

module.exports = { score };