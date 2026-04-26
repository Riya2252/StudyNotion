const Anthropic = require("@anthropic-ai/sdk");
const User = require("../models/User");
const Course = require("../models/Course");
const { getOnlineUsers } = require("../config/socket");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.sendAIMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Check if any instructors are currently online for this student
    const user = await User.findById(req.user.id).select("courses accountType firstName lastName");
    let instructorAvailable = false;
    const onlineInstructorNames = [];

    if (user.accountType === "Student" && user.courses?.length > 0) {
      const courses = await Course.find({ _id: { $in: user.courses } })
        .populate("instructor", "firstName lastName _id");
      const onlineUsers = getOnlineUsers();
      courses.forEach((c) => {
        if (c.instructor && onlineUsers.includes(c.instructor._id.toString())) {
          instructorAvailable = true;
          const name = `${c.instructor.firstName} ${c.instructor.lastName}`;
          if (!onlineInstructorNames.includes(name)) onlineInstructorNames.push(name);
        }
      });
    }

    const systemPrompt = `You are StudyBot, a helpful AI assistant for StudyNotion — an online learning platform.
Your role:
- Answer students' course-related questions, explain concepts, and help with learning doubts
- Be concise, friendly, and encouraging
- If a question is very specific to private course content you don't have access to, admit it and suggest asking the instructor directly
- Keep responses short and clear (2-4 sentences max unless a detailed explanation is genuinely needed)

Student name: ${user.firstName} ${user.lastName}
${instructorAvailable
  ? `IMPORTANT: The following instructor(s) are currently ONLINE and available: ${onlineInstructorNames.join(", ")}. Mention this at the end of your response and encourage the student to reach out to them for personalized help.`
  : "No instructors are currently online. Provide the best help you can and let the student know their instructor will be available later."
}`;

    const messages = [
      ...conversationHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message.trim() },
    ];

    const aiResponse = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    return res.status(200).json({
      success: true,
      response: aiResponse.content[0].text,
      instructorAvailable,
      instructorNames: onlineInstructorNames,
    });
  } catch (err) {
    console.error("AI Chat error:", err.status, err.message, err.error);
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ success: false, message: "ANTHROPIC_API_KEY is not set in server/.env" });
    }
    if (err.status === 401) {
      return res.status(500).json({ success: false, message: "Invalid Anthropic API key. Check ANTHROPIC_API_KEY in server/.env" });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "AI assistant is temporarily unavailable. Please try again.",
    });
  }
};
