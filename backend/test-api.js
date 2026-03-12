const mysql = require('mysql2/promise');

async function testAPI() {
  try {
    console.log('Testing database connection...');
    
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'vms'
    });
    
    console.log('✓ Database connected');
    
    // Check move sanctions table structure
    const [structure] = await db.execute(`
      DESCRIBE move_sanctions
    `);
    console.log('Move sanctions table structure:', structure);
    
    // Check actual data in move_sanctions
    const [allSanctions] = await db.execute(`
      SELECT * FROM move_sanctions LIMIT 5
    `);
    console.log('Sample move sanctions data:', allSanctions);
    
    // Check vehicles
    const [vehicles] = await db.execute(`
      SELECT COUNT(*) as count FROM vehicles
    `);
    console.log(`Total vehicles: ${vehicles[0].count}`);
    
    // Check active_move table
    const [activeMove] = await db.execute(`
      SELECT COUNT(*) as count FROM active_move
    `);
    console.log(`Active move records: ${activeMove[0].count}`);
    
    // Get sample data if exists
    if (sanctions[0].count > 0) {
      const [sample] = await db.execute(`
        SELECT 
          ms.vehicle_id, 
          v.vehicle_no AS ba, 
          u.unit_name AS unit, 
          v.vehicle_type
        FROM move_sanctions ms
        JOIN vehicles v ON ms.vehicle_id = v.vehicle_id
        JOIN units u ON v.unit_id = u.unit_id
        WHERE ms.is_active = 1
        LIMIT 5
      `);
      console.log('Sample active sanctions:', sample);
    }
    
    await db.end();
    console.log('✓ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
