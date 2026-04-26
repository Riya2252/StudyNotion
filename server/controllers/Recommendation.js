const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");

/**
 * Recommendation logic:
 * 1. Find categories of courses the user is enrolled in / completed
 * 2. Find highly-rated courses in those categories the user hasn't taken
 * 3. Fall back to top-rated courses site-wide if not enough results
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("courses accountType");
    const enrolledIds = user.courses.map((id) => id.toString());

    let recommendedCourses = [];

    if (enrolledIds.length > 0) {
      // Get categories from enrolled courses
      const enrolledCourses = await Course.find({ _id: { $in: enrolledIds } }).select("category");
      const categoryIds = [...new Set(enrolledCourses.map((c) => c.category?.toString()).filter(Boolean))];

      // Find courses in same categories, not yet enrolled, published
      recommendedCourses = await Course.find({
        _id: { $nin: enrolledIds },
        category: { $in: categoryIds },
        status: "Published",
      })
        .populate("instructor", "firstName lastName image")
        .populate("ratingAndReviews")
        .select("courseName courseDescription thumbnail price ratingAndReviews studentsEnrolled instructor")
        .limit(8);
    }

    // Pad with top-rated site-wide if fewer than 4 results
    if (recommendedCourses.length < 4) {
      const existingIds = recommendedCourses.map((c) => c._id.toString()).concat(enrolledIds);
      const popular = await Course.find({
        _id: { $nin: existingIds },
        status: "Published",
      })
        .populate("instructor", "firstName lastName image")
        .populate("ratingAndReviews")
        .select("courseName courseDescription thumbnail price ratingAndReviews studentsEnrolled instructor")
        .sort({ studentsEnrolled: -1 })
        .limit(8 - recommendedCourses.length);
      recommendedCourses = [...recommendedCourses, ...popular];
    }

    // Attach average rating
    const withRating = recommendedCourses.map((course) => {
      const c = course.toObject();
      const reviews = c.ratingAndReviews || [];
      c.avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
      return c;
    });

    // Sort by rating desc
    withRating.sort((a, b) => b.avgRating - a.avgRating);

    return res.status(200).json({ success: true, data: withRating });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Public: top courses for unauthenticated homepage visitors
exports.getTopCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Published" })
      .populate("instructor", "firstName lastName image")
      .populate("ratingAndReviews")
      .select("courseName courseDescription thumbnail price ratingAndReviews studentsEnrolled instructor")
      .sort({ studentsEnrolled: -1 })
      .limit(8);

    const withRating = courses.map((course) => {
      const c = course.toObject();
      const reviews = c.ratingAndReviews || [];
      c.avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
      return c;
    });

    return res.status(200).json({ success: true, data: withRating });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
