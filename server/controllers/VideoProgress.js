const VideoProgress = require("../models/VideoProgress");
const CourseProgress = require("../models/CourseProgress");

// Save/update video watch position
exports.saveVideoProgress = async (req, res) => {
  try {
    const { courseId, subSectionId, watchedSeconds, totalSeconds } = req.body;
    const userId = req.user.id;

    const progress = await VideoProgress.findOneAndUpdate(
      { userId, subSectionId },
      { userId, courseId, subSectionId, watchedSeconds, totalSeconds },
      { upsert: true, new: true }
    );

    // Auto-mark complete if watched >= 90%
    if (totalSeconds > 0 && watchedSeconds / totalSeconds >= 0.9) {
      await CourseProgress.findOneAndUpdate(
        { userId, courseID: courseId },
        { $addToSet: { completedVideos: subSectionId } }
      );
    }

    return res.status(200).json({ success: true, data: progress });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get last watched position for a video
exports.getVideoProgress = async (req, res) => {
  try {
    const { courseId, subSectionId } = req.query;
    const userId = req.user.id;

    const progress = await VideoProgress.findOne({ userId, subSectionId, courseId });
    return res.status(200).json({ success: true, data: progress || { watchedSeconds: 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get last watched video for a course (resume feature)
exports.getLastWatched = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const lastVideo = await VideoProgress.findOne({ userId, courseId })
      .sort({ updatedAt: -1 })
      .populate("subSectionId", "title videoUrl timeDuration");

    return res.status(200).json({ success: true, data: lastVideo });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
