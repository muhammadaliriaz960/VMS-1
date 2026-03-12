-- Create system_settings table for centralized configuration management
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(100) NOT NULL,
  setting_type ENUM('number', 'time', 'string', 'boolean') DEFAULT 'string',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key),
  INDEX idx_active (is_active)
);

-- Insert default settings if they don't exist
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('first_overspeed_limit', '60', 'number', 'First overspeed limit in km/h'),
('second_overspeed_limit', '80', 'number', 'Second overspeed limit in km/h'),
('night_move_start', '22:00', 'time', 'Night movement start time'),
('night_move_end', '05:00', 'time', 'Night movement end time'),
('weekend_night_moves', 'false', 'boolean', 'Enable night move restrictions on weekends'),
('max_live_vehicles', '5', 'number', 'Maximum vehicles to show in live feed'),
('sms_alerts_enabled', 'true', 'boolean', 'Enable SMS alerts for violations'),
('sound_alerts_enabled', 'true', 'boolean', 'Enable sound alerts for panic/overspeed');

-- Create a view for easy access to active settings
CREATE OR REPLACE VIEW active_settings AS
SELECT setting_key, setting_value, setting_type
FROM system_settings 
WHERE is_active = TRUE;
