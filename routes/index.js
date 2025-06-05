const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const commentPath = path.join(__dirname, "../public/data/comments/comments.json");

// Đọc danh sách bình luận
router.get("/comment", (req, res) => {
  fs.readFile(commentPath, "utf8", (err, data) => {
    if (err) return res.json([]);
    try {
      const messages = JSON.parse(data);
      res.json(messages);
    } catch {
      res.json([]);
    }
  });
});

// Lưu bình luận mới
router.post("/comment", express.json(), (req, res) => {
  const newMessage = req.body.message;
  fs.readFile(commentPath, "utf8", (err, data) => {
    let messages = [];
    if (!err) {
      try {
        messages = JSON.parse(data);
      } catch {}
    }
    messages.push(newMessage);
    fs.writeFile(commentPath, JSON.stringify(messages, null, 2), () => {
      res.sendStatus(200);
    });
  });
});

module.exports = router;
