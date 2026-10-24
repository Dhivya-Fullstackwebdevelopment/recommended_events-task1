const { Schema, model } = require("mongoose");

// One small collection per dropdown, each document is { id, name }
const makeLookup = (modelName, collection) =>
  model(
    modelName,
    new Schema({
      id: { type: Number, required: true, unique: true },
      name: { type: String, required: true, unique: true, trim: true },
    }),
    collection
  );

module.exports = {
  Technology: makeLookup("Technology", "technologies"),
  Category: makeLookup("Category", "categories"),
  ExperienceLevel: makeLookup("ExperienceLevel", "experience_levels"),
};