const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getRecommendations, getTopCourses } = require("../controllers/Recommendation");

router.get("/top", getTopCourses);           // public
router.get("/", auth, getRecommendations);   // authenticated

module.exports = router;
