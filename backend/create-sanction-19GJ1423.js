const mysql = require('mysql2/promise');

async function createSanctionFor19GJ1423() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'vms'
    });
    
    console.log('Creating active sanction for 19GJ1423...');
    
    // Get vehicle_id for 19GJ1423
    const [vehicles] = await db.execute(
      'SELECT vehicle_id FROM vehicles WHERE vehicle_no = ?',
      ['19GJ1423']
    );
    
    if (vehicles.length === 0) {
      console.log('❌ Vehicle 19GJ1423 not found in database');
      await db.end();
      return;
    }
    
    const vehicle_id = vehicles[0].vehicle_id;
    console.log(`Found vehicle_id: ${vehicle_id}`);
    
    // Check if there's already an active sanction
    const [existing] = await db.execute(
      `SELECT sanction_id FROM move_sanctions 
       WHERE vehicle_id = ? AND status = 'ACTIVE' 
       AND end_datetime >= NOW()`,
      [vehicle_id]
    );
    
    if (existing.length > 0) {
      console.log(`✓ Active sanction already exists for 19GJ1423 (ID: ${existing[0].sanction_id})`);
      await db.end();
      return;
    }
    
    // Create active sanction for 19GJ1423
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
      vehicle_id,
      'HQ',
      'Field Exercise',
      new Date(),
      new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      'ACTIVE',
      'Unit Driver',
      'Active Movement',
      '1234567890'
    ]);
    
    console.log(`✓ Created active sanction for 19GJ1423 with ID: ${result.insertId}`);
    
    // Verify
    const [sanctions] = await db.execute(`
      SELECT ms.*, v.vehicle_no 
      FROM move_sanctions ms 
      JOIN vehicles v ON ms.vehicle_id = v.vehicle_id 
      WHERE ms.status = 'ACTIVE'
    `);
    
    console.log('\nActive sanctions in database:');
    sanctions.forEach(s => {
      console.log(`  - ${s.vehicle_no}: ${s.route_from} → ${s.route_to}`);
    });
    
    await db.end();
    console.log('✓ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createSanctionFor19GJ1423();
