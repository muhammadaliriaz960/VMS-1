-- Create profiles table for user profile management
CREATE TABLE `profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','user','operator') NOT NULL DEFAULT 'user',
  `unit_id` int(11) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `role` (`role`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `profiles_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`unit_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default profiles
INSERT INTO `profiles` (`username`, `password`, `full_name`, `email`, `role`, `unit_id`, `contact_number`) VALUES
('admin', 'admin123', 'System Administrator', 'admin@vms.mil', 'admin', NULL, '0300-1234567'),
('operator', 'operator123', 'Shift Operator', 'operator@vms.mil', 'operator', 1, '0300-9876543'),
('user', 'user123', 'Regular User', 'user@vms.mil', 'user', 1, '0300-4567890');
