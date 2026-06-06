-- ============================================================
-- Planify - schema.sql
-- Run this file in MySQL before starting the server:
--   mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS planify_db;
USE planify_db;

-- ---- Users Table ----
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  UNIQUE NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---- Tasks Table ----
CREATE TABLE IF NOT EXISTS tasks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  title      VARCHAR(255)  NOT NULL,
  priority   ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  completed  TINYINT(1)    DEFAULT 0,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---- Sticky Notes Table ----
CREATE TABLE IF NOT EXISTS sticky_notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL,
  text       TEXT      NOT NULL,
  color      VARCHAR(20) NOT NULL DEFAULT '#fef08a',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---- Sample Data ----
INSERT INTO users (name, email, password) VALUES
  ('Bhuvana', 'bhuvana@example.com', 'password123'),
  ('Arjun',   'arjun@example.com',   'pass456');

INSERT INTO tasks (user_id, title, priority, completed) VALUES
  (1, 'UI/UX Design',      'high',   1),
  (1, 'Internship Report', 'medium', 1),
  (1, 'Study React',       'low',    0),
  (1, 'Read Book',         'low',    0),
  (1, 'Workout',           'medium', 0);

INSERT INTO sticky_notes (user_id, text, color) VALUES
  (1, 'Report by Friday',  '#fef08a'),
  (1, 'Mentor Meeting',    '#fbcfe8'),
  (1, 'Groceries',         '#bfdbfe'),
  (1, 'Learn React',       '#bbf7d0');

-- ============================================================
-- Useful Queries (for reference)
-- ============================================================
-- SELECT * FROM tasks WHERE user_id = 1;
-- SELECT * FROM tasks WHERE user_id = 1 AND completed = 0;
-- SELECT priority, COUNT(*) FROM tasks WHERE user_id = 1 GROUP BY priority;
