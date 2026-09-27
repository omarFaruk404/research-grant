SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- 1. Independent Tables
-- --------------------------------------------------------

CREATE TABLE app_setting (
  `key` varchar(100) NOT NULL, -- 'key' is a reserved word
  value text DEFAULT NULL,
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fiscal_year (
  id int(11) NOT NULL AUTO_INCREMENT,
  year_label varchar(20) NOT NULL,
  is_active tinyint(1) DEFAULT 0,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 'user' is a reserved word and MUST have backticks
CREATE TABLE `user` (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(200) NOT NULL,
  phone varchar(50) DEFAULT NULL,
  email varchar(150) NOT NULL,
  password varchar(255) NOT NULL,
  photo varchar(255) DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  role tinyint(4) NOT NULL DEFAULT 2, --1 officer,2 researcher,3 reviewer,4 researcher+reviewer
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Dependencies (Level 1)
-- --------------------------------------------------------
CREATE TABLE faculty (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(150) NOT NULL,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE department (
  id int(11) NOT NULL AUTO_INCREMENT,
  faculty_id int(11) NOT NULL,
  name varchar(150) NOT NULL,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY faculty_id (faculty_id),
  FOREIGN KEY (faculty_id) REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE researcher (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  faculty_id int(11) DEFAULT NULL,
  department_id int(11) DEFAULT NULL,
  designation varchar(150) DEFAULT NULL,
  joining_date date DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY faculty_id (faculty_id),
  KEY department_id (department_id),
  FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty (id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviewer (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  designation varchar(150) DEFAULT NULL,
  department varchar(150) DEFAULT NULL,
  department_id int(11) DEFAULT NULL,
  university varchar(200) DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY department_id (department_id),
  FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




CREATE TABLE circular (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(300) NOT NULL,
  notice_code varchar(80) DEFAULT NULL,
  circular_type enum('notice','proposal','reminder') NOT NULL, -- 'type' is a keyword
  proposal_published_date date DEFAULT NULL,
  proposal_submission_deadline date DEFAULT NULL,
  description text DEFAULT NULL,
  fiscal_year_id int(11) DEFAULT NULL,
  attachment varchar(400) DEFAULT NULL,
  notice_published_date date DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fiscal_year_id (fiscal_year_id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_year (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Personnel
-- --------------------------------------------------------

CREATE TABLE officer (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  faculty_id int(11) DEFAULT NULL,
  department_id int(11) DEFAULT NULL,
  designation varchar(150) DEFAULT NULL,
  joining_date date DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY faculty_id (faculty_id),
  KEY department_id (department_id),
  FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty (id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES department (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- 4. Projects
-- --------------------------------------------------------

CREATE TABLE project (
  id int(11) NOT NULL AUTO_INCREMENT,
  code_no varchar(80) DEFAULT NULL,
  researcher_id int(11) DEFAULT NULL,
  fiscal_year_id int(11) DEFAULT NULL,
  circular_id int(11) DEFAULT NULL,
  title varchar(300) NOT NULL,
  comment text DEFAULT NULL,
  `problem_domain` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`problem_domain`)),
  proposed_budget decimal(14,2) DEFAULT 0.00,
  proposal_submission_date date DEFAULT NULL,
  allocated_budget decimal(14,2) DEFAULT 0.00,
  first_allocation_amount decimal(14,2) DEFAULT 0.00,
  final_report_submission_due_date date DEFAULT NULL,
  status tinyint(4) NOT NULL DEFAULT 1,
  created_at datetime DEFAULT current_timestamp(),
  updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY code_no (code_no),
  KEY status (status),
  KEY fiscal_year_id (fiscal_year_id),
  KEY researcher_id (researcher_id),
  KEY circular_id (circular_id),
  FOREIGN KEY (researcher_id) REFERENCES researcher (id) ON DELETE SET NULL,
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_year (id) ON DELETE SET NULL,
  FOREIGN KEY (circular_id) REFERENCES circular (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Project Meta (Reports, Reviews, Payments)
-- --------------------------------------------------------

CREATE TABLE project_report (
  id int(11) NOT NULL AUTO_INCREMENT,
  project_id int(11) NOT NULL,
  `type` enum('proposal','final_report') NOT NULL, -- 'type' is a keyword
  name varchar(255) DEFAULT NULL,
  url varchar(400) NOT NULL,
  uploaded_by int(11) DEFAULT NULL,
  uploaded_at datetime DEFAULT current_timestamp(),
  status tinyint(4) NOT NULL DEFAULT 1,--1=submitted,2=under review,3=accpeted
  documents longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(documents)),
  submission_date datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY project_id (project_id),
  KEY uploaded_by (uploaded_by),
  FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES `user` (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_review (
  id int(11) NOT NULL AUTO_INCREMENT,
  project_id int(11) NOT NULL,
  reviewer_id int(11) DEFAULT NULL,
  review_type tinyint(4) NOT NULL,
  assigned_by int(11) DEFAULT NULL,
  assigned_at datetime DEFAULT current_timestamp(),
  due_date date DEFAULT NULL,
  submitted_at datetime DEFAULT NULL,
  review_comments text DEFAULT NULL,
  total_marks decimal(6,2) DEFAULT NULL,
  marks_breakdown longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(marks_breakdown)),
  attachment varchar(400) DEFAULT NULL,
  status enum('assigned','submitted') DEFAULT 'assigned',
  PRIMARY KEY (id),
  KEY project_id (project_id),
  KEY reviewer_id (reviewer_id),
  KEY assigned_by (assigned_by),
  FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES reviewer (id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES `user` (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE researcher_payment (
  id int(11) NOT NULL AUTO_INCREMENT,
  researcher_id int(11) DEFAULT NULL,
  project_id int(11) DEFAULT NULL,
  amount decimal(14,2) NOT NULL,
  payment_date date DEFAULT NULL,
  payment_note varchar(255) DEFAULT NULL,
  payment_slot tinyint(4) DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY researcher_id (researcher_id),
  KEY project_id (project_id),
  FOREIGN KEY (researcher_id) REFERENCES researcher (id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviewer_payment (
  id int(11) NOT NULL AUTO_INCREMENT,
  reviewer_id int(11) DEFAULT NULL,
  project_id int(11) DEFAULT NULL,
  payment_type enum('proposal_review','final_report_review') NOT NULL,
  amount decimal(14,2) DEFAULT NULL,
  payment_date date DEFAULT NULL,
  created_at datetime DEFAULT current_timestamp(),
  status tinyint(4) DEFAULT 0,
  PRIMARY KEY (id),
  KEY reviewer_id (reviewer_id),
  KEY project_id (project_id),
  FOREIGN KEY (reviewer_id) REFERENCES reviewer (id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;