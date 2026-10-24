const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => next(new ApiError("Route not found.", 404));

// Response shape matches the frontend: { error: { message, details } }
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") err = new ApiError("Invalid JSON body.", 400);
  if (!(err instanceof ApiError)) {
    console.error(err);
    err = new ApiError("Something went wrong on the server.", 500);
  }
  res.status(err.status).json({ error: { message: err.message, details: err.details } });
};

module.exports = { notFound, errorHandler };
