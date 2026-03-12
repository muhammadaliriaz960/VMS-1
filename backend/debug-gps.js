const mysql = require('mysql2/promise');

async function debugGPSData() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vms'
  });
  
  console.log('=== DEBUG: Checking vehicles and GPS data ===\n');
  
  // Check all vehicles
  const [vehicles] = await db.execute('SELECT vehicle_id, vehicle_no FROM vehicles');
  console.log(`Found ${vehicles.length} vehicles:`);
  vehicles.forEach(v => console.log(`  - ${v.vehicle_no} (ID: ${v.vehicle_id})`));
  
  // Check gps_data table exists and has data
  const [gpsCount] = await db.execute('SELECT COUNT(*) as count FROM gps_data');
  console.log(`\ngps_data table has ${gpsCount[0].count} records`);
  
  // Check active_move table
  const [moveCount] = await db.execute('SELECT COUNT(*) as count FROM active_move');
  console.log(`active_move table has ${moveCount[0].count} records`);
  
  // Test the exact query from the API
  console.log('\n=== Testing API Query ===');
  const [rows] = await db.execute(`
    SELECT DISTINCT
      v.vehicle_id, 
      v.vehicle_no AS ba, 
      u.unit_name AS unit, 
      v.vehicle_type,
      MAX(gd.created_at) as last_seen
    FROM vehicles v
    JOIN units u ON v.unit_id = u.unit_id
    LEFT JOIN gps_data gd ON v.vehicle_id = gd.vehicle_id
    WHERE gd.gps_data_id IS NOT NULL
    GROUP BY v.vehicle_id, v.vehicle_no, u.unit_name, v.vehicle_type
    ORDER BY last_seen DESC
  `);
  
  console.log(`\nQuery returned ${rows.length} vehicles with GPS data:`);
  rows.forEach(r => console.log(`  - ${r.ba} (${r.unit}) - last seen: ${r.last_seen}`));
  
  await db.end();
}

debugGPSData().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
