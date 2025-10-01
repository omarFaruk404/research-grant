// lib/db.js
import mysql from "mysql2/promise";

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "research_grant_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const INIT_SQL = `
CREATE DATABASE IF NOT EXISTS research_grant_db;
USE research_grant_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('researcher', 'officer', 'reviewer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  researcher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_funds DECIMAL(12,2) NOT NULL,
  status ENUM('submitted', 'under_review', 'reviewed', 'approved', 'rejected', 'funded') DEFAULT 'submitted',
  assigned_reviewer_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (researcher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL UNIQUE,
  reviewer_id INT NOT NULL,
  feasibility_score INT CHECK(feasibility_score BETWEEN 0 AND 20),
  impact_score INT CHECK(impact_score BETWEEN 0 AND 20),
  importance_score INT CHECK(importance_score BETWEEN 0 AND 20),
  innovation_score INT CHECK(innovation_score BETWEEN 0 AND 20),
  completeness_score INT CHECK(completeness_score BETWEEN 0 AND 20),
  total_score INT GENERATED ALWAYS AS (
      feasibility_score + impact_score + importance_score + innovation_score + completeness_score
  ) STORED,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS funding_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL UNIQUE,
  officer_id INT NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

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
