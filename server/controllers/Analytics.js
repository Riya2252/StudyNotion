const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");

// Student: get progress for all enrolled courses
exports.getStudentAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("courses");
    const progressRecords = await CourseProgress.find({ userId: req.user.id })
      .populate({ path: "courseID", populate: { path: "courseContent", populate: { path: "subSection" } } });

    const analytics = progressRecords.map((record) => {
      const course = record.courseID;
      if (!course) return null;

      const totalVideos = course.courseContent?.reduce(
        (sum, section) => sum + (section.subSection?.length || 0), 0
      ) || 0;
      const completedVideos = record.completedVideos.length;
      const completionPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      return {
        courseId: course._id,
        courseName: course.courseName,
        thumbnail: course.thumbnail,
        totalVideos,
        completedVideos,
        completionPercentage,
        lastAccessed: record.updatedAt,
      };
    }).filter(Boolean);

    return res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Instructor: get engagement metrics for their courses
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .select("courseName studentsEnrolled ratingAndReviews price createdAt")
      .populate("ratingAndReviews", "rating");

    const progressData = await CourseProgress.find({
      courseID: { $in: courses.map((c) => c._id) },
    });

    const analytics = courses.map((course) => {
      const courseProgress = progressData.filter(
        (p) => p.courseID.toString() === course._id.toString()
      );
      const reviews = course.ratingAndReviews || [];
      const avgRating =
        reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

      const completionRates = courseProgress.map((p) => p.completedVideos.length);
      const avgVideosCompleted =
        completionRates.length > 0
          ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
          : 0;

      return {
        courseId: course._id,
        courseName: course.courseName,
        totalStudents: course.studentsEnrolled.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: reviews.length,
        revenue: course.price * course.studentsEnrolled.length,
        avgVideosCompleted: parseFloat(avgVideosCompleted.toFixed(1)),
        createdAt: course.createdAt,
      };
    });

    // Monthly enrollment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrend = await CourseProgress.aggregate([
      { $match: { courseID: { $in: courses.map((c) => c._id) }, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.status(200).json({ success: true, data: { courses: analytics, enrollmentTrend } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
