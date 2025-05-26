-- SQL script to create tables and initial data for MySQL database for the marketplace app

CREATE DATABASE IF NOT EXISTS marketplace_db;
USE marketplace_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  description TEXT,
  type VARCHAR(100),
  filePath VARCHAR(255),
  samplePreviewPaths TEXT,
  uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  templateId INT NOT NULL,
  buyerId VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  FOREIGN KEY (templateId) REFERENCES templates(id)
);

-- Insert default admin user (password: admin)
INSERT INTO users (email, password, fullName, role)
VALUES ('admin@gmail.com', 
        '$2y$10$e0NRZ1xq6q6v1Q6v1Q6v1O6v1Q6v1Q6v1Q6v1Q6v1Q6v1Q6v1Q6v1Q6', 
        'Administrator', 'admin');
