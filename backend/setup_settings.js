const mysql2 = require("mysql2/promise");

// Database connection
const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setupSettingsTable() {
  try {
    console.log("Creating system_settings table...");
    
    // Create the table
    await db.execute(`
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
      )
    `);
    
    console.log("✅ Table created successfully!");
    
    // Insert default settings
    const defaultSettings = [
      ['first_overspeed_limit', '60', 'number', 'First overspeed limit in km/h'],
      ['second_overspeed_limit', '80', 'number', 'Second overspeed limit in km/h'],
      ['night_move_start', '22:00', 'time', 'Night movement start time'],
      ['night_move_end', '05:00', 'time', 'Night movement end time'],
      ['weekend_night_moves', 'false', 'boolean', 'Enable night move restrictions on weekends'],
      ['max_live_vehicles', '5', 'number', 'Maximum vehicles to show in live feed'],
      ['sms_alerts_enabled', 'true', 'boolean', 'Enable SMS alerts for violations'],
      ['sound_alerts_enabled', 'true', 'boolean', 'Enable sound alerts for panic/overspeed']
    ];
    
    for (const [key, value, type, description] of defaultSettings) {
      await db.execute(`
        INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description)
        VALUES (?, ?, ?, ?)
      `, [key, value, type, description]);
    }
    
    console.log("✅ Default settings inserted!");
    
    // Create view for active settings
    await db.execute(`
      CREATE OR REPLACE VIEW active_settings AS
      SELECT setting_key, setting_value, setting_type
      FROM system_settings 
      WHERE is_active = TRUE
    `);
    
    console.log("✅ View created successfully!");
    
    // Verify the setup
    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, setting_type, description
      FROM system_settings 
      WHERE is_active = TRUE
      ORDER BY setting_key
    `);
    
    console.log("\n📋 Current Settings:");
    console.table(settings);
    
    console.log("\n🎉 Settings table setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up settings table:", error);
  } finally {
    await db.end();
  }
}

// Run the setup
setupSettingsTable();
