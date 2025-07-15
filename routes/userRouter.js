const express = require("express");
const db = require("../models/query");
const userRouter = express.Router();
const passport = require("passport");
const { signUpValidation } = require("../middleware/validators");
const { validationResult } = require("express-validator");
const {
  isAuth,
  isOwend,
} = require("../middleware/authenticationsAndauthorization");

const bcrypt = require("bcryptjs");
// sign in logics

userRouter.get("/user/sign-up", async (req, res) => {
  try {
    res.render("sign-up", { errors: [] });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

userRouter.post("/user/sign-up", signUpValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("sign-up", { errors: errors.array() });
  }

  try {
    const { username, email, password, first_name, last_name, age } = req.body;
    await db.addUser(
      username.trim().toLowerCase(),
      email.trim().toLowerCase(),
      password.trim(),
      first_name.trim().toLowerCase(),
      last_name.trim().toLowerCase(),
      age
    );
    res.redirect("/user/log-in?success=1");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// log in logics

userRouter.get("/user/log-in", (req, res) => {
  try {
    const showSuccess = req.query.success === "1";
    const showFailure = req.query.failure === "1";
    res.render("log-in", { showSuccess, showFailure });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

userRouter.post(
  "/user/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/log-in?failure=1",
  })
);

// log out

userRouter.post("/user/log-out", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//user profile

userRouter.get("/user/:id/profile", isAuth, async (req, res) => {
  try {
    let user = await db.getUserById(req.params.id);
    user = user[0];
    console.log(user);

    if (!user) {
      res.status(404).send("user not found comrade");
    } else {
      let isFollowing = false;
      if (req.user.id !== user.id) {
        isFollowing = await db.isFollowing(req.user.id, user.id);
      }

      let userPosts = await db.getUserPostsByUserId(req.params.id);
      console.log(userPosts);

      res.render("profile", {
        user,
        userPosts,
        loggedInUser: req.user,
        isFollowing,
        originalUrl: req.originalUrl,
      });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// searching for users

userRouter.get("/user/search", isAuth, async (req, res) => {
  const query = req.query.q;

  try {
    const results = await db.searchUsers(query);
    res.render("searchResults", { results, query });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).send("Something went wrong with the search");
  }
});

// follow logics

userRouter.post("/user/:id/follow", isAuth, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id, 10);

  if (followerId === followingId) {
    return res.status(400).send("You can't follow yourself, comrade.");
  }

  try {
    await db.followUser(followerId, followingId);
    res.redirect(`/user/${followingId}/profile`);
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).send("Could not follow user.");
  }
});

// unfollow logics

userRouter.post("/user/:id/unfollow", isAuth, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id, 10);

  try {
    await db.unfollowUser(followerId, followingId);
    res.redirect(`/user/${followingId}/profile`);
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).send("Could not unfollow user.");
  }
});

// delete user with all relations

userRouter.post("/user/:id/delete", isAuth, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    // Delete user from database
    await db.DeleteUserById(userId);
    // Destroy session so the user is fully logged out
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Error during logout.");
      }

      req.session.destroy(() => {
        res.redirect("/"); // Redirect to homepage after deletion
      });
    });
  } catch (err) {
    console.error("User deletion error:", err);
    res.status(500).send("Error deleting user.");
  }
});

// access all following and followers

userRouter.get("/user/:id/followers", isAuth, async (req, res) => {
  try {
    const followers = await db.getFollowers(req.params.id);
    res.render("followList", {
      users: followers,
      title: "Followers",
    });
  } catch (err) {
    console.error("Get followers error:", err);
    res.status(500).send("Couldn't fetch followers.");
  }
});

userRouter.get("/user/:id/following", isAuth, async (req, res) => {
  try {
    const following = await db.getFollowing(req.params.id);
    res.render("followList", {
      users: following,
      title: "Following",
    });
  } catch (err) {
    console.error("Get following error:", err);
    res.status(500).send("Couldn't fetch following.");
  }
});

// edithe profile data

userRouter.get("/user/:id/edit", isAuth, async (req, res) => {
  try {
    const user = (await db.getUserById(req.params.id))[0];
    if (req.user.id !== user.id) return res.status(403).send("Access denied.");

    res.render("editProfile", { user, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form.");
  }
});

// userRouter.post(
//   "/user/:id/edit",
//   isAuth,
//   signUpValidation,
//   async (req, res) => {
//     console.log("🔧 POST /user/:id/edit triggered");
//     console.log("req.body:", req.body);

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const user = (await db.getUserById(req.params.id))[0];
//       return res
//         .status(400)
//         .render("editProfile", { user, errors: errors.array() });
//     }

//     try {
//       const { username, email, password, first_name, last_name, age } =
//         req.body;

//       let hashedPassword = null;
//       if (password && password.trim() !== "") {
//         hashedPassword = await bcrypt.hash(password.trim(), 10);
//       }

//       if (req.user.id !== parseInt(req.params.id, 10))
//         return res.status(403).send("Unauthorized.");

//       await db.updateUserById(req.params.id, {
//         username: username.trim().toLowerCase(),
//         email: email.trim().toLowerCase(),
//         password: hashedPassword ? hashedPassword.trim() : null,
//         first_name: first_name.trim().toLowerCase(),
//         last_name: last_name.trim().toLowerCase(),
//         age: parseInt(age, 10),
//       });
//       console.log("User updated successfully");

//       res.send("Profile updated! Redirect would normally go here.");
//     } catch (err) {
//       console.error("Update error:", err);
//       res.status(500).send("Could not update user.");
//     }
//   }
// );

userRouter.post(
  "/user/:id/edit",
  isAuth,
  signUpValidation,
  async (req, res) => {
    console.log("🔧 POST /user/:id/edit triggered");
    console.log("req.body:", req.body);

    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const user = (await db.getUserById(req.params.id))[0];
      return res
        .status(400)
        .render("editProfile", { user, errors: errors.array() });
    }

    try {
      const { username, email, password, first_name, last_name, age } =
        req.body;

      // Ownership check
      const userId = parseInt(req.params.id, 10);
      if (req.user.id !== userId) {
        return res.status(403).send("Unauthorized.");
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password.trim(), 10);
      }

      // Call DB update method
      await db.updateUserById(userId, {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: hashedPassword || "", // Keep existing password if field left blank
        first_name: first_name.trim().toLowerCase(),
        last_name: last_name.trim().toLowerCase(),
        age: parseInt(age, 10),
      });

      console.log("✅ User updated successfully");

      // Refresh session with updated user info
      const updatedUser = (await db.getUserById(userId))[0];
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("🚨 Re-login error:", err);
          return res.status(500).send("Session refresh failed.");
        }
        res.redirect(`/user/${userId}/profile`);
      });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).send("Could not update user.");
    }
  }
);

module.exports = userRouter;
