const mysql = require('mysql2/promise');

async function createActiveSanction() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'vms'
    });
    
    console.log('Creating active sanction...');
    
    // Create a new active sanction for testing
    const [result] = await db.execute(`
      INSERT INTO move_sanctions (
        vehicle_id, 
        route_from, 
        route_to, 
        start_datetime, 
        end_datetime, 
        status, 
        driver_name, 
        purpose, 
        contact_no,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      1, // vehicle_id (assuming vehicle with ID 1 exists)
      'HQ',
      'Field Location',
      new Date(), // start_datetime (now)
      new Date(Date.now() + 2 * 60 * 60 * 1000), // end_datetime (2 hours from now)
      'ACTIVE',
      'Test Driver',
      'Test Movement',
      '1234567890'
    ]);
    
    console.log(`✓ Created active sanction with ID: ${result.insertId}`);
    
    // Verify the sanction was created
    const [sanctions] = await db.execute(`
      SELECT * FROM move_sanctions WHERE status = 'ACTIVE'
    `);
    
    console.log('Active sanctions:', sanctions);
    
    await db.end();
    console.log('✓ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createActiveSanction();
