-- Taskly Employee Task Management Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS taskly_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskly_db;

-- Users table (both admins and employees)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  department VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  due_date DATE DEFAULT NULL,
  assigned_to INT DEFAULT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Task comments/activity log
CREATE TABLE IF NOT EXISTS task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Seed data: Default admin account (password: Admin@123)
INSERT INTO users (name, email, password, role, department) VALUES
('System Admin', 'admin@taskly.com', '$2a$12$Q2nReO.G.8EAJKJP1rjA5.IaRAkrJCzUXO4VXIXy3AS5JzDIcyU22', 'admin', 'Management');

-- Seed data: Sample employees (password: Employee@123)
INSERT INTO users (name, email, password, role, department, phone) VALUES
('Alice Johnson', 'alice@taskly.com', '$2a$12$i2X/VNMjy/4j.0jfUwgazOR/2N/nZpwfhiC9uYVrHWDYd.dahj2C.', 'employee', 'Engineering', '+1-555-0101'),
('Bob Smith', 'bob@taskly.com', '$2a$12$i2X/VNMjy/4j.0jfUwgazOR/2N/nZpwfhiC9uYVrHWDYd.dahj2C.', 'employee', 'Design', '+1-555-0102'),
('Carol White', 'carol@taskly.com', '$2a$12$i2X/VNMjy/4j.0jfUwgazOR/2N/nZpwfhiC9uYVrHWDYd.dahj2C.', 'employee', 'Marketing', '+1-555-0103');

-- Seed data: Sample tasks
INSERT INTO tasks (title, description, priority, status, due_date, assigned_to, created_by) VALUES
('Design new landing page', 'Create a modern, responsive landing page for the product launch', 'high', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 3, 1),
('Fix authentication bug', 'Resolve the token expiry issue reported in production', 'high', 'pending', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, 1),
('Write unit tests for API', 'Add comprehensive unit tests for all API endpoints', 'medium', 'pending', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 2, 1),
('Update marketing materials', 'Refresh brochures and social media graphics for Q3', 'low', 'completed', DATE_ADD(CURDATE(), INTERVAL -3 DAY), 4, 1),
('Database optimization', 'Analyze and optimize slow queries in the reporting module', 'medium', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 2, 1);
