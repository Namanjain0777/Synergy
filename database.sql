CREATE DATABASE gesture_bot;

USE gesture_bot;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN sensor_data INT DEFAULT 0;

-- Create the ir_sensor_readings table
CREATE TABLE ir_sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Add an ID column as a unique identifier
    distance_cm FLOAT NOT NULL         -- Remove the trailing comma
);

-- Insert mock numerical data into ir_sensor_readings table
INSERT INTO ir_sensor_readings (distance_cm)
VALUES
(10.5),
(15.3),
(8.7),
(0.0),
(25.0),
(5.5),
(18.2),
(1.2),
(30.0),
(2.5);

