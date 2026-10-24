const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { Technology, Category, ExperienceLevel } = require("../models/lookups");
const { nextId } = require("../models/Counter");
const ApiError = require("../utils/ApiError");
const { score } = require("../services/scoring");
const { validateRecommendationQuery, validateRegistration } = require("../utils/validate");

const DATE_DAYS = { week: 7, month: 30, quarter: 90 };

// Dropdown values come from their own collections (technologies, categories, experience_levels)
const names = (docs) => docs.map((d) => d.name);
const loadFilterOptions = async () => {
  const [t, c, l] = await Promise.all([
    Technology.find().sort({ name: 1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
    ExperienceLevel.find().sort({ id: 1 }).lean(),
  ]);
  return { technologies: names(t), categories: names(c), experienceLevels: names(l) };
};

// GET /api/filters
exports.getFilters = async (req, res) => {
  res.json(await loadFilterOptions());
};

// GET /api/dropdowns  -> every dropdown as [{ id, name }]
exports.getDropdowns = async (req, res) => {
  const [technologies, categories, experienceLevels] = await Promise.all(
    [Technology, Category, ExperienceLevel].map((M) => M.find().sort({ id: 1 }).select("-_id id name").lean())
  );
  res.json({ technologies, categories, experienceLevels });
};

// GET /api/events/recommendations?interests=a,b&technology=&category=&format=&dateRange=
exports.getRecommendations = async (req, res) => {
  const options = await loadFilterOptions();
  const interests = validateRecommendationQuery(req.query, options);
  const { technology, category, format, dateRange } = req.query;

  const now = new Date();
  const when = { $gte: now };
  if (dateRange && dateRange !== "all") when.$lte = new Date(now.getTime() + DATE_DAYS[dateRange] * 864e5);

  const filter = { startsAt: when };
  if (technology) filter.skills = technology;
  if (category) filter.category = category;
  if (format) filter.isOnline = format === "online";

  const events = await Event.find(filter).select("-_id -__v").lean();

  const rows = events
    .map((e) => ({ ...e, ...score(e, interests, now) }))
    .sort((a, b) => b.score - a.score || new Date(a.startsAt) - new Date(b.startsAt));

  res.json({ data: rows, meta: { total: rows.length } });
};

// POST /api/events/:id/registrations
exports.registerForEvent = async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId) || !(await Event.exists({ id: eventId }))) throw new ApiError("Event not found.", 404);

  const body = req.body || {};
  const levels = names(await ExperienceLevel.find().lean());
  const errs = validateRegistration(body, levels);
  if (Object.keys(errs).length) {
    throw new ApiError("Some fields are invalid.", 400, Object.entries(errs).map(([k, m]) => `${k}: ${m}`));
  }

  const email = body.email.trim().toLowerCase();
  const duplicate = new ApiError("This email is already registered for this event.", 409);
  if (await Registration.exists({ eventId, email })) throw duplicate;

  try {
    const reg = await Registration.create({
      id: await nextId("registrations"),
      eventId,
      fullName: body.fullName.trim(),
      email,
      phone: (body.phone || "").trim(),
      experience: body.experience,
      consent: true,
    });
    res.status(201).json({ data: { id: reg.id, eventId, fullName: reg.fullName, email: reg.email } });
  } catch (err) {
    if (err.code === 11000) throw duplicate; // race condition safety net (unique index)
    throw err;
  }
};
