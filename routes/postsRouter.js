const express = require("express");
const postsRouter = express.Router();
const db = require("../models/query");
const {
  isAuth,
  isOwend,
} = require("../middleware/authenticationsAndauthorization");
const { createPostValidation } = require("../middleware/validators");
const { validationResult } = require("express-validator");

// create a post

postsRouter.post(
  "/post/:id/createpost",
  isAuth,
  createPostValidation,
  async (req, res) => {
    const errors = validationResult(req);
    const senderId = parseInt(req.params.id);
    const loggedInId = req.user?.id;

    if (!errors.isEmpty()) {
      return res.status(400).render("index", {
        errors: errors.array(),
        user: req.user,
      });
    }

    if (senderId !== loggedInId) {
      return res
        .status(403)
        .send("You are not authorized to post as this user.");
    }

    try {
      const message = req.body.post;
      await db.createPost(message, senderId);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error while creating post.");
    }
  }
);

// delete a user owned post

postsRouter.post("/post/:postid/delete", isAuth, isOwend, async (req, res) => {
  const postId = parseInt(req.params.postid, 10);

  try {
    await db.deletePostById(postId);
    res.redirect(`/user/${req.user.id}/profile`);
  } catch (err) {
    console.error("Post deletion failed:", err);
    res.status(500).send("Error while deleting the post.");
  }
});

//like and unlike

postsRouter.post("/post/:postId/like", isAuth, async (req, res) => {
  try {
    await db.likePost(req.user.id, req.params.postId);
    const backTo = req.query.redirectTo || "/";
    res.redirect(backTo);
  } catch (err) {
    console.error("Like failed:", err);
    res.status(500).send("Could not like post.");
  }
});

postsRouter.post("/post/:postId/unlike", isAuth, async (req, res) => {
  try {
    await db.unlikePost(req.user.id, req.params.postId);
    const backTo = req.query.redirectTo || "/";
    res.redirect(backTo);
  } catch (err) {
    console.error("Unlike failed:", err);
    res.status(500).send("Could not unlike post.");
  }
});

module.exports = postsRouter;
