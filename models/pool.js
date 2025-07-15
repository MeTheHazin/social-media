require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});

module.exports = pool;
