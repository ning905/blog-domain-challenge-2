const express = require("express");
const {
  getPosts,
  createComment,
  createReplyComment,
  updateComment,
  deleteComment,
} = require("../controllers/post");
const router = express.Router();

router.get("/", getPosts);
router.post("/:postId/comments", createComment);
router.post("/:postId/comments/:commentId", createReplyComment);
router.put("/:postId/comments/:commentId", updateComment);
router.delete("/:postId/comments/:commentId", deleteComment);

module.exports = router;
