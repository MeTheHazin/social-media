const pool = require("./pool");
const bcrypt = require("bcryptjs");

// user models

async function getUserByUsername(username) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username=$1 ", [
    username,
  ]);
  return rows;
}

async function addUser(username, email, password, first_name, last_name, age) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (username, email, password, first_name, last_name, age)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [username, email, hashedPassword, first_name, last_name, age]
  );
}

async function getUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  return rows;
}

async function getUserById(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1 `, [id]);
  return rows;
}

async function searchUsers(query) {
  const { rows } = await pool.query(
    `SELECT id, username, email, first_name, last_name, age 
     FROM users 
     WHERE username ILIKE $1 OR email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1`,
    [`%${query}%`]
  );
  return rows;
}

async function DeleteUserById(userId) {
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
}

// follow table

async function followUser(followerId, followingId) {
  await pool.query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [followerId, followingId]
  );
}

async function unfollowUser(followerId, followingId) {
  await pool.query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
}

async function isFollowing(followerId, followingId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return rows.length > 0;
}

async function getFollowers(userId) {
  const { rows } = await pool.query(
    `SELECT users.id, users.username 
     FROM follows 
     JOIN users ON follows.follower_id = users.id 
     WHERE follows.following_id = $1`,
    [userId]
  );
  return rows;
}

async function getFollowing(userId) {
  const { rows } = await pool.query(
    `SELECT users.id, users.username 
     FROM follows 
     JOIN users ON follows.following_id = users.id 
     WHERE follows.follower_id = $1`,
    [userId]
  );
  return rows;
}

// posts models

async function createPost(message, senderId) {
  await pool.query("INSERT INTO post (message, sender_id) VALUES ($1, $2)", [
    message,
    senderId,
  ]);
}
async function getUserPostsByUserId(sender_id) {
  const { rows } = await pool.query(`SELECT * FROM post WHERE sender_id=$1 `, [
    sender_id,
  ]);
  return rows;
}

async function getFeedPosts(userId) {
  const { rows } = await pool.query(
    `SELECT post.*, users.username 
     FROM post 
     JOIN users ON users.id = post.sender_id
     LEFT JOIN follows ON follows.following_id = post.sender_id
     WHERE post.sender_id = $1 OR follows.follower_id = $1
     ORDER BY post.created_at DESC`,
    [userId]
  );
  return rows;
}

async function deletePostById(postId) {
  await pool.query("DELETE FROM post WHERE id = $1", [postId]);
}

// like functions

async function likePost(userId, postId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, postId]
    );

    if (result.rowCount > 0) {
      await client.query(`UPDATE post SET likes = likes + 1 WHERE id = $1`, [
        postId,
      ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function unlikePost(userId, postId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );
    if (result.rowCount > 0) {
      await client.query(
        `UPDATE post SET likes = GREATEST(0, likes - 1) WHERE id = $1`,
        [postId]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function hasLikedPost(userId, postId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return rows.length > 0;
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  addUser,
  createPost,
  getUserById,
  getUserPostsByUserId,
  searchUsers,
  followUser,
  unfollowUser,
  isFollowing,
  getFeedPosts,
  deletePostById,
  DeleteUserById,
  getFollowers,
  getFollowing,
  likePost,
  unlikePost,
  hasLikedPost,
};
