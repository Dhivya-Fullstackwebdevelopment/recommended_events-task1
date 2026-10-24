const router = require("express").Router();
const ctrl = require("../controllers/events.controller");
const asyncHandler = require("../utils/asyncHandler");

router.get("/filters", asyncHandler(ctrl.getFilters));
router.get("/dropdowns", asyncHandler(ctrl.getDropdowns));
router.get("/events/recommendations", asyncHandler(ctrl.getRecommendations));
router.post("/events/:id/registrations", asyncHandler(ctrl.registerForEvent));

module.exports = router;
