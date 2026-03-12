-- SMS Logs Table for VMS
-- This table tracks all SMS alerts sent by the system

CREATE TABLE IF NOT EXISTS sms_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT,
    phone_number VARCHAR(20),
    recipient_name VARCHAR(100),
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_alert_id (alert_id),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_phone_number (phone_number)
);

-- Add contact column to units table if not exists
-- This stores the unit commander's contact number
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS contact VARCHAR(20) DEFAULT NULL;

-- Add contact_number column to profiles table if not exists
-- This stores user contact numbers for SMS alerts
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20) DEFAULT NULL;

-- Insert sample data for testing (optional)
-- Update with actual unit commander contacts
UPDATE units SET contact = '0300-1234567' WHERE unit_name = '340';
UPDATE units SET contact = '0300-9876543' WHERE unit_name = '341';
UPDATE units SET contact = '0300-4567890' WHERE unit_name = '342';
UPDATE units SET contact = '0300-3456789' WHERE unit_name = 'Div Arty';
UPDATE units SET contact = '0300-2345678' WHERE unit_name = 'HQ 34 Div';

-- Create view for SMS reporting
CREATE OR REPLACE VIEW sms_report AS
SELECT 
    sl.id,
    sl.phone_number,
    sl.recipient_name,
    sl.status,
    sl.error_message,
    sl.sent_at,
    va.alert_type,
    va.details as violation_details,
    v.vehicle_no,
    u.unit_name,
    CASE 
        WHEN va.alert_type = 'PANIC' OR va.alert_type = 'SOS_TRIGGER' THEN '🚨 EMERGENCY'
        WHEN va.alert_type = 'OVERSPEED' THEN '⚠️ SPEED VIOLATION'
        WHEN va.alert_type = 'UNSANCTIONED_MOVE' THEN '🚫 UNAUTHORIZED MOVE'
        ELSE '📋 GENERAL'
    END as alert_category
FROM sms_logs sl
LEFT JOIN violations_alerts va ON sl.alert_id = va.alert_id
LEFT JOIN vehicles v ON va.vehicle_id = v.vehicle_id
LEFT JOIN units u ON v.unit_id = u.unit_id
ORDER BY sl.sent_at DESC;

-- Stored procedure to clean old SMS logs (optional)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanOldSMSLogs(IN days_to_keep INT)
BEGIN
    DELETE FROM sms_logs 
    WHERE sent_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    SELECT ROW_COUNT() as logs_deleted;
END //
DELIMITER ;

-- Sample query to get SMS statistics
-- SELECT 
--     status,
--     COUNT(*) as count,
--     DATE(sent_at) as date
-- FROM sms_logs 
-- WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
-- GROUP BY status, DATE(sent_at)
-- ORDER BY date DESC;
