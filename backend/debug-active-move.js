const mysql = require('mysql2/promise');

async function checkActiveMove() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vms'
  });
  
  console.log('=== Checking active_move table ===\n');
  
  // Check active_move count
  const [count] = await db.execute('SELECT COUNT(*) as count FROM active_move');
  console.log(`Total records in active_move: ${count[0].count}`);
  
  // Check distinct vehicles in active_move
  const [vehicles] = await db.execute(`
    SELECT DISTINCT v.vehicle_id, v.vehicle_no, COUNT(am.move_id) as record_count
    FROM vehicles v
    JOIN active_move am ON v.vehicle_id = am.vehicle_id
    GROUP BY v.vehicle_id, v.vehicle_no
  `);
  
  console.log(`\nVehicles with GPS data: ${vehicles.length}`);
  vehicles.forEach(v => {
    console.log(`  - ${v.vehicle_no}: ${v.record_count} records`);
  });
  
  // Run the exact query from the API
  console.log('\n=== Testing API Query ===');
  const [rows] = await db.execute(`
    SELECT DISTINCT
      v.vehicle_id, 
      v.vehicle_no AS ba, 
      u.unit_name AS unit, 
      v.vehicle_type,
      MAX(am.recorded_at) as last_seen
    FROM vehicles v
    JOIN units u ON v.unit_id = u.unit_id
    LEFT JOIN active_move am ON v.vehicle_id = am.vehicle_id
    WHERE am.recorded_at IS NOT NULL
    GROUP BY v.vehicle_id, v.vehicle_no, u.unit_name, v.vehicle_type
    ORDER BY last_seen DESC
  `);
  
  console.log(`\nAPI query returned: ${rows.length} vehicles`);
  rows.forEach(r => {
    console.log(`  - ${r.ba} (${r.unit}) - last seen: ${r.last_seen}`);
  });
  
  await db.end();
}

checkActiveMove().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
