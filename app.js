require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const pool = require("./models/pool");
const pgSession = require("connect-pg-simple")(session);
const db = require("./models/query");

// Passport configuration
require("./middleware/passport-config");

// Routes
const userRoutes = require("./routes/userRouter");
const postsRoute = require("./routes/postsRouter");
const feedRouter = require("./routes/feedRouter");

const app = express();

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup Passport
app.use(
  session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.PASSPORT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// access loged in user

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Use routes

app.use("/", feedRouter);
app.use("/", userRoutes);
app.use("/", postsRoute);

const PORT = 3000;

app.listen(process.env.PORT || PORT, () => {
  console.log(
    `server is up and running well on port: ${process.env.PORT || PORT}`
  );
});
