-- Social Media Content Creation & Publishing Platform
-- Database Schema

CREATE DATABASE IF NOT EXISTS social_media_platform;
USE social_media_platform;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'content_creator', 'reviewer') NOT NULL DEFAULT 'content_creator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

-- Social contents table
CREATE TABLE IF NOT EXISTS social_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  caption TEXT NOT NULL,
  media_url VARCHAR(500) DEFAULT NULL,
  platform ENUM('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube') NOT NULL,
  hashtags VARCHAR(500) DEFAULT NULL,
  status ENUM('draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
  scheduled_at DATETIME DEFAULT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_contents_status (status),
  INDEX idx_contents_platform (platform),
  INDEX idx_contents_created_by (created_by),
  INDEX idx_contents_scheduled_at (scheduled_at)
);

-- Content reviews table
CREATE TABLE IF NOT EXISTS content_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  status ENUM('approved', 'rejected') NOT NULL,
  comments TEXT DEFAULT NULL,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES social_contents(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reviews_content_id (content_id),
  INDEX idx_reviews_reviewer_id (reviewer_id)
);

-- Publishing schedule table
CREATE TABLE IF NOT EXISTS publishing_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL UNIQUE,
  scheduled_at DATETIME NOT NULL,
  published_at DATETIME DEFAULT NULL,
  status ENUM('scheduled', 'published', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES social_contents(id) ON DELETE CASCADE,
  INDEX idx_schedule_status (status),
  INDEX idx_schedule_scheduled_at (scheduled_at)
);
