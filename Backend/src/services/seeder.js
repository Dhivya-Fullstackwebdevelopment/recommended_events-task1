const fs = require("fs");
const path = require("path");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { Counter } = require("../models/Counter");
const { Technology, Category, ExperienceLevel } = require("../models/lookups");

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, "../../data", file), "utf8"));

// events.json stores "startsInDays" so sample events are always in the future when seeded
const toEvent = ({ startsInDays, startHour = 18, ...rest }) => {
  const d = new Date();
  d.setDate(d.getDate() + startsInDays);
  d.setHours(startHour, 0, 0, 0);
  return { ...rest, startsAt: d };
};

/**
 * Loads data/*.json into MongoDB.
 *  - force=false (server start): only seeds when the collections are empty.
 *  - force=true  (npm run seed): wipes events, dropdowns, registrations and reloads everything.
 * Returns true when data was written.
 */
async function seedDatabase({ force = false } = {}) {
  if (!force) {
    const [events, techs, cats, levels] = await Promise.all([
      Event.estimatedDocumentCount(),
      Technology.estimatedDocumentCount(),
      Category.estimatedDocumentCount(),
      ExperienceLevel.estimatedDocumentCount(),
    ]);
    if (events > 0 && techs > 0 && cats > 0 && levels > 0) return false;
  }

  const wipe = [Event, Technology, Category, ExperienceLevel].map((M) => M.deleteMany({}));
  if (force) wipe.push(Registration.deleteMany({}), Counter.deleteMany({}));
  await Promise.all(wipe);

  await Event.insertMany(readJson("events.json").map(toEvent));
  await Technology.insertMany(readJson("technologies.json"));
  await Category.insertMany(readJson("categories.json"));
  await ExperienceLevel.insertMany(readJson("experience_levels.json"));
  await Promise.all([Event.init(), Registration.init()]); // make sure unique indexes exist
  return true;
}

module.exports = { seedDatabase };
