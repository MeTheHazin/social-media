require("dotenv").config();

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../models/query");
const pool = require("../models/pool");

// Passport Local Strategy — username & password
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      username = username.toLowerCase();
      let user = await db.getUserByUsername(username);
      user = user[0];
      if (!user) {
        return done(null, false, { message: "Username not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Session Handling
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (!rows[0]) {
      return done(null, false); // User not found
    }
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});
