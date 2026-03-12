const http = require('http');

function testSanctionsAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sidebar/move-sanctions',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response data:', jsonData);
        console.log(`Number of active sanctions: ${jsonData.length}`);
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

testSanctionsAPI();
