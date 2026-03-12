const mysql = require('mysql2/promise');

async function checkTables() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vms'
  });
  
  console.log('=== DATABASE TABLES ===\n');
  
  const [tables] = await db.execute("SHOW TABLES");
  tables.forEach(t => {
    const tableName = Object.values(t)[0];
    console.log(`  - ${tableName}`);
  });
  
  // Find tables with gps/location data
  console.log('\n=== Tables with gps/location/track in name ===');
  const [gpsTables] = await db.execute(`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'vms' 
    AND (TABLE_NAME LIKE '%gps%' OR TABLE_NAME LIKE '%location%' OR TABLE_NAME LIKE '%track%')
  `);
  
  if (gpsTables.length === 0) {
    console.log('  No GPS/location tables found');
  } else {
    for (const t of gpsTables) {
      const tableName = t.TABLE_NAME;
      console.log(`\n  Table: ${tableName}`);
      
      // Check structure
      const [columns] = await db.execute(`DESCRIBE ${tableName}`);
      columns.forEach(c => {
        console.log(`    - ${c.Field} (${c.Type})`);
      });
      
      // Check count
      const [count] = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`    Records: ${count[0].count}`);
    }
  }
  
  await db.end();
}

checkTables().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
