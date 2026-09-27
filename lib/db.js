// lib/db.js
import mysql from "mysql2/promise";

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};



let pool; // cache the pool globally

export async function initDB() {
  // create a one-time connection just to init the schema
  const connection = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    multipleStatements: true,
  });

  await connection.query(INIT_SQL);
  console.log("✅ Database initialized");
  await connection.end();
}

// Singleton pool getter
export function getDB() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
    console.log("✅ MySQL pool created");
  }
  return pool;
}
