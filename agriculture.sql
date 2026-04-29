-- Table to store sensor readings
CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL,
    humidity REAL,
    soil_moisture REAL,
    motor_status TEXT,
    prediction TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table to store system settings/thresholds
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moisture_threshold REAL DEFAULT 40.0,
    auto_motor BOOLEAN DEFAULT 1
);

-- Table for System Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT, -- e.g., "MOTOR", "ALERT", "SYSTEM"
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT INTO settings (moisture_threshold, auto_motor)
SELECT 40.0, 1
WHERE NOT EXISTS (SELECT 1 FROM settings);
