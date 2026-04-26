const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

// ─── Users ───────────────────────────────────────────────────────────────────

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search = "" } = req.query;
    const filter = {};
    if (role) filter.accountType = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password -token")
      .populate("additionalDetails")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: users, total, page: parseInt(page) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(userId, { active }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Courses ─────────────────────────────────────────────────────────────────

exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate("instructor", "firstName lastName email")
      .populate("category", "name")
      .select("courseName status price studentsEnrolled createdAt instructor category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: courses, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "Published" },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    return res.status(200).json({ success: true, data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "Draft" },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    return res.status(200).json({ success: true, data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    await Course.findByIdAndDelete(courseId);
    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Platform Analytics ───────────────────────────────────────────────────────

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalStudents, totalInstructors, publishedCourses] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        User.countDocuments({ accountType: "Student" }),
        User.countDocuments({ accountType: "Instructor" }),
        Course.countDocuments({ status: "Published" }),
      ]);

    // New users per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top courses by enrollment
    const topCourses = await Course.find({ status: "Published" })
      .select("courseName studentsEnrolled price")
      .sort({ studentsEnrolled: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalStudents,
        totalInstructors,
        publishedCourses,
        userGrowth,
        topCourses: topCourses.map((c) => ({
          name: c.courseName,
          students: c.studentsEnrolled.length,
          price: c.price,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
