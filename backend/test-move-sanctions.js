const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sidebar/move-sanctions',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response:', JSON.stringify(jsonData, null, 2));
        console.log(`Found ${jsonData.length} vehicles`);
      } catch (err) {
        console.error('Error parsing JSON:', err.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });

  req.end();
}

testAPI();
