// Settings Management API Endpoints
// Add these to your server.js file

// Get all settings
app.get("/api/settings", async (req, res) => {
  try {
    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, setting_type, description
      FROM system_settings 
      WHERE is_active = TRUE
      ORDER BY setting_key
    `);
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      // Convert based on type
      let value = setting.setting_value;
      if (setting.setting_type === 'number') {
        value = parseInt(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      }
      settingsObj[setting.setting_key] = value;
    });
    
    res.json(settingsObj);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific setting
app.get("/api/settings/:key", async (req, res) => {
  try {
    const [settings] = await db.execute(`
      SELECT setting_value, setting_type
      FROM system_settings 
      WHERE setting_key = ? AND is_active = TRUE
    `, [req.params.key]);
    
    if (settings.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    let value = settings[0].setting_value;
    if (settings[0].setting_type === 'number') {
      value = parseInt(value);
    } else if (settings[0].setting_type === 'boolean') {
      value = value === 'true';
    }
    
    res.json({ [req.params.key]: value });
  } catch (err) {
    console.error("Error fetching setting:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update settings
app.post("/api/settings", async (req, res) => {
  try {
    const settings = req.body;
    const updatePromises = [];
    
    for (const [key, value] of Object.entries(settings)) {
      // Get setting type first
      const [typeResult] = await db.execute(`
        SELECT setting_type FROM system_settings 
        WHERE setting_key = ? AND is_active = TRUE
      `, [key]);
      
      if (typeResult.length === 0) {
        console.warn(`Setting ${key} not found, skipping`);
        continue;
      }
      
      // Convert value to string for storage
      let stringValue = String(value);
      
      updatePromises.push(
        db.execute(`
          UPDATE system_settings 
          SET setting_value = ?, updated_at = NOW()
          WHERE setting_key = ? AND is_active = TRUE
        `, [stringValue, key])
      );
    }
    
    await Promise.all(updatePromises);
    
    // Update global variables for overspeed limits
    if (settings.first_overspeed_limit) {
      FIRST_OVERSPEED_LIMIT = parseInt(settings.first_overspeed_limit);
    }
    if (settings.second_overspeed_limit) {
      SECOND_OVERSPEED_LIMIT = parseInt(settings.second_overspeed_limit);
    }
    
    console.log("Settings updated successfully:", settings);
    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Load settings into memory on server start
async function loadSettingsIntoMemory() {
  try {
    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM system_settings 
      WHERE is_active = TRUE
    `);
    
    settings.forEach(setting => {
      let value = setting.setting_value;
      if (setting.setting_type === 'number') {
        value = parseInt(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      }
      
      // Update global variables
      switch (setting.setting_key) {
        case 'first_overspeed_limit':
          FIRST_OVERSPEED_LIMIT = value;
          break;
        case 'second_overspeed_limit':
          SECOND_OVERSPEED_LIMIT = value;
          break;
        // Add more settings as needed
      }
    });
    
    console.log("Settings loaded into memory successfully");
  } catch (err) {
    console.error("Error loading settings:", err);
  }
}

// Call this function when server starts
// loadSettingsIntoMemory();
