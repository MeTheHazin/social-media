const { body } = require("express-validator");
const db = require("../models/query");

const signUpValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .custom(async (value) => {
      const user = await db.getUserByUsername(value.toLowerCase());
      if (user.length > 0) {
        throw new Error("Username already taken");
      }
      return true;
    }),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (value) => {
      const user = await db.getUserByEmail(value.toLowerCase());
      if (user.length > 0) {
        throw new Error("Email already registered");
      }
      return true;
    }),

  body("password")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters"),
];

const createPostValidation = [
  body("post")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Post must be between 1 and 300 characters."),
];

module.exports = { signUpValidation, createPostValidation };
