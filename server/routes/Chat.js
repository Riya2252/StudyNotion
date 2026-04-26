const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getChatContacts, getChatHistory, getUnreadCount, getRoomId } = require("../controllers/Chat");
const { sendAIMessage } = require("../controllers/AIChat");

router.use(auth);

router.get("/contacts", getChatContacts);
router.get("/history/:roomId", getChatHistory);
router.get("/unread-count", getUnreadCount);
router.get("/room/:otherUserId", getRoomId);
router.post("/ai", sendAIMessage);

module.exports = router;
