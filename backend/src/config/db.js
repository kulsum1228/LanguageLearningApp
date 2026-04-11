const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Force UTF8 encoding on every connection
pool.on("connect", (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});

module.exports = pool;
