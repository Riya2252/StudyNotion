const express = require("express");
const router = express.Router();
const { auth, isStudent, isInstructor } = require("../middlewares/auth");
const { getStudentAnalytics, getInstructorAnalytics } = require("../controllers/Analytics");

router.get("/student", auth, isStudent, getStudentAnalytics);
router.get("/instructor", auth, isInstructor, getInstructorAnalytics);

module.exports = router;
