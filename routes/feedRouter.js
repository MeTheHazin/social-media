const express = require("express");
const feedRouter = express.Router();
const db = require("../models/query");
const { isAuth } = require("../middleware/authenticationsAndauthorization");
const { createPostValidation } = require("../middleware/validators");
const { validationResult } = require("express-validator");

feedRouter.get("/", async (req, res) => {
  try {
    let posts = [];

    if (req.user) {
      posts = await db.getFeedPosts(req.user.id);

      // enrich posts with like status
      for (let post of posts) {
        post.hasLiked = await db.hasLikedPost(req.user.id, post.id);
      }
    }

    res.render("index", { user: req.user || null, posts });
  } catch (err) {
    console.error("Feed loading error:", err);
    res.status(500).send("Server error while loading the main page.");
  }
});

module.exports = feedRouter;
