const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const COM_PORT = 'COM11';
const BAUD_RATE = 115200;

const port = new SerialPort({ path: COM_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

function send(cmd) {
    console.log(`\x1b[36m[SENDING]: ${cmd}\x1b[0m`);
    port.write(`${cmd}\r\n`);
}

let isNetworkReady = false;

function setupGateway() {
    console.log(`\n\x1b[44m  RE-INITIALIZING TACTICAL LINK...  \x1b[0m\n`);
    isNetworkReady = false;
    
    // Step 1: Clean up old sessions
    send("AT+QIDEACT=1"); 
    
    // Step 2: Set APN for Ufone Corporate
    setTimeout(() => send('AT+CGDCONT=1,"IP","ufone.corporate"'), 2000);
    
    // Step 3: Activate Data Context
    setTimeout(() => send("AT+QIACT=1"), 5000);
    
    // Step 4: Open Listener on 0.0.0.0 (Wait longer for activation)
    setTimeout(() => send('AT+QIOPEN=1,0,"TCP LISTENER","0.0.0.0",0,5000,2'), 9000);
}

port.on('open', () => {
    console.log(`\x1b[32m[SUCCESS]: COM11 Connected.\x1b[0m`);
    setupGateway();
});

parser.on('data', (line) => {
    const raw = line.trim();
    if (!raw) return;

    console.log(`\x1b[90m[MODEM]: ${raw}\x1b[0m`);

    // --- 1. HANDLE ACTIVATION ERRORS ---
    if (raw.includes("+QIOPEN: 0,562") || raw.includes("+QIOPEN: 0,572")) {
        console.log("\x1b[31m[ERROR]: Socket Busy or Context Error. Retrying in 5s...\x1b[0m");
        setTimeout(setupGateway, 5000);
    }

    // --- 2. SUCCESSFUL ACTIVATION ---
    if (raw.includes("+QIOPEN: 0,0")) {
        isNetworkReady = true;
        console.log("\x1b[42m\x1b[30m SYSTEM LIVE \x1b[0m Listening for Assets on Port 5000...");
    }

    // --- 3. DATA ARRIVAL (The "RECV" URC) ---
    // When the modem says +QIURC: "recv",0 it means data is in the buffer
    if (raw.includes('+QIURC: "recv",0')) {
        console.log(`\x1b[35m[INCOMING]: Data detected in buffer. Fetching...\x1b[0m`);
        // Command the modem to read the data (max 1500 bytes)
        send("AT+QIRD=0,1500");
    }

    // --- 4. CAPTURE DATA PACKET ---
    if (raw.includes("&&")) {
        console.log(`\n\x1b[43m\x1b[30m GPS DATA RECEIVED \x1b[0m`);
        console.log(`\x1b[33m${raw}\x1b[0m\n`);
        
        // This is where you would call broadcast(parseVT100(raw)) 
        // to update your webpage via WebSocket.
    }
});

// HEARTBEAT
setInterval(() => {
    if (isNetworkReady) {
        port.write("AT+CSQ\r\n"); 
    }
}, 30000);