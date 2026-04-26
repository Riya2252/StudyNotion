const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { saveVideoProgress, getVideoProgress, getLastWatched } = require("../controllers/VideoProgress");

router.use(auth);

router.post("/save", saveVideoProgress);
router.get("/get", getVideoProgress);
router.get("/last-watched/:courseId", getLastWatched);

module.exports = router;
