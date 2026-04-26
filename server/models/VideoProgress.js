const mongoose = require("mongoose");

const videoProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subSectionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection", required: true },
    watchedSeconds: { type: Number, default: 0 },
    totalSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoProgressSchema.index({ userId: 1, subSectionId: 1 }, { unique: true });

module.exports = mongoose.model("VideoProgress", videoProgressSchema);
