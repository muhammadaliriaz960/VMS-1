const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const port = new SerialPort({ path: "COM13", baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

function send(cmd) {
  console.log(`[SEND]: ${cmd}`);
  port.write(`${cmd}\r\n`);
}

port.on("open", () => {
  console.log("=== SOCKET DIAGNOSTIC ===");
  
  // Check socket status
  setTimeout(() => send("AT+QISTATE=0,1"), 1000);
  setTimeout(() => send("AT+QISTATE=0,2"), 2000);
  setTimeout(() => send("AT+QISTATE=0,3"), 3000);
  setTimeout(() => send("AT+QISTATE=0,4"), 4000);
  
  // Exit after 6 seconds
  setTimeout(() => {
    console.log("=== DIAGNOSTIC COMPLETE ===");
    process.exit(0);
  }, 6000);
});

parser.on("data", (line) => {
  const raw = line.trim();
  if (!raw) return;
  console.log(`[MODEM]: ${raw}`);
});
