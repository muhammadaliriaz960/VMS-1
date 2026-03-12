const http = require('http');

// Test API endpoints
async function testAPI(endpoint, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`\n✅ ${name} - Status: ${res.statusCode}`);
          console.log(`Data length: ${jsonData.length || 'N/A'}`);
          if (jsonData.length > 0) {
            console.log(`Sample data:`, JSON.stringify(jsonData[0], null, 2));
          }
        } catch (e) {
          console.log(`\n❌ ${name} - Status: ${res.statusCode}`);
          console.log(`Raw response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`\n❌ ${name} - Error: ${err.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  await testAPI('/api/units_full', 'Units API');
  await testAPI('/api/fleet/status', 'Fleet Status API');
  await testAPI('/api/sidebar/violations-alerts', 'Violations Alerts API');
  
  console.log('\n🏁 Tests completed!');
}

runTests();
