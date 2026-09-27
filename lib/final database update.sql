-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2026 at 07:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rpgbuac_research_project_grant`
--

-- --------------------------------------------------------

--
-- Table structure for table `app_setting`
--

CREATE TABLE `app_setting` (
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `circular`
--

CREATE TABLE `circular` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `notice_code` varchar(80) DEFAULT NULL,
  `circular_type` enum('notice','proposal','reminder') NOT NULL,
  `proposal_published_date` date DEFAULT NULL,
  `proposal_submission_deadline` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `fiscal_year_id` int(11) DEFAULT NULL,
  `attachment` varchar(400) DEFAULT NULL,
  `notice_published_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `circular`
--

INSERT INTO `circular` (`id`, `title`, `notice_code`, `circular_type`, `proposal_published_date`, `proposal_submission_deadline`, `description`, `fiscal_year_id`, `attachment`, `notice_published_date`, `created_at`) VALUES
(1, 'Call for research on health', 'BU-2401', 'proposal', NULL, '2026-01-31', 'This is a test', 1, NULL, '2026-01-23', '2026-01-22 21:30:57'),
(3, 'Call for research', 'BU-2405', 'proposal', NULL, '2026-02-27', 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?', 1, '/uploads/circular/1769680673431_proposal_test_to_edit_for_researcherrrs_1769527820149.docx', '2026-01-28', '2026-01-29 15:57:53');

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, 'Computer Science & Engineering', '2026-01-22 20:22:34', '2026-01-30 23:41:04'),
(2, 1, 'Physics', '2026-01-28 23:07:06', '2026-01-30 23:41:09');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Faculty of Science', '2026-01-22 20:22:34', '2026-01-22 20:22:34');

-- --------------------------------------------------------

--
-- Table structure for table `fiscal_year`
--

CREATE TABLE `fiscal_year` (
  `id` int(11) NOT NULL,
  `year_label` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fiscal_year`
--

INSERT INTO `fiscal_year` (`id`, `year_label`, `is_active`, `created_at`) VALUES
(1, '2025-2026', 1, '2026-01-22 21:18:43'),
(2, '2023-2024', 1, '2026-01-23 00:40:07'),
(3, '2024-2025', 1, '2026-01-28 20:55:48');

-- --------------------------------------------------------

--
-- Table structure for table `officer`
--

CREATE TABLE `officer` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `officer`
--

INSERT INTO `officer` (`id`, `user_id`, `faculty_id`, `department_id`, `designation`, `joining_date`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Senior Administrative Officer', '2024-01-01', '2026-01-22 20:22:34', '2026-01-22 20:22:34');

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `code_no` varchar(80) DEFAULT NULL,
  `researcher_id` int(11) DEFAULT NULL,
  `fiscal_year_id` int(11) DEFAULT NULL,
  `circular_id` int(11) DEFAULT NULL,
  `title` varchar(300) NOT NULL,
  `abstract` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `problem_domain` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`problem_domain`)),
  `proposed_budget` decimal(14,2) DEFAULT 0.00,
  `proposal_submission_date` date DEFAULT NULL,
  `allocated_budget` decimal(14,2) DEFAULT 0.00,
  `first_allocation_amount` decimal(14,2) DEFAULT 0.00,
  `final_report_submission_due_date` date DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_reminder_sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`id`, `code_no`, `researcher_id`, `fiscal_year_id`, `circular_id`, `title`, `abstract`, `comment`, `problem_domain`, `proposed_budget`, `proposal_submission_date`, `allocated_budget`, `first_allocation_amount`, `final_report_submission_due_date`, `status`, `created_at`, `updated_at`, `last_reminder_sent_at`) VALUES
(4, 'PROJ-123149', 1, 1, 1, 'Report review test reviewer 3', 'dsfsdf', NULL, '[\"health\"]', 100000.00, '2026-01-23', 1000.00, 0.00, NULL, 4, '2026-01-23 18:24:10', '2026-01-23 23:44:06', NULL),
(5, 'PROJ-123151', 1, 1, 1, 'report upload test 1', 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.  Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.  Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.', NULL, '[\"asfaf\"]', 100000.00, '2026-01-23', 1000.00, 0.00, NULL, 5, '2026-01-23 18:40:36', '2026-01-24 00:48:59', NULL),
(6, 'RES-2024-001', 1, 1, 1, 'AI-Based Traffic Control System for Dhaka City', NULL, 'Highly relevant for urban planning.', '{\"sector\": \"Transportation\", \"focus\": \"Traffic Congestion\", \"methodology\": \"Computer Vision\"}', 600000.00, '2023-01-15', 500000.00, 250000.00, '2024-06-30', 3, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(7, 'RES-2024-002', 1, 1, 1, 'Sustainable Water Purification Using Local Materials', NULL, 'Pilot study required.', '{\"sector\": \"Environment\", \"focus\": \"Water Safety\", \"methodology\": \"Filtration Analysis\"}', 800000.00, '2023-02-10', 750000.00, 300000.00, '2024-07-15', 3, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(8, 'RES-2025-003', 1, 2, NULL, 'Blockchain for Land Registry in Bangladesh', NULL, NULL, '{\"sector\": \"Governance\", \"focus\": \"Transparency\", \"methodology\": \"Smart Contracts\"}', 450000.00, '2024-01-20', 0.00, 0.00, NULL, 1, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(9, 'RES-2025-004', 1, 2, NULL, 'Impact of Climate Change on Coastal Agriculture', NULL, 'Reviewer assigned.', '{\"sector\": \"Agriculture\", \"focus\": \"Climate Resilience\", \"methodology\": \"Field Survey\"}', 550000.00, '2024-02-05', 0.00, 0.00, NULL, 2, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(10, 'RES-2023-005', 1, 1, 1, 'E-Learning Adoption Rates in Rural Areas', NULL, 'Final report accepted.', '{\"sector\": \"Education\", \"focus\": \"Digital Literacy\", \"methodology\": \"Survey Analysis\"}', 300000.00, '2022-11-10', 300000.00, 150000.00, '2023-12-31', 5, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(11, 'RES-2025-006', 1, 2, NULL, 'Perpetual Motion Energy Generator', NULL, 'Scientifically invalid proposal.', '{\"sector\": \"Energy\", \"focus\": \"Free Energy\", \"methodology\": \"Theoretical\"}', 1000000.00, '2024-03-01', 0.00, 0.00, NULL, 0, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(12, 'RES-2024-007', 1, 1, 1, 'Genomic Sequencing of Local Rice Varieties', NULL, 'Waiting for final evaluation.', '{\"sector\": \"Biotech\", \"focus\": \"Food Security\", \"methodology\": \"DNA Sequencing\"}', 1200000.00, '2023-03-15', 1000000.00, 500000.00, '2024-05-30', 4, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(13, 'RES-2024-008', 1, 1, 1, 'Cybersecurity Threats in Mobile Banking', NULL, NULL, '{\"sector\": \"Finance\", \"focus\": \"Security\", \"methodology\": \"Penetration Testing\"}', 700000.00, '2023-04-20', 650000.00, 325000.00, '2024-08-20', 3, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(14, 'RES-2025-009', 1, 2, NULL, 'IoT Based Smart Home Automation', NULL, NULL, '{\"sector\": \"Technology\", \"focus\": \"IoT\", \"methodology\": \"Prototype Development\"}', 350000.00, '2024-05-10', 0.00, 0.00, NULL, 4, '2026-01-23 22:39:03', '2026-01-31 21:55:11', NULL),
(15, 'RES-2025-010', 1, 2, NULL, 'Mental Health Assessment of University Students', NULL, 'Pending ethical clearance check.', '{\"sector\": \"Health\", \"focus\": \"Mental Well-being\", \"methodology\": \"Psychometric Testing\"}', 250000.00, '2024-05-15', 0.00, 0.00, NULL, 2, '2026-01-23 22:39:03', '2026-01-23 22:39:03', NULL),
(16, 'RES-2023-011', 1, 1, 1, 'Renewable Energy Integration in Rural Grids', NULL, 'Successfully implemented pilot in 3 villages.', '{\"sector\": \"Energy\", \"focus\": \"Solar Power\", \"methodology\": \"Microgrid Simulation\"}', 950000.00, '2022-09-10', 900000.00, 450000.00, '2023-11-30', 5, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(17, 'RES-2024-012', 1, 1, 1, 'Machine Learning for Early Cancer Detection', NULL, 'Data collection phase ongoing.', '{\"sector\": \"Healthcare\", \"focus\": \"Diagnostics\", \"methodology\": \"Deep Learning\"}', 1500000.00, '2023-06-25', 1200000.00, 600000.00, '2024-12-31', 4, '2026-01-23 22:39:50', '2026-01-26 00:13:03', NULL),
(19, 'RES-2025-014', 1, 2, NULL, 'Smart Waste Management System for Municipalities', NULL, 'Feasibility study pending review.', '{\"sector\": \"Urban Planning\", \"focus\": \"Waste Management\", \"methodology\": \"IoT Sensors\"}', 400000.00, '2024-03-10', 0.00, 0.00, NULL, 3, '2026-01-23 22:39:50', '2026-01-24 21:27:15', NULL),
(20, 'RES-2025-015', 1, 2, NULL, 'Telepathic Communication Device Prototype', NULL, 'Lacks scientific basis.', '{\"sector\": \"Pseudoscience\", \"focus\": \"Communication\", \"methodology\": \"Speculative\"}', 2000000.00, '2024-04-05', 0.00, 0.00, NULL, 0, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(21, 'RES-2024-016', 1, 1, 1, 'Effectiveness of Online Education During Pandemic', NULL, 'Final report submitted for evaluation.', '{\"sector\": \"Education\", \"focus\": \"Remote Learning\", \"methodology\": \"Statistical Survey\"}', 250000.00, '2023-02-20', 250000.00, 125000.00, '2024-04-30', 4, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(22, 'RES-2024-017', 1, 1, 1, 'Preservation of Endangered Bengal Tiger Habitat', NULL, NULL, '{\"sector\": \"Wildlife Conservation\", \"focus\": \"Biodiversity\", \"methodology\": \"Satellite Tracking\"}', 1800000.00, '2023-05-15', 1500000.00, 750000.00, '2025-06-30', 3, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(23, 'RES-2025-018', 1, 2, NULL, 'Augmented Reality for Historical Site Tourism', NULL, NULL, '{\"sector\": \"Tourism\", \"focus\": \"Digital Heritage\", \"methodology\": \"AR App Development\"}', 600000.00, '2024-06-01', 0.00, 0.00, NULL, 1, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(24, 'RES-2025-019', 1, 2, NULL, 'Low-Cost Arsenic Filtration for Rural Wells', NULL, 'Technical review committee assigned.', '{\"sector\": \"Public Health\", \"focus\": \"Water Quality\", \"methodology\": \"Chemical Filtration\"}', 350000.00, '2024-06-15', 0.00, 0.00, NULL, 2, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(25, 'RES-2023-020', 1, 1, 1, 'Impact of Microfinance on Rural Women Empowerment', NULL, 'Published in Q1 journal.', '{\"sector\": \"Economics\", \"focus\": \"Poverty Alleviation\", \"methodology\": \"Impact Assessment\"}', 300000.00, '2022-08-05', 300000.00, 150000.00, '2023-10-15', 5, '2026-01-23 22:39:50', '2026-01-23 22:39:50', NULL),
(26, 'PROJ 2314124', 1, 1, 1, 'Test to edit final report review', 'lorem ipsum', NULL, '[\"test\"]', 100000.00, '2026-01-24', 10000.00, 0.00, NULL, 4, '2026-01-24 22:19:01', '2026-01-24 22:43:13', NULL),
(27, 'safsawfa', 1, 1, 1, 'reviewer payment test', 'af', NULL, '[\"test\"]', 10000.00, '2026-01-24', 100.00, 0.00, NULL, 5, '2026-01-24 23:33:45', '2026-01-25 23:55:29', NULL),
(29, 'asfafs', 1, 1, 1, 'This is test the security of the app.', '', NULL, '[\"test\"]', 10000.00, '2026-01-25', 0.00, 0.00, NULL, 4, '2026-01-25 17:36:44', '2026-01-26 00:24:34', NULL),
(30, 'i788jgj', 1, 1, 1, 'Checking status', '', NULL, '[\"test\"]', 10000.00, '2026-01-25', 0.00, 0.00, NULL, 2, '2026-01-25 23:32:23', '2026-01-25 23:32:53', NULL),
(31, '2343124', 1, 1, 1, '2 no test', 'lorem ipsum', NULL, '[\"test\"]', 1000.00, '2026-01-25', 0.00, 0.00, NULL, 2, '2026-01-25 23:36:06', '2026-01-31 00:49:55', NULL),
(32, 'asfafasf', 1, 1, 1, '******TEst for report', 'hola', NULL, '[\"tst\"]', 1000.00, '2026-01-26', 0.00, 0.00, NULL, 4, '2026-01-26 00:37:46', '2026-01-27 17:30:50', NULL),
(33, 'affwwwww', 1, 1, 1, 'Final report submit test', '', NULL, '[\"test\"]', 10.00, '2026-01-26', 100000.00, 50000.00, NULL, 3, '2026-01-26 01:05:51', '2026-01-27 23:52:20', NULL),
(34, '12345678', 1, 1, 1, 'test for researcher', 'hello 12345678', NULL, '[\"health\"]', 10000.00, '2026-01-27', 0.00, 0.00, NULL, 0, '2026-01-27 16:20:18', '2026-01-27 17:37:49', NULL),
(35, '3456789', 1, 1, 1, 'rejection test', 'ggh', NULL, '[\"test\"]', 123456.00, '2026-01-27', 0.00, 0.00, NULL, 4, '2026-01-27 19:05:59', '2026-01-27 19:07:41', NULL),
(37, '12345678456', 1, 1, 1, 'Test to edit for researcherrrs', 'hellllllllllllllllo', NULL, '[\"test\"]', 23456.00, '2026-01-27', 0.00, 0.00, NULL, 4, '2026-01-27 20:36:10', '2026-01-28 00:35:07', NULL),
(38, '67', 1, 1, 1, 'create test researcher', 'Lorem Ipsum\n\nKeywords: test, hello', NULL, NULL, 7409.99, '2026-01-27', 0.00, 0.00, NULL, 3, '2026-01-27 23:02:54', '2026-01-30 01:05:28', NULL),
(39, '1234576', 1, 1, 3, 'Test for duplication', '11111123', NULL, '[\"test\",\"duplicate\"]', 1000.00, '2026-01-30', 0.00, 0.00, NULL, 3, '2026-01-30 01:11:48', '2026-01-30 01:18:32', NULL),
(40, '23456654', 1, 1, 1, '2 no duplication test', '11123456', NULL, '[\"duplicate\"]', 10000.00, '2026-01-30', 10000.00, 0.00, NULL, 4, '2026-01-30 01:20:59', '2026-01-31 01:10:24', NULL),
(41, 'BU 2024 01adadete', 5, 1, 1, 'test for email', '12345', NULL, '[\"test\"]', 10000.00, '2026-01-31', 100000.00, 0.00, NULL, 4, '2026-01-31 21:01:05', '2026-01-31 23:18:07', NULL),
(42, '7654235', 5, 1, 1, 'Notification test 2', 'Lorem Ipsum\n\nKeywords: test', NULL, NULL, 50000.00, '2026-01-31', 10000.00, 0.00, NULL, 4, '2026-01-31 21:10:43', '2026-02-03 11:54:04', '2026-02-03 11:54:04'),
(43, '12345', 1, 1, 1, 'test for review reminder', '12345', NULL, '[\"test\"]', 1000.00, '2026-01-31', 0.00, 0.00, NULL, 4, '2026-01-31 23:58:50', '2026-02-01 21:57:02', '2026-02-01 21:57:02'),
(44, '8763567', 1, 1, 1, 'new project', '1234', NULL, '[\"101\"]', 10000.00, '2026-02-02', 0.00, 0.00, NULL, 2, '2026-02-02 00:41:55', '2026-02-02 00:44:18', NULL),
(46, NULL, 1, 1, 3, 'External reviewer', '23456\n\nKeywords: 234', NULL, NULL, 1234.00, '2026-02-02', 0.00, 0.00, NULL, 4, '2026-02-02 22:14:37', '2026-02-02 22:36:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_report`
--

CREATE TABLE `project_report` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `type` enum('proposal','final_report') NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `url` varchar(400) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `submission_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_report`
--

INSERT INTO `project_report` (`id`, `project_id`, `type`, `name`, `url`, `uploaded_by`, `uploaded_at`, `status`, `documents`, `submission_date`) VALUES
(3, 4, 'final_report', NULL, '', 1, '2026-01-23 18:25:39', 3, '[{\"name\":\"finalreport_report_review_test_reviewer_3_2026-01-23_1769171139491_iconfinder_cloudserver_4417106_116641.png\",\"url\":\"/uploads/projects/finalreport_report_review_test_reviewer_3_2026-01-23_1769171139491_iconfinder_cloudserver_4417106_116641.png\"}]', '2026-01-23 18:25:39'),
(4, 4, 'final_report', NULL, '', 1, '2026-01-23 18:31:42', 4, '[{\"name\":\"finalreport_report_review_test_reviewer_3_2026-01-23_1769171502820_photo_2026_01_20_15_21_37.jpg\",\"url\":\"/uploads/projects/finalreport_report_review_test_reviewer_3_2026-01-23_1769171502820_photo_2026_01_20_15_21_37.jpg\"}]', '2026-01-23 18:31:42'),
(5, 5, 'final_report', NULL, '', 1, '2026-01-23 18:49:54', 3, '[{\"name\":\"finalreport_report_upload_test_1_2026-01-23_1769172594500_iconfinder_cloudserver_4417106_116641.png\",\"url\":\"/uploads/projects/finalreport_report_upload_test_1_2026-01-23_1769172594500_iconfinder_cloudserver_4417106_116641.png\"}]', '2026-01-23 18:49:54'),
(6, 26, 'proposal', NULL, '', NULL, '2026-01-24 22:19:01', 3, '[{\"name\":\"Gemini_Generated_Image_b4wyoyb4wyoyb4wy.webp\",\"filename\":\"proposal_26_test_to_edit_final_report_revi_2026-01-24_1.webp\",\"url\":\"/uploads/projects/proposal_26_test_to_edit_final_report_revi_2026-01-24_1.webp\"},{\"name\":\"for omni.png\",\"filename\":\"proposal_26_test_to_edit_final_report_revi_2026-01-24_2.png\",\"url\":\"/uploads/projects/proposal_26_test_to_edit_final_report_revi_2026-01-24_2.png\"},{\"name\":\"for omni.jpeg\",\"filename\":\"proposal_26_test_to_edit_final_report_revi_2026-01-24_3.jpeg\",\"url\":\"/uploads/projects/proposal_26_test_to_edit_final_report_revi_2026-01-24_3.jpeg\"}]', '2026-01-24 22:19:01'),
(7, 26, 'final_report', NULL, '', 1, '2026-01-24 22:33:20', 3, '[{\"name\":\"finalreport_test_to_edit_final_report_review_2026-01-24_1769272400393_gemini_generated_image_b4wyoyb4wyoyb4wy.webp\",\"url\":\"/uploads/projects/finalreport_test_to_edit_final_report_review_2026-01-24_1769272400393_gemini_generated_image_b4wyoyb4wyoyb4wy.webp\"}]', '2026-01-24 22:33:20'),
(8, 26, 'final_report', NULL, '', 1, '2026-01-24 22:43:13', 3, '[{\"name\":\"finalreport_test_to_edit_final_report_review_2026-01-24_1769272993752_for_omni.jpeg\",\"url\":\"/uploads/projects/finalreport_test_to_edit_final_report_review_2026-01-24_1769272993752_for_omni.jpeg\"}]', '2026-01-24 22:43:13'),
(9, 27, 'final_report', NULL, '', 1, '2026-01-24 23:44:21', 3, '[{\"name\":\"finalreport_reviewer_payment_test_2026-01-24_1769276661457_for_omni.png\",\"url\":\"/uploads/projects/finalreport_reviewer_payment_test_2026-01-24_1769276661457_for_omni.png\"}]', '2026-01-24 23:44:21'),
(11, 31, 'proposal', NULL, '', NULL, '2026-01-25 23:36:06', 1, '[{\"name\":\"Gemini_Generated_Image_b4wyoyb4wyoyb4wy.webp\",\"filename\":\"proposal_31_2_no_test_2026-01-25_1.webp\",\"url\":\"/uploads/projects/proposal_31_2_no_test_2026-01-25_1.webp\"},{\"name\":\"for omni.png\",\"filename\":\"proposal_31_2_no_test_2026-01-25_2.png\",\"url\":\"/uploads/projects/proposal_31_2_no_test_2026-01-25_2.png\"}]', '2026-01-25 23:36:06'),
(12, 17, 'final_report', NULL, '', 1, '2026-01-26 00:13:03', 3, '[{\"name\":\"finalreport_machine_learning_for_early_cancer_detection_2026-01-25_1769364783658_console_export_2026_1_25_23_49_0.log\",\"url\":\"/uploads/projects/finalreport_machine_learning_for_early_cancer_detection_2026-01-25_1769364783658_console_export_2026_1_25_23_49_0.log\"}]', '2026-01-26 00:13:03'),
(13, 29, 'final_report', NULL, '', 1, '2026-01-26 00:24:34', 3, '[{\"name\":\"finalreport_this_is_test_the_security_of_the_app_2026-01-25_1769365474516_console_export_2026_1_25_23_49_0.log\",\"url\":\"/uploads/projects/finalreport_this_is_test_the_security_of_the_app_2026-01-25_1769365474516_console_export_2026_1_25_23_49_0.log\"}]', '2026-01-26 00:24:34'),
(18, 34, 'proposal', NULL, '', NULL, '2026-01-27 16:20:18', 1, '[{\"name\":\"message .jpg\",\"filename\":\"proposal_34_test_for_researcher_2026-01-27_1.jpg\",\"url\":\"/uploads/projects/proposal_34_test_for_researcher_2026-01-27_1.jpg\"},{\"name\":\"console-export-2026-1-25_23-49-0.log\",\"filename\":\"proposal_34_test_for_researcher_2026-01-27_2.log\",\"url\":\"/uploads/projects/proposal_34_test_for_researcher_2026-01-27_2.log\"}]', '2026-01-27 16:20:18'),
(19, 32, 'final_report', NULL, '', 1, '2026-01-27 17:30:05', 4, '[{\"name\":\"finalreport_test_for_report_2026-01-27_1769513450780_unzip_log.txt\",\"url\":\"/uploads/projects/finalreport_test_for_report_2026-01-27_1769513450780_unzip_log.txt\"}]', '2026-01-27 17:30:05'),
(20, 35, 'proposal', NULL, '', NULL, '2026-01-27 19:05:59', 4, '[{\"name\":\"message .jpg\",\"filename\":\"proposal_35_rejection_test_2026-01-27_1.jpg\",\"url\":\"/uploads/projects/proposal_35_rejection_test_2026-01-27_1.jpg\"},{\"name\":\"console-export-2026-1-25_23-49-0.log\",\"filename\":\"proposal_35_rejection_test_2026-01-27_2.log\",\"url\":\"/uploads/projects/proposal_35_rejection_test_2026-01-27_2.log\"},{\"name\":\"assignment cover photo.docx\",\"filename\":\"proposal_35_rejection_test_2026-01-27_3.docx\",\"url\":\"/uploads/projects/proposal_35_rejection_test_2026-01-27_3.docx\"}]', '2026-01-27 19:05:59'),
(21, 35, 'final_report', NULL, '', 1, '2026-01-27 19:07:41', 4, '[{\"name\":\"finalreport_rejection_test_2026-01-27_1769519261314_unzip_log.txt\",\"url\":\"/uploads/projects/finalreport_rejection_test_2026-01-27_1769519261314_unzip_log.txt\"}]', '2026-01-27 19:07:41'),
(22, 37, 'proposal', NULL, '', NULL, '2026-01-27 22:14:13', 3, '[{\"name\":\"The Hacker Who Tried to Free the Internet.docx\",\"url\":\"/uploads/proposals/proposal_test_to_edit_for_researcherrrs_1769527820149.docx\",\"uploaded_at\":\"2026-01-27T15:30:20.150Z\"},{\"name\":\"29_22CSE018_Numeric Differentiation_Solve.pdf\",\"url\":\"/uploads/proposals/proposal_test_to_edit_for_researcherrrs_1769530453579_210.pdf\",\"uploaded_at\":\"2026-01-27T16:14:13.580Z\"},{\"name\":\"_4845bbd36b5a8cd5a47b.pdf\",\"url\":\"/uploads/proposals/proposal_test_to_edit_for_researcherrrs_1769530453580_552.pdf\",\"uploaded_at\":\"2026-01-27T16:14:13.581Z\"},{\"name\":\"Cover page accounting.pdf\",\"url\":\"/uploads/proposals/proposal_test_to_edit_for_researcherrrs_1769530453581_517.pdf\",\"uploaded_at\":\"2026-01-27T16:14:13.582Z\"}]', '2026-01-27 20:36:10'),
(23, 37, 'final_report', NULL, '', 2, '2026-01-27 22:30:15', 3, '[{\"name\":\"finalreport_test_to_edit_for_researcherrrs_2026-01-27_1769538907095_proposal_test_to_edit_for_researcherrrs_1769527820149.docx\",\"url\":\"/uploads/projects/finalreport_test_to_edit_for_researcherrrs_2026-01-27_1769538907095_proposal_test_to_edit_for_researcherrrs_1769527820149.docx\"}]', '2026-01-27 22:23:43'),
(24, 38, 'proposal', NULL, '', 2, '2026-01-27 23:02:54', 1, '[{\"name\":\"proposal_test_to_edit_for_researcherrrs_1769527820149.docx\",\"url\":\"/uploads/projects/1769533374034_proposal_test_to_edit_for_researcherrrs_1769527820149.docx\"},{\"name\":\"pay slip.pdf\",\"url\":\"/uploads/projects/1769533374036_pay_slip.pdf\"},{\"name\":\"assignment cover photo.docx\",\"url\":\"/uploads/projects/1769533374037_assignment_cover_photo.docx\"}]', '2026-01-27 00:00:00'),
(25, 40, 'final_report', NULL, '', 1, '2026-01-30 21:53:19', 2, '[{\"name\":\"finalreport_2_no_duplication_test_2026-01-30_1769800224537_rpgbuac_research_project_grant_1_.sql\",\"url\":\"/uploads/projects/finalreport_2_no_duplication_test_2026-01-30_1769800224537_rpgbuac_research_project_grant_1_.sql\"}]', '2026-01-30 21:53:19'),
(26, 42, 'final_report', NULL, '', 1, '2026-01-31 21:33:02', 3, '[{\"name\":\"finalreport_notification_test_2_2026-01-31_1769873582561_rpgbuac_research_project_grant_1_.sql\",\"url\":\"/uploads/projects/finalreport_notification_test_2_2026-01-31_1769873582561_rpgbuac_research_project_grant_1_.sql\"}]', '2026-01-31 21:33:02'),
(27, 14, 'final_report', NULL, '', 1, '2026-01-31 21:55:11', 2, '[{\"name\":\"finalreport_iot_based_smart_home_automation_2026-01-31_1769874911071_rpgbuac_research_project_grant_1_.sql\",\"url\":\"/uploads/projects/finalreport_iot_based_smart_home_automation_2026-01-31_1769874911071_rpgbuac_research_project_grant_1_.sql\"}]', '2026-01-31 21:55:11'),
(28, 41, 'final_report', NULL, '', 1, '2026-01-31 23:18:07', 3, '[{\"name\":\"finalreport_test_for_email_2026-01-31_1769879887913_rpgbuac_research_project_grant_1_.sql\",\"url\":\"/uploads/projects/finalreport_test_for_email_2026-01-31_1769879887913_rpgbuac_research_project_grant_1_.sql\"}]', '2026-01-31 23:18:07'),
(29, 43, 'final_report', NULL, '', 1, '2026-02-01 00:06:30', 2, '[{\"name\":\"finalreport_test_for_review_reminder_2026-01-31_1769882790205_rpgbuac_research_project_grant_1_.sql\",\"url\":\"/uploads/projects/finalreport_test_for_review_reminder_2026-01-31_1769882790205_rpgbuac_research_project_grant_1_.sql\"}]', '2026-02-01 00:06:30'),
(30, 46, 'final_report', NULL, '', 1, '2026-02-02 22:36:35', 2, '[{\"name\":\"finalreport_external_reviewer_2026-02-02_1770050195488_app.js\",\"url\":\"/uploads/projects/finalreport_external_reviewer_2026-02-02_1770050195488_app.js\"}]', '2026-02-02 22:36:35');

-- --------------------------------------------------------

--
-- Table structure for table `project_review`
--

CREATE TABLE `project_review` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `review_type` tinyint(4) NOT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` datetime DEFAULT current_timestamp(),
  `due_date` date DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `review_comments` text DEFAULT NULL,
  `total_marks` decimal(6,2) DEFAULT NULL,
  `marks_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`marks_breakdown`)),
  `attachment` varchar(400) DEFAULT NULL,
  `status` enum('assigned','submitted') DEFAULT 'assigned',
  `last_reminder_sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_review`
--

INSERT INTO `project_review` (`id`, `project_id`, `reviewer_id`, `review_type`, `assigned_by`, `assigned_at`, `due_date`, `submitted_at`, `review_comments`, `total_marks`, `marks_breakdown`, `attachment`, `status`, `last_reminder_sent_at`) VALUES
(9, 4, 5, 1, 1, '2026-01-23 18:25:02', '2026-01-24', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(10, 4, 1, 1, 1, '2026-01-23 18:25:17', NULL, '2026-01-23 18:25:17', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(11, 5, 1, 1, 1, '2026-01-23 18:40:50', '2026-01-24', '2026-01-24 21:01:55', 'hello this if completely fine.', 100.00, '{\"Relevance and Feasibility of the Study\":20,\"Clarity of Problem Statement & Objectives\":20,\"Methodology and Research Design\":20,\"Expected Outcomes and Impact\":20,\"Budget and Timeline Justification\":20}', NULL, 'submitted', NULL),
(12, 5, 1, 1, 1, '2026-01-23 18:49:24', NULL, '2026-01-23 18:49:24', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(13, 5, 4, 2, 1, '2026-01-23 18:59:56', '2026-01-24', '2026-01-23 19:22:08', 'asfawfas', 100.00, '{}', NULL, 'submitted', NULL),
(14, 4, 1, 2, 1, '2026-01-23 19:34:27', '2026-01-27', '2026-01-26 00:09:19', 'Manual Override', 100.00, NULL, NULL, 'submitted', NULL),
(17, 19, 1, 1, 1, '2026-01-24 21:10:19', '2026-01-25', '2026-01-24 21:12:23', 'this is test on editing', 20.00, '{\"Relevance and Feasibility of the Study\":10,\"Clarity of Problem Statement & Objectives\":10,\"Methodology and Research Design\":0,\"Expected Outcomes and Impact\":0,\"Budget and Timeline Justification\":0}', NULL, 'submitted', NULL),
(18, 26, 1, 1, 1, '2026-01-24 22:19:14', '2026-01-25', '2026-01-24 22:32:42', 'lorem ipsum dormu', 14.00, '{\"Relevance and Feasibility of the Study\":10,\"Clarity of Problem Statement & Objectives\":1,\"Methodology and Research Design\":1,\"Expected Outcomes and Impact\":1,\"Budget and Timeline Justification\":1}', NULL, 'submitted', NULL),
(19, 26, 1, 2, 1, '2026-01-24 22:58:33', '2026-01-27', '2026-01-30 00:51:32', 'lorem', 50.00, NULL, NULL, 'submitted', NULL),
(20, 27, 1, 1, 1, '2026-01-24 23:33:56', '2026-01-26', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(21, 27, 1, 1, 1, '2026-01-24 23:34:21', NULL, '2026-01-24 23:34:21', NULL, 1000.00, NULL, NULL, 'submitted', NULL),
(22, 27, 1, 2, 1, '2026-01-24 23:44:31', '2026-01-26', '2026-01-26 00:06:31', 'done and dusted', 14.00, NULL, NULL, 'submitted', NULL),
(26, 30, 1, 1, 1, '2026-01-25 23:32:53', '2026-01-26', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(27, 17, 1, 2, 1, '2026-01-26 00:13:20', '2026-02-03', '2026-01-28 00:36:28', 'Manual Override', 100.00, '{\"Achievement of Objectives\":20,\"Quality of Data Analysis & Findings\":20,\"Contribution to Knowledge/Society\":20,\"Clarity and Structure of the Report\":20,\"Budget Utilization and Financial Integrity\":20}', NULL, 'submitted', NULL),
(28, 29, 1, 1, 1, '2026-01-26 00:23:37', '2026-01-27', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(29, 29, 1, 1, 1, '2026-01-26 00:24:22', NULL, '2026-01-26 00:24:22', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(30, 29, 1, 2, 1, '2026-01-26 00:24:51', '2026-01-27', '2026-01-28 00:20:59', 'Manual Override', 100.00, NULL, NULL, 'submitted', NULL),
(31, 32, 1, 1, 1, '2026-01-26 00:37:58', '2026-01-27', '2026-01-26 00:38:34', 'hello', 100.00, '{\"Relevance and Feasibility of the Study\":20,\"Clarity of Problem Statement & Objectives\":20,\"Methodology and Research Design\":20,\"Expected Outcomes and Impact\":20,\"Budget and Timeline Justification\":20}', NULL, 'submitted', NULL),
(33, 33, 1, 1, 1, '2026-01-26 01:06:01', '2026-01-27', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(34, 33, 1, 1, 1, '2026-01-26 01:06:11', NULL, '2026-01-26 01:06:11', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(36, 34, 1, 1, 1, '2026-01-27 16:20:49', '2026-02-04', '2026-01-27 16:25:28', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?', 100.00, '{\"Relevance and Feasibility of the Study\":20,\"Clarity of Problem Statement & Objectives\":20,\"Methodology and Research Design\":20,\"Expected Outcomes and Impact\":20,\"Budget and Timeline Justification\":20}', NULL, 'submitted', NULL),
(37, 32, 1, 2, 1, '2026-01-27 17:30:19', '2026-01-29', '2026-01-27 17:50:48', '100', 100.00, NULL, NULL, 'submitted', NULL),
(38, 34, 1, 1, 1, '2026-01-27 17:37:49', NULL, '2026-01-27 17:37:49', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(39, 35, 1, 1, 1, '2026-01-27 19:06:10', '2026-01-29', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(40, 35, 1, 1, 1, '2026-01-27 19:06:27', NULL, '2026-01-27 19:06:27', NULL, 100.00, NULL, NULL, 'submitted', NULL),
(41, 35, 1, 2, 1, '2026-01-27 19:07:56', '2026-01-28', '2026-01-27 19:57:58', 'rejected', 50.00, NULL, NULL, 'submitted', NULL),
(42, 37, 1, 1, 1, '2026-01-27 22:15:03', '2026-01-29', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(43, 37, 1, 1, 1, '2026-01-27 22:15:03', '2026-01-29', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(44, 37, 1, 1, 1, '2026-01-27 22:20:37', NULL, '2026-01-27 22:20:37', '2345', 100.00, NULL, NULL, 'submitted', NULL),
(46, 37, 1, 2, 1, '2026-01-27 22:41:05', '2026-01-31', '2026-01-30 00:55:18', '123', 50.00, '{\"Achievement of Objectives\":{\"score\":10,\"remark\":\"lorem\"},\"Quality of Data Analysis & Findings\":{\"score\":10,\"remark\":\"ipsum\"},\"Contribution to Knowledge/Society\":{\"score\":10,\"remark\":\"\"},\"Clarity and Structure of the Report\":{\"score\":10,\"remark\":\"\"},\"Budget Utilization and Financial Integrity\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(47, 38, 1, 1, 1, '2026-01-27 23:11:41', '2026-01-28', '2026-01-30 00:11:14', 'Lorem ipsum', 95.00, '{\"Relevance and Feasibility of the Study\":{\"score\":20,\"remark\":\"hello\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"12345\"},\"Methodology and Research Design\":{\"score\":20,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":20,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":20,\"remark\":\"\"},\"Test Label\":{\"score\":5,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(48, 38, 1, 1, 1, '2026-01-30 01:05:28', NULL, '2026-01-30 01:05:28', '11234', 60.00, NULL, NULL, 'submitted', NULL),
(49, 39, 1, 1, 1, '2026-01-30 01:12:01', '2026-01-31', '2026-01-30 01:18:32', '1234', 60.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"lorem\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":10,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(50, 40, 1, 1, 1, '2026-01-30 01:21:32', '2026-01-31', '2026-01-30 01:24:41', '1234', 38.00, '{\"Relevance and Feasibility of the Study\":{\"score\":20,\"remark\":\"lorem ipsum\"},\"Clarity of Problem Statement & Objectives\":{\"score\":2,\"remark\":\"1233\"},\"Methodology and Research Design\":{\"score\":2,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":2,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":2,\"remark\":\"\"},\"Test Label\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(51, 40, 1, 2, 1, '2026-01-31 00:09:27', '2026-02-06', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(52, 31, 1, 1, 1, '2026-01-31 00:49:55', '2026-02-05', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(53, 41, 1, 1, 1, '2026-01-31 21:01:21', '2026-02-05', '2026-01-31 21:07:18', NULL, 60.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":10,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(54, 42, 1, 1, 1, '2026-01-31 21:11:23', '2026-02-03', '2026-01-31 21:12:09', 'asdfg', 60.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":10,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(55, 42, 1, 2, 1, '2026-01-31 21:33:11', '2026-02-05', '2026-01-31 22:05:29', 'Manual Override by Officer', 51.00, '{\"Achievement of Objectives\":{\"score\":11,\"remark\":\"\"},\"Quality of Data Analysis & Findings\":{\"score\":10,\"remark\":\"\"},\"Contribution to Knowledge/Society\":{\"score\":10,\"remark\":\"\"},\"Clarity and Structure of the Report\":{\"score\":10,\"remark\":\"\"},\"Budget Utilization and Financial Integrity\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(57, 14, 1, 1, 1, '2026-01-31 21:46:47', '2026-02-11', '2026-01-31 21:55:02', NULL, 57.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":10,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":7,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(58, 14, 2, 2, 1, '2026-01-31 21:55:19', '2026-02-03', '2026-01-31 22:03:35', 'qwert', 50.00, '{\"Achievement of Objectives\":{\"score\":10,\"remark\":\"\"},\"Quality of Data Analysis & Findings\":{\"score\":10,\"remark\":\"\"},\"Contribution to Knowledge/Society\":{\"score\":10,\"remark\":\"\"},\"Clarity and Structure of the Report\":{\"score\":10,\"remark\":\"\"},\"Budget Utilization and Financial Integrity\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(59, 41, 2, 2, 1, '2026-01-31 23:18:15', '2026-02-06', '2026-01-31 23:18:37', 'Manual Override by Officer', 50.00, '{\"Achievement of Objectives\":{\"score\":10,\"remark\":\"\"},\"Quality of Data Analysis & Findings\":{\"score\":10,\"remark\":\"\"},\"Contribution to Knowledge/Society\":{\"score\":10,\"remark\":\"\"},\"Clarity and Structure of the Report\":{\"score\":10,\"remark\":\"\"},\"Budget Utilization and Financial Integrity\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(60, 43, 1, 1, 1, '2026-01-31 23:59:00', '2026-02-07', '2026-02-01 00:06:20', NULL, 58.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":10,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":8,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(61, 43, 2, 2, 1, '2026-02-01 00:06:40', '2026-02-12', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(69, 44, 1, 1, 1, '2026-02-02 00:47:46', '2026-02-03', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL),
(70, 46, 1, 1, 1, '2026-02-02 22:25:08', '2026-02-12', '2026-02-02 22:35:55', NULL, 58.00, '{\"Relevance and Feasibility of the Study\":{\"score\":10,\"remark\":\"\"},\"Clarity of Problem Statement & Objectives\":{\"score\":10,\"remark\":\"\"},\"Methodology and Research Design\":{\"score\":10,\"remark\":\"\"},\"Expected Outcomes and Impact\":{\"score\":8,\"remark\":\"\"},\"Budget and Timeline Justification\":{\"score\":10,\"remark\":\"\"},\"Test Label\":{\"score\":10,\"remark\":\"\"}}', NULL, 'submitted', NULL),
(73, 46, 10, 2, 1, '2026-02-03 12:01:05', '2026-02-12', NULL, NULL, NULL, NULL, NULL, 'assigned', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `remarks`
--

CREATE TABLE `remarks` (
  `id` int(11) NOT NULL,
  `proposal_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`proposal_criteria`)),
  `final_report_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`final_report_criteria`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `remarks`
--

INSERT INTO `remarks` (`id`, `proposal_criteria`, `final_report_criteria`, `created_at`, `updated_at`) VALUES
(1, '[{\"id\":1769706832933,\"label\":\"Relevance and Feasibility of the Study\",\"marks\":20},{\"id\":1769706832934,\"label\":\"Clarity of Problem Statement & Objectives\",\"marks\":10},{\"id\":1769706832935,\"label\":\"Methodology and Research Design\",\"marks\":20},{\"id\":1769706832936,\"label\":\"Expected Outcomes and Impact\",\"marks\":20},{\"id\":1769706832937,\"label\":\"Budget and Timeline Justification\",\"marks\":20},{\"id\":1769707104849,\"label\":\"Test Label\",\"marks\":10}]', '[{\"id\":1769707123527,\"label\":\"Achievement of Objectives\",\"marks\":20},{\"id\":1769707123528,\"label\":\"Quality of Data Analysis & Findings\",\"marks\":20},{\"id\":1769707123529,\"label\":\"Contribution to Knowledge/Society\",\"marks\":20},{\"id\":1769707123530,\"label\":\"Clarity and Structure of the Report\",\"marks\":20},{\"id\":1769707123531,\"label\":\"Budget Utilization and Financial Integrity\",\"marks\":20}]', '2026-01-24 00:04:46', '2026-01-29 23:19:04');

-- --------------------------------------------------------

--
-- Table structure for table `researcher`
--

CREATE TABLE `researcher` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `researcher`
--

INSERT INTO `researcher` (`id`, `user_id`, `faculty_id`, `department_id`, `designation`, `joining_date`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 'Lecturer', NULL, '2026-01-22 20:24:37', '2026-01-27 00:24:52'),
(2, 3, 1, 1, 'Assistant Professor', NULL, '2026-01-22 20:25:00', '2026-01-28 22:40:33'),
(5, 7, 1, 2, 'Lecturer', NULL, '2026-01-22 22:46:43', '2026-01-31 13:24:35'),
(6, 8, 1, 1, 'Assistant Professor', NULL, '2026-01-28 22:13:36', '2026-01-28 22:17:50'),
(7, 6, 1, 1, 'Professor', NULL, '2026-01-28 23:08:05', '2026-01-28 23:08:05'),
(9, 12, 1, 1, 'Student', NULL, '2026-02-02 16:28:05', '2026-02-02 17:11:34');

-- --------------------------------------------------------

--
-- Table structure for table `researcher_payment`
--

CREATE TABLE `researcher_payment` (
  `id` int(11) NOT NULL,
  `researcher_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_note` varchar(255) DEFAULT NULL,
  `payment_slot` tinyint(4) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `researcher_payment`
--

INSERT INTO `researcher_payment` (`id`, `researcher_id`, `project_id`, `amount`, `payment_date`, `payment_note`, `payment_slot`, `created_at`) VALUES
(1, 1, NULL, 500.00, '2026-01-23', '', 1, '2026-01-23 22:04:52'),
(2, 1, NULL, 5860.00, '2026-01-24', 'done', 2, '2026-01-23 22:11:53'),
(4, 1, 33, 40000.00, '2026-01-27', 'qwert', 2, '2026-01-27 23:53:16'),
(5, 5, 42, 1000.00, '2026-01-29', '1st install ment', 1, '2026-01-31 22:19:16'),
(6, 5, 42, 2000.00, '2026-02-07', '2nd installment', 2, '2026-01-31 22:19:29'),
(7, 5, 42, 7000.00, '2026-01-30', 'done', 3, '2026-01-31 22:20:40'),
(8, 5, 41, 1000.00, '2026-01-28', '100099999', 1, '2026-01-31 22:55:25');

-- --------------------------------------------------------

--
-- Table structure for table `reviewer`
--

CREATE TABLE `reviewer` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `department` varchar(150) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `university` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviewer`
--

INSERT INTO `reviewer` (`id`, `user_id`, `designation`, `department`, `department_id`, `university`, `created_at`) VALUES
(1, 6, 'Professor', NULL, 1, 'University of Barishal', '2026-01-22 20:29:03'),
(2, 7, 'Lecturer', NULL, 2, 'University of Barishal', '2026-01-22 22:47:22'),
(3, 8, 'Assistant Professor', NULL, 1, 'University of Barishal', '2026-01-22 23:13:27'),
(4, 9, 'Professor', NULL, 1, 'University of Barishal', '2026-01-22 23:25:54'),
(5, 10, 'Associate Professor', 'Department of Physics', NULL, 'University of Dhaka', '2026-01-23 00:18:19'),
(6, 3, 'Assistant Professor', NULL, 1, 'University of Barishal', '2026-01-28 22:38:54'),
(7, 13, 'Lecturer', NULL, 2, 'University of Barishal', '2026-02-02 22:24:46'),
(8, 14, 'Professor', NULL, 2, 'University of Barishal', '2026-02-02 22:43:10'),
(9, 15, NULL, NULL, NULL, NULL, '2026-02-03 11:56:26'),
(10, 16, NULL, NULL, NULL, NULL, '2026-02-03 12:01:05');

-- --------------------------------------------------------

--
-- Table structure for table `reviewer_payment`
--

CREATE TABLE `reviewer_payment` (
  `id` int(11) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `payment_type` enum('proposal_review','final_report_review') NOT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` tinyint(4) DEFAULT 0,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviewer_payment`
--

INSERT INTO `reviewer_payment` (`id`, `reviewer_id`, `project_id`, `payment_type`, `amount`, `payment_date`, `created_at`, `status`, `note`) VALUES
(7, 4, 5, 'final_report_review', 500.00, '2026-01-24', '2026-01-23 19:22:08', 1, NULL),
(10, 1, 19, 'proposal_review', NULL, NULL, '2026-01-24 21:10:19', 0, NULL),
(11, 1, 26, 'proposal_review', NULL, NULL, '2026-01-24 22:19:14', 0, NULL),
(12, 1, 27, 'proposal_review', NULL, NULL, '2026-01-24 23:34:22', 0, NULL),
(13, 1, 27, 'final_report_review', NULL, NULL, '2026-01-24 23:56:12', 0, NULL),
(16, 1, 4, 'final_report_review', NULL, NULL, '2026-01-26 00:09:19', 0, NULL),
(17, 1, 17, 'final_report_review', NULL, NULL, '2026-01-26 00:13:34', 0, NULL),
(18, 1, 29, 'proposal_review', NULL, NULL, '2026-01-26 00:24:22', 0, NULL),
(20, 1, 32, 'final_report_review', NULL, NULL, '2026-01-26 00:50:53', 0, NULL),
(22, 1, 33, 'final_report_review', NULL, NULL, '2026-01-26 01:09:17', 0, NULL),
(24, 1, 32, 'final_report_review', NULL, NULL, '2026-01-27 17:30:31', 0, NULL),
(25, 1, 34, 'proposal_review', NULL, NULL, '2026-01-27 17:37:49', 0, NULL),
(26, 1, 32, 'final_report_review', NULL, NULL, '2026-01-27 17:50:48', 0, NULL),
(27, 1, 35, 'proposal_review', NULL, NULL, '2026-01-27 19:06:27', 0, NULL),
(28, 1, 35, 'final_report_review', NULL, NULL, '2026-01-27 19:57:58', 0, NULL),
(29, 1, 37, 'proposal_review', NULL, NULL, '2026-01-27 22:20:37', 0, NULL),
(30, 1, 37, 'final_report_review', NULL, NULL, '2026-01-27 22:42:29', 0, NULL),
(31, 1, 29, 'final_report_review', NULL, NULL, '2026-01-28 00:20:59', 0, NULL),
(32, 1, 17, 'final_report_review', NULL, NULL, '2026-01-28 00:38:12', 0, NULL),
(33, 1, 26, 'final_report_review', NULL, NULL, '2026-01-30 00:51:32', 0, NULL),
(34, 1, 38, 'proposal_review', NULL, NULL, '2026-01-30 01:05:28', 0, NULL),
(35, 1, 39, 'proposal_review', NULL, NULL, '2026-01-30 01:18:32', 0, NULL),
(36, 1, 40, 'proposal_review', NULL, NULL, '2026-01-30 01:24:41', 0, NULL),
(37, 1, 40, 'final_report_review', NULL, NULL, '2026-01-31 01:10:13', 0, NULL),
(38, 1, 41, 'proposal_review', NULL, NULL, '2026-01-31 21:07:17', 0, NULL),
(39, 1, 42, 'final_report_review', NULL, NULL, '2026-01-31 21:33:29', 0, NULL),
(40, 2, 14, 'proposal_review', NULL, NULL, '2026-01-31 21:46:47', 0, NULL),
(41, 1, 14, 'proposal_review', NULL, NULL, '2026-01-31 21:55:02', 0, NULL),
(42, 2, 14, 'final_report_review', 1000.00, '2026-01-27', '2026-01-31 22:03:35', 1, '1123456978'),
(43, 2, 41, 'final_report_review', 1000.00, '2026-02-07', '2026-01-31 23:18:37', 1, 'test'),
(44, 1, 43, 'proposal_review', NULL, NULL, '2026-02-01 00:06:20', 0, NULL),
(45, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:42', 0, NULL),
(46, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:44', 0, NULL),
(47, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:45', 0, NULL),
(48, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:46', 0, NULL),
(49, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:46', 0, NULL),
(50, 1, 44, 'proposal_review', NULL, NULL, '2026-02-02 00:47:46', 0, NULL),
(51, 1, 46, 'proposal_review', NULL, NULL, '2026-02-02 22:35:52', 0, NULL),
(53, 10, 46, 'final_report_review', NULL, NULL, '2026-02-03 12:01:05', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `role` tinyint(4) NOT NULL DEFAULT 2,
  `invite_token` varchar(255) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `phone`, `email`, `password`, `photo`, `created_at`, `role`, `invite_token`, `status`) VALUES
(1, 'Mr. Officer', '01f11111111', 'officer@example.com', '$2b$10$UTzMCh/h3Sp3uvKGN9QvE.oanhXyRPglNxQ.MhY2M2zFsVRMOGrsC', '/uploads/profile/profile_photo/1769617561900_e8hlml.webp', '2026-01-22 20:22:34', 1, NULL, 1),
(2, 'Researcher 1', '01733505123', 'rs1@example.com', '$2b$10$HsqUd3QhDnNMSli7KM/3COQjMs8eD.benP92aFPV6gFCyuq8xBb5i', '/uploads/profile/profile_photo/1769615216506_k39gr.jpg', '2026-01-22 20:24:37', 2, NULL, 1),
(3, 'Researcher 2', '01733505124', 'kmomarfaruk28@gmail.com', '123456', NULL, '2026-01-22 20:25:00', 2, NULL, 1),
(6, 'Reviewer 1', '01733505127', 'rv1@example.com', '$2b$10$U1Oqoxp6.A9XMeN.1RGcu.s6tddugtPHcl0e13rdcNPvrZkntgRRu', '/uploads/profile/profile_photo/1769617649635_5qp0od.png', '2026-01-22 20:29:03', 3, NULL, 1),
(7, 'Both', '01733505129', 'omar.sk2004@gmail.com', '$2b$10$LLcoN9.Y75qBBH0T8NlqB.XL.CjmDrU49v0qpQRyuodAqoDdtIrXW', NULL, '2026-01-22 22:46:43', 4, NULL, 1),
(8, 'Reviewer 2', '01733505131', 'rv2@example.com', '123456', '/uploads/user/1769616816735-instagram.png', '2026-01-22 23:13:27', 3, NULL, 1),
(9, 'Reviewer 3', '01733505132', 'rv3@example.com', '123456', NULL, '2026-01-22 23:25:54', 3, NULL, 1),
(10, 'Reviewer 4', '0125884848', 'rv4@example.com', '123456', NULL, '2026-01-23 00:18:19', 3, NULL, 1),
(12, 'Omar FAruk 123', '0158976576', 'rs3@example.com', '$2b$10$yfDRBa7RrbOD2ISr.17ErepI5euNdcS82Eva2n2lSyaOwOFRGrRTm', NULL, '2026-02-02 16:28:05', 2, NULL, 1),
(13, 'Governance participation', '74129865241', 'warlordomar775@gmail.com', '$2b$10$Qq9rFHUAiige7YPhhBqVPO4KvtyFD8r5qz17A0KqGEtbbl/VSBkP.', NULL, '2026-02-02 22:24:46', 3, NULL, 1),
(14, 'Project Management', '74128542941', 'warlordomar774@gmail.com', '$2b$10$DV7/y1oTsn8XDX2537p/Uu1TrhQviw7TnO.VdBfI0ykcVrhhIXosW', NULL, '2026-02-02 22:43:10', 3, NULL, 1),
(15, 'h', NULL, 'rexample@example.com', '', NULL, '2026-02-03 11:56:26', 3, '528072c43bb7d3cb527d24a054f657c47cc4649032f0be38a45bf2ff2cd35f11', 0),
(16, 'Update Final Report', NULL, 'warlordomar776@gmail.com', '', NULL, '2026-02-03 12:01:05', 3, 'd52e3e2f0f072ec7e960c4fd887d99fe961be9793eb9c1cb1b473a11a2a54708', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `app_setting`
--
ALTER TABLE `app_setting`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `circular`
--
ALTER TABLE `circular`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fiscal_year_id` (`fiscal_year_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fiscal_year`
--
ALTER TABLE `fiscal_year`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `officer`
--
ALTER TABLE `officer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code_no` (`code_no`),
  ADD KEY `status` (`status`),
  ADD KEY `fiscal_year_id` (`fiscal_year_id`),
  ADD KEY `researcher_id` (`researcher_id`),
  ADD KEY `circular_id` (`circular_id`);

--
-- Indexes for table `project_report`
--
ALTER TABLE `project_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `project_review`
--
ALTER TABLE `project_review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `remarks`
--
ALTER TABLE `remarks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `researcher`
--
ALTER TABLE `researcher`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `researcher_payment`
--
ALTER TABLE `researcher_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `researcher_id` (`researcher_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `reviewer`
--
ALTER TABLE `reviewer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `reviewer_payment`
--
ALTER TABLE `reviewer_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `circular`
--
ALTER TABLE `circular`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fiscal_year`
--
ALTER TABLE `fiscal_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `officer`
--
ALTER TABLE `officer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `project_report`
--
ALTER TABLE `project_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `project_review`
--
ALTER TABLE `project_review`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `remarks`
--
ALTER TABLE `remarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `researcher`
--
ALTER TABLE `researcher`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `researcher_payment`
--
ALTER TABLE `researcher_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `reviewer`
--
ALTER TABLE `reviewer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reviewer_payment`
--
ALTER TABLE `reviewer_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `circular`
--
ALTER TABLE `circular`
  ADD CONSTRAINT `circular_ibfk_1` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `department_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `officer`
--
ALTER TABLE `officer`
  ADD CONSTRAINT `officer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `officer_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `officer_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`researcher_id`) REFERENCES `researcher` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_ibfk_2` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_ibfk_3` FOREIGN KEY (`circular_id`) REFERENCES `circular` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project_report`
--
ALTER TABLE `project_report`
  ADD CONSTRAINT `project_report_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_report_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `user` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project_review`
--
ALTER TABLE `project_review`
  ADD CONSTRAINT `project_review_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_review_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `reviewer` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_review_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `user` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `researcher`
--
ALTER TABLE `researcher`
  ADD CONSTRAINT `researcher_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `researcher_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `researcher_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `researcher_payment`
--
ALTER TABLE `researcher_payment`
  ADD CONSTRAINT `researcher_payment_ibfk_1` FOREIGN KEY (`researcher_id`) REFERENCES `researcher` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `researcher_payment_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviewer`
--
ALTER TABLE `reviewer`
  ADD CONSTRAINT `reviewer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviewer_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviewer_payment`
--
ALTER TABLE `reviewer_payment`
  ADD CONSTRAINT `reviewer_payment_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `reviewer` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviewer_payment_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
