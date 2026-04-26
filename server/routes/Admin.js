const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAllUsers, updateUserStatus, deleteUser,
  getAllCoursesAdmin, approveCourse, rejectCourse, deleteCourseAdmin,
  getPlatformStats,
} = require("../controllers/Admin");

router.use(auth, isAdmin);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.delete("/users/:userId", deleteUser);

// Courses
router.get("/courses", getAllCoursesAdmin);
router.patch("/courses/:courseId/approve", approveCourse);
router.patch("/courses/:courseId/reject", rejectCourse);
router.delete("/courses/:courseId", deleteCourseAdmin);

// Analytics
router.get("/stats", getPlatformStats);

module.exports = router;
