const Message = require("../models/Message");
const User = require("../models/User");
const { getOnlineUsers } = require("../config/socket");

// GET /api/v1/chat/contacts — list all users a student/instructor can chat with
exports.getChatContacts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("courses accountType");
    let contacts = [];

    if (currentUser.accountType === "Student") {
      // Find instructors of enrolled courses
      const Course = require("../models/Course");
      const courses = await Course.find({ _id: { $in: currentUser.courses } })
        .populate("instructor", "firstName lastName image email accountType");
      const seen = new Set();
      courses.forEach((c) => {
        const id = c.instructor._id.toString();
        if (!seen.has(id)) { seen.add(id); contacts.push(c.instructor); }
      });
    } else if (currentUser.accountType === "Instructor") {
      // Find all students enrolled in this instructor's courses
      const Course = require("../models/Course");
      const courses = await Course.find({ instructor: req.user.id })
        .populate({ path: "studentsEnrolled", select: "firstName lastName image email accountType" });
      const seen = new Set();
      courses.forEach((c) => {
        c.studentsEnrolled.forEach((s) => {
          const id = s._id.toString();
          if (!seen.has(id)) { seen.add(id); contacts.push(s); }
        });
      });
    } else {
      // Admin: see all users
      contacts = await User.find({ _id: { $ne: req.user.id } })
        .select("firstName lastName image email accountType");
    }

    const onlineUsers = getOnlineUsers();
    const contactsWithStatus = contacts.map((u) => ({
      ...u.toObject(),
      isOnline: onlineUsers.includes(u._id.toString()),
    }));

    return res.status(200).json({ success: true, data: contactsWithStatus });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/chat/history/:roomId
exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ roomId })
      .populate("sender", "firstName lastName image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      { roomId, receiver: req.user.id, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      data: messages.reverse(),
      page,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/chat/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user.id, read: false });
    return res.status(200).json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Build a consistent roomId from two user IDs
exports.getRoomId = (req, res) => {
  const { otherUserId } = req.params;
  const ids = [req.user.id, otherUserId].sort();
  return res.status(200).json({ success: true, roomId: ids.join("_") });
};
