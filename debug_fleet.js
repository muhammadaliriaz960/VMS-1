const http = require('http');

// Test fleet status API to see what data we're getting
async function debugFleetStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/fleet/status',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const fleet = JSON.parse(data);
          console.log(`\n📊 Fleet Status Analysis:`);
          console.log(`Total vehicles: ${fleet.length}`);
          
          // Count by status
          const statusCounts = {};
          fleet.forEach(v => {
            const status = v.vehicle_status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          console.log('\n📈 Vehicle Status Breakdown:');
          Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
          });
          
          // Show sample vehicles for each status
          console.log('\n🔍 Sample Vehicles:');
          const samples = {};
          fleet.forEach(v => {
            if (!samples[v.vehicle_status]) {
              samples[v.vehicle_status] = v;
            }
          });
          
          Object.entries(samples).forEach(([status, vehicle]) => {
            console.log(`\n  ${status} Example:`);
            console.log(`    Vehicle: ${vehicle.vehicle_no}`);
            console.log(`    Speed: ${vehicle.speed}`);
            console.log(`    Last Ping: ${vehicle.last_ping}`);
            console.log(`    Is Faulty: ${vehicle.is_faulty}`);
          });
          
          // Calculate active count the same way as frontend
          const workingCount = fleet.filter(v => v.vehicle_status === 'ACTIVE').length;
          const faultyCount = fleet.filter(v => v.vehicle_status === 'FAULTY' || v.is_faulty === 1).length;
          
          console.log(`\n🎯 Frontend Calculation:`);
          console.log(`  Active Trackers: ${workingCount}`);
          console.log(`  Faulty Trackers: ${faultyCount}`);
          
        } catch (e) {
          console.log(`❌ Error parsing JSON: ${e.message}`);
          console.log(`Raw response: ${data.substring(0, 500)}...`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Request error: ${err.message}`);
      resolve();
    });

    req.end();
  });
}

debugFleetStatus();
