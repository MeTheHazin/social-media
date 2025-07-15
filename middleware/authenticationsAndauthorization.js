const pool = require("../models/pool");

async function isOwend(req, res, next) {
  const postId = req.params.postid;
  const userId = req.user?.id;

  try {
    const { rows } = await pool.query(
      "SELECT sender_id FROM post WHERE id = $1",
      [postId]
    );
    const post = rows[0];

    if (!post) {
      return res.status(404).send("Post not found.");
    }

    if (post.sender_id !== userId) {
      return res
        .status(403)
        .send("You are not authorized to modify this post.");
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
}

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("You must be logged in to access this route.");
}

module.exports = { isOwend, isAuth };
