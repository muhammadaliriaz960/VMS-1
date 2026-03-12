 const mysql2 = require("mysql2/promise");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const path = require("path");
const sound = require("sound-play");
require("dotenv").config();

// Database connection
const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// PANIC STATE TRACKER    npm install axios for panic location resolution
const panicState = {};
const powerCutState = {}; // State tracker for power cut alerts
let isDraining = false;
const BUFFER_LIMIT = 8000;

const app = express();
app.use(cors());
app.use(express.json());
// Keep latest vehicles for dashboard display
let liveVehicleFeed = [];
let liveFeedBroadcastTimer = null;

// Throttled live feed broadcast to reduce socket overhead and improve performance
function scheduleLiveFeedBroadcast() {
  if (liveFeedBroadcastTimer) return;
  
  liveFeedBroadcastTimer = setTimeout(() => {
    broadcast({ type: "LIVE_FEED", vehicles: liveVehicleFeed });
    liveFeedBroadcastTimer = null;
  }, 1000); // Broadcast at most once per second
}

// --- 1. WEBSOCKET FOR REAL-TIME UI ---
const wss = new WebSocketServer({ port: 8080 });
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

// Track connected clients
const connectedClients = new Map(); // IP -> {socketId, lastSeen}

// Track active sockets for multi-tracker support
const activeSockets = new Set([0, 1, 2, 3, 4]); // Support 5 concurrent trackers
const socketPorts = { 0: 5000, 1: 5001, 2: 5002, 3: 5003, 4: 5004 };

// --- 2. MODEM GATEWAY CONFIG ---
const port = new SerialPort({ path: "COM13", baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const sendAT = (cmd) => {
  console.log(`[AT COMMAND]: ${cmd}`);
  port.write(`${cmd}\r\n`);
};

port.on("open", () => {
  console.log("--- Initializing Tactical Link (4GVMS) ---");
  sendAT("AT");
  sendAT("AT+CREG=2");
  sendAT("AT+CREG?");
  sendAT("AT+QNWINFO");
  sendAT("AT+QIDEACT=1");
  setTimeout(() => sendAT('AT+CGDCONT=1,"IP","ufone.corporate"'), 2000);
  setTimeout(() => sendAT("AT+QIACT=1"), 5000);
  
  // Enable multiple TCP socket support on Quectel
  setTimeout(() => {
    console.log("[MODEM] Enabling multi-socket mode (AT+QIMUX=1)...");
    sendAT("AT+QIMUX=1");
  }, 6000);
  
  // Open multiple listening sockets for Quectel modem
  setTimeout(() => {
    console.log("[MODEM] Opening multiple TCP listening sockets...");
    // Try opening sockets 0-4 with 2 second delay between each
    [0, 1, 2, 3, 4].forEach((socketId, index) => {
      setTimeout(() => {
        console.log(`[MODEM] Opening socket ${socketId} on port ${5000 + socketId}...`);
        sendAT(`AT+QIOPEN=1,${socketId},"TCP LISTENER","0.0.0.0",0,${5000 + socketId},0`);
      }, index * 2000);
    });
    
    // Periodic flush for socket 0 to prevent buffer buildup
    setInterval(() => {
      sendAT("AT+QIRD=0,1500");
    }, 30000); // Flush every 30 seconds
  }, 9000);
});

//--GPS restart interval-- npm install -g pm2    pm2 start server.js --name vms-server –watch    
//-- pm2 logs vms-server
//-- >> pm2 restart vms-server
//-- for restart

let restartTimer;
let countdown = 50;
let countdownInterval;

// Load settings from database on server start
async function loadSettingsFromDatabase() {
  try {
    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM system_settings 
      WHERE is_active = TRUE
    `);
    
    settings.forEach(setting => {
      let value = setting.setting_value;
      if (setting.setting_type === 'number') {
        value = parseInt(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      }
      
      // Update global variables
      switch (setting.setting_key) {
        case 'first_overspeed_limit':
          FIRST_OVERSPEED_LIMIT = value;
          console.log(`Loaded setting: ${setting.setting_key} = ${value}`);
          break;
        case 'second_overspeed_limit':
          SECOND_OVERSPEED_LIMIT = value;
          console.log(`Loaded setting: ${setting.setting_key} = ${value}`);
          break;
        case 'night_move_start':
          NIGHT_MOVE_START = value;
          console.log(`Loaded setting: ${setting.setting_key} = ${value}`);
          break;
        case 'night_move_end':
          NIGHT_MOVE_END = value;
          console.log(`Loaded setting: ${setting.setting_key} = ${value}`);
          break;
      }
    });
    
    console.log(" Settings loaded from database successfully");
  } catch (err) {
    console.error(" Error loading settings from database:", err);
  }
}

// Load settings when server starts
loadSettingsFromDatabase();

// Global variables for night move settings
let NIGHT_MOVE_START = "22:00";
let NIGHT_MOVE_END = "05:00";

// Global variables to store overspeed limits
let FIRST_OVERSPEED_LIMIT = 60;
let SECOND_OVERSPEED_LIMIT = 80;

function resetRestartTimer() {
  if (restartTimer) clearTimeout(restartTimer);
  if (countdownInterval) clearInterval(countdownInterval);

  countdown = 50;

  countdownInterval = setInterval(() => {
    process.stdout.write(
      `\r\x1b[33m[SERVER] Restart in ${countdown}s if no GPS...\x1b[0m`
    );
    countdown--;
    if (countdown < 0) clearInterval(countdownInterval);
  }, 1000);

  restartTimer = setTimeout(() => {
    clearInterval(countdownInterval);
    console.log(
      "\n\x1b[33m[SERVER] No GPS data received for 50 seconds. Restarting...\x1b[0m"
    );

    if (port && port.isOpen) {
      port.close(() => {
        console.log("[SERIAL PORT] Closed safely before restart.");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }, 50000);
}

resetRestartTimer();
// --- 3. DATA ENGINE (GPS PARSER) ---
parser.on("data", (line) => {
  const raw = line.trim();
  if (!raw) return;

  // 1. Monitor Modem Traffic
  console.log(`\x1b[90m[MODEM]: ${raw}\x1b[0m`);

  // 2. Handle socket open errors and status
  if (raw.includes("+QIOPEN:")) {
    const match = raw.match(/\+QIOPEN:\s*(\d+),(\d+)/);
    if (match) {
      const [, socketId, errorCode] = match;
      if (errorCode === "0") {
        console.log(`\x1b[32m[SOCKET ${socketId}] Opened successfully\x1b[0m`);
      } else {
        console.log(`\x1b[31m[SOCKET ${socketId}] Error: ${errorCode}\x1b[0m`);
        // Retry after 10 seconds
        setTimeout(() => {
          console.log(`[MODEM] Retrying socket ${socketId}...`);
          sendAT(`AT+QIOPEN=1,${socketId},"TCP LISTENER","0.0.0.0",0,${5000 + parseInt(socketId)},0`);
        }, 10000);
      }
    }
  }

  // Handle incoming connections
  if (raw.includes('+QIURC: "incoming"')) {
    const match = raw.match(/\+QIURC:\s*"incoming",\d+,\d+,"([\d.]+)"/);
    if (match) {
      const clientIp = match[1];
      console.log(`\x1b[33m[CLIENT] Incoming connection from ${clientIp}\x1b[0m`);
      connectedClients.set(clientIp, { lastSeen: Date.now() });
    }
  }

  // Handle PDP deactivation - reopen all sockets
  if (raw.includes('pdpdeact') || raw.includes("NO CARRIER")) {
    console.log("\x1b[31m[WARNING] PDP deactivated or connection lost. Reopening sockets in 5s...\x1b[0m");
    setTimeout(() => {
      console.log("[MODEM] Reopening all sockets...");
      [0, 1, 2, 3, 4].forEach((socketId, index) => {
        setTimeout(() => {
          sendAT(`AT+QIOPEN=1,${socketId},"TCP LISTENER","0.0.0.0",0,${5000 + socketId},0`);
        }, index * 2000);
      });
    }, 5000);
  }

  // Handle QISTATE response
  if (raw.includes("+QISTATE:")) {
    console.log(`\x1b[36m[SOCKET STATUS] ${raw}\x1b[0m`);
  }

  // 3. Handle data from any socket (0-4)
  const recvMatch = raw.match(/\+QIURC:\s*"recv",(\d+)/);
  if (recvMatch) {
    const socketId = recvMatch[1];
    setImmediate(() => sendAT(`AT+QIRD=${socketId},1500`));
    return;
  }
  
  // Handle incoming full - flush the buffer
  if (raw.includes('+QIURC: "incoming full"')) {
    const fullMatch = raw.match(/\+QIURC:\s*"incoming full",(\d+)/);
    if (fullMatch) {
      const socketId = fullMatch[1];
      console.log(`\x1b[33m[SOCKET ${socketId}] Buffer full - flushing...\x1b[0m`);
      setImmediate(() => sendAT(`AT+QIRD=${socketId},1500`));
      return;
    }
  }
  
  if (raw.includes("&&")) {
    resetRestartTimer();
    // Process GPS data immediately without waiting (fire-and-forget)
    processGPSData(raw);
  }
});

async function processGPSData(raw) {
  try {
    const p = raw.split(",");
    if (p.length < 10) return;

    const alarmCode = parseInt(p[3]);
    const gps = {
      imei: p[1],
      status: p[6],
      lat: parseFloat(p[7]),
      lng: parseFloat(p[8]),
      speed: parseInt(p[11]) || 0,
      panic: alarmCode === 1,
      power_cut: alarmCode === 18,
    };

    if (gps.status !== "A" || !gps.lat || !gps.lng) return;

    const [asset] = await db.execute(
      `
      SELECT v.vehicle_id, v.vehicle_no, u.unit_name
      FROM vehicles v
      JOIN units u ON v.unit_id = u.unit_id
      WHERE v.imei = ?
      LIMIT 1
      `,
      [gps.imei],
    );

    if (asset.length === 0) return;

    const { vehicle_id, vehicle_no, unit_name } = asset[0];
    const isNight = new Date().getHours() >= 19 || new Date().getHours() < 6;

    const dbPromises = [];

    // 1. Core Data Logging (can be parallelized)
    dbPromises.push(db.execute(
      `
      INSERT INTO vehicle_status (vehicle_id, latitude, longitude, speed, last_ping) 
      VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE 
      latitude=VALUES(latitude), longitude=VALUES(longitude), speed=VALUES(speed), last_ping=NOW()
      `,
      [vehicle_id, gps.lat, gps.lng, gps.speed],
    ));

    dbPromises.push(db.execute(
      `
      INSERT INTO active_move (vehicle_id, lat, lng, speed, is_night_move, recorded_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [vehicle_id, gps.lat, gps.lng, gps.speed, isNight],
    ));

    // 2. Alert Handling
    // Panic: Has external API call, so run without await to avoid blocking main thread
    if (gps.panic && !panicState[vehicle_id]) {
      panicState[vehicle_id] = true;
      handlePanicAlert(vehicle_id, vehicle_no, gps);
    } else if (!gps.panic && panicState[vehicle_id]) {
      panicState[vehicle_id] = false;
    }

    // External Power Cut: Similar to panic handling
    if (gps.power_cut && !powerCutState[vehicle_id]) {
      powerCutState[vehicle_id] = true;
      handlePowerCutAlert(vehicle_id, vehicle_no, gps);
    } else if (!gps.power_cut && powerCutState[vehicle_id]) {
      powerCutState[vehicle_id] = false;
    }

    // Overspeed: Simple insert, can be parallelized
    if (gps.speed > SECOND_OVERSPEED_LIMIT) {
      dbPromises.push(createOverspeedAlert(vehicle_id, vehicle_no, gps));
    }

    // Unsanctioned Move: Complex logic (SELECT -> SELECT -> INSERT), encapsulate and run in parallel
    dbPromises.push(handleUnsanctionedMove(vehicle_id, vehicle_no, gps));

    // Execute all parallelizable DB operations
    await Promise.all(dbPromises);

    // 3. Live Feed & UI Updates (synchronous logic + broadcast)
     updateLiveFeed(vehicle_no, unit_name, gps);
 
     console.log(`\x1b[32m[FEED OK]\x1b[0m ${vehicle_no} - Point Saved.`);
     
     // Throttled individual vehicle update
     broadcast({
       ba: vehicle_no,
       unit: unit_name,
       lat: gps.lat,
       lng: gps.lng,
       speed: gps.speed,
     });
 
     // Live feed broadcast is now handled by a central throttled timer for better performance
     scheduleLiveFeedBroadcast();

    // Debug logs
    console.log(`[SPEED DEBUG] Vehicle ${vehicle_no} has speed: ${gps.speed}`);
    console.log(`[LIVE FEED DEBUG] Current vehicles: ${liveVehicleFeed.length}`);
    liveVehicleFeed.forEach(v => {
      console.log(`  - ${v.ba}: speed ${v.speed}, lat ${v.lat}, lng ${v.lng}`);
    });

  } catch (err) {
    console.error("Data Engine Error:", err.message);
  }
}

// --- GPS Data Processing Helpers ---

async function handlePanicAlert(vehicle_id, vehicle_no, gps) {
  try {
    // Play sound
    const { spawn } = require('child_process');
    const soundFile = path.join(__dirname, "sounds", "panic.wav");
    if (process.platform === 'win32') {
      spawn('powershell', ['-Command', `(New-Object Media.SoundPlayer "${soundFile.replace(/\\/g, '\\\\')}").PlaySync();`], { stdio: 'ignore', detached: true }).unref();
    } else {
      sound.play(soundFile);
    }

    // Reverse geocode
    let locationName = "Unknown Location";
    try {
      const axios = require("axios");
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { lat: gps.lat, lon: gps.lng, format: "json" },
        headers: { "User-Agent": "tactical-vms-system" }
      });
      locationName = response.data.display_name || locationName;
    } catch (err) {
      console.error("Geocoding API error:", err.message);
    }

    // Insert alert into DB
    await db.execute(
      `INSERT INTO violations_alerts (vehicle_id, latitude, longitude, location_name, alert_type, details, is_resolved, created_at)
       VALUES (?, ?, ?, ?, 'SOS_TRIGGER', 'Panic button pressed', FALSE, NOW())`,
      [vehicle_id, gps.lat, gps.lng, locationName]
    );

    console.log(` PANIC ALERT from ${vehicle_no} at ${locationName}`);
    broadcast({ type: "PANIC", ba: vehicle_no, lat: gps.lat, lng: gps.lng, location: locationName });
  } catch (err) {
    console.error("Panic Alert Error:", err.message);
  }
}

async function handlePowerCutAlert(vehicle_id, vehicle_no, gps) {
  try {
    // Play warning sound
    const { spawn } = require('child_process');
    const soundFile = path.join(__dirname, "sounds", "warning.wav"); 
    if (process.platform === 'win32') {
      spawn('powershell', ['-Command', `(New-Object Media.SoundPlayer "${soundFile.replace(/\\/g, '\\\\')}").PlaySync();`], { stdio: 'ignore', detached: true }).unref();
    } else {
      sound.play(soundFile);
    }

    // Insert alert into DB
    await db.execute(
      `INSERT INTO violations_alerts (vehicle_id, latitude, longitude, location_name, alert_type, details, is_resolved, created_at)
       VALUES (?, ?, ?, 'Unknown Location', 'POWER_CUT', 'Tracker disconnected from external power source', FALSE, NOW())`,
      [vehicle_id, gps.lat, gps.lng]
    );

    console.log(` POWER CUT ALERT from ${vehicle_no}`);
    broadcast({ type: "POWER_CUT", ba: vehicle_no, lat: gps.lat, lng: gps.lng });
  } catch (err) {
    console.error("Power Cut Alert Error:", err.message);
  }
}

async function createOverspeedAlert(vehicle_id, vehicle_no, gps) {
  await db.execute(
    `INSERT INTO violations_alerts (vehicle_id, latitude, longitude, location_name, alert_type, details, is_resolved, created_at)
     VALUES (?, ?, ?, 'Unknown Location', 'OVERSPEED', ?, FALSE, NOW())`,
    [vehicle_id, gps.lat, gps.lng, `Speed: ${gps.speed} km/h (Exceeded ${SECOND_OVERSPEED_LIMIT} km/h limit)`]
  );
  console.log(` OVERSPEED ALERT from ${vehicle_no} - ${gps.speed} km/h (Exceeded ${SECOND_OVERSPEED_LIMIT} km/h)`);
  broadcast({ type: "OVERSPEED", ba: vehicle_no, lat: gps.lat, lng: gps.lng, speed: gps.speed });
}

async function handleUnsanctionedMove(vehicle_id, vehicle_no, gps) {
  if (gps.speed <= 0) return;

  const [sanctionCheck] = await db.execute(
    `SELECT sanction_id FROM move_sanctions 
     WHERE vehicle_id = ? AND start_datetime <= NOW() AND end_datetime >= NOW() AND status = 'ACTIVE'
     LIMIT 1`,
    [vehicle_id]
  );

  if (sanctionCheck.length === 0) {
    const [existingViolation] = await db.execute(
      `SELECT alert_id FROM violations_alerts 
       WHERE vehicle_id = ? AND alert_type = 'UNSANCTIONED_MOVE' AND is_resolved = FALSE
       LIMIT 1`,
      [vehicle_id]
    );

    if (existingViolation.length === 0) {
      await db.execute(
        `INSERT INTO violations_alerts (vehicle_id, latitude, longitude, location_name, alert_type, details, is_resolved, created_at)
         VALUES (?, ?, ?, 'Unknown Location', 'UNSANCTIONED_MOVE', ?, FALSE, NOW())`,
        [vehicle_id, gps.lat, gps.lng, `Vehicle moving without valid sanction at ${gps.speed} km/h`]
      );
      console.log(` UNSANCTIONED MOVEMENT from ${vehicle_no} - ${gps.speed} km/h`);
      broadcast({ type: "UNSANCTIONED_MOVE", ba: vehicle_no, lat: gps.lat, lng: gps.lng, speed: gps.speed });
    }
  }
}

function updateLiveFeed(vehicle_no, unit_name, gps) {
  const existingIndex = liveVehicleFeed.findIndex(v => v.ba === vehicle_no);

  const vehicleData = {
    ba: vehicle_no,
    unit: unit_name,
    speed: gps.speed,
    lat: gps.lat,
    lng: gps.lng,
    last_ping: new Date().toISOString(),
    last_update: Date.now()
  };

  if (existingIndex !== -1) {
    liveVehicleFeed[existingIndex] = vehicleData;
  } else {
    liveVehicleFeed.unshift(vehicleData);
    if (liveVehicleFeed.length > 50) liveVehicleFeed.pop();
  }

  // Cleanup vehicles that haven't been updated for 30 seconds
  const thirtySecondsAgo = Date.now() - 30000;
  liveVehicleFeed = liveVehicleFeed.filter(v => v.last_update > thirtySecondsAgo);
}

/** FLEET & DASHBOARD **/
app.get("/api/fleet/status", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT v.vehicle_id, v.vehicle_no, v.vehicle_type, u.unit_name, 
                   vs.latitude, vs.longitude, vs.speed, vs.last_ping,
                   CASE 
                     WHEN vs.last_ping IS NULL THEN 'OFFLINE'
                     WHEN vs.last_ping < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 'FAULTY'
                     WHEN vs.last_ping >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 'ACTIVE'
                     WHEN vs.speed > 0 THEN 'ACTIVE'
                     ELSE 'PARKED'
                   END as vehicle_status,
                   CASE 
                     WHEN vs.last_ping < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1
                     ELSE 0
                   END as is_faulty,
                   v.is_blocked
            FROM vehicles v
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            JOIN units u ON v.unit_id = u.unit_id
            ORDER BY v.vehicle_no ASC
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** REPORTS & HISTORY **/
app.get(
  ["/api/sidebar/move-history", "/api/reports/mileage"],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let query = `
        SELECT v.vehicle_no AS ba, u.unit_name AS unit, 
               mh.start_lat AS startLat, mh.start_lng AS startLng, 
               mh.end_lat AS lastLat, mh.end_lng AS lastLng, 
               mh.total_distance AS total, mh.avg_speed AS currentSpeed,
               mh.completed_at
        FROM move_history mh
        JOIN vehicles v ON mh.vehicle_id = v.vehicle_id
        JOIN units u ON v.unit_id = u.unit_id
      `;
      const params = [];

      if (startDate && endDate) {
        query += ` WHERE DATE(mh.completed_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ` WHERE DATE(mh.completed_at) = ?`;
        params.push(startDate);
      }

      query += ` ORDER BY mh.completed_at DESC`;

      const [rows] = await db.execute(query, params);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

/** MOVE SANCTION MANAGEMENT **/
app.get("/api/sanctions", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT ms.*, v.vehicle_no, u.unit_name 
            FROM move_sanctions ms 
            JOIN vehicles v ON ms.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            ORDER BY ms.created_at DESC
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sanctions", async (req, res) => {
  const { vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no } =
    req.body;
  
  // Debug: Log what we're receiving
  console.log("POST /api/sanctions received:", req.body);
  console.log("Driver name:", driver_name);
  console.log("Contact no:", contact_no);
  console.log("Purpose:", purpose);
  
  try {
    console.log("About to execute INSERT with values:", [vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no]);
    const [result] = await db.execute(
      `
            INSERT INTO move_sanctions 
            (vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())
        `,
      [vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no],
    );
    console.log("Insert successful:", result);
    res.status(201).json({ message: "Sanction Issued", id: result.insertId });
  } catch (err) {
    console.error("Insert error details:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE EXISTING SANCTION (The new PUT route)
app.put("/api/sanctions/:id", async (req, res) => {
  const { id } = req.params;
  const { vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no } =
    req.body;
  try {
    const [result] = await db.execute(
      `
            UPDATE move_sanctions 
            SET vehicle_id = ?, route_from = ?, route_to = ?, 
                start_datetime = ?, end_datetime = ?, driver_name = ?, purpose = ?, contact_no = ?
            WHERE sanction_id = ?
        `,
      [vehicle_id, route_from, route_to, start_datetime, end_datetime, driver_name, purpose, contact_no, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sanction record not found" });
    }
    res.json({ message: "Sanction Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE/REVOKE SANCTION (The new DELETE route)
app.delete("/api/sanctions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM move_sanctions WHERE sanction_id = ?",
      [id],
    );
    res.json({ message: "Sanction Revoked and Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ALERTS & LOGS **/
app.get("/api/sidebar/night-move-logs", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT am.*, v.vehicle_no AS ba, u.unit_name AS unit
            FROM active_move am 
            JOIN vehicles v ON am.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            WHERE am.is_night_move = TRUE ORDER BY am.recorded_at DESC
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DROPDOWN HELPERS **/
app.get("/api/units_full", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT unit_id, unit_name FROM units ORDER BY unit_name ASC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/vehicles/by-unit/:unitId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT vehicle_id, vehicle_no FROM vehicles WHERE unit_id = ?",
      [req.params.unitId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/units", async (req, res) => {
  try {
    const { unit_name } = req.body;
    
    if (!unit_name) {
      return res.status(400).json({ error: "Unit name is required" });
    }
    
    const [result] = await db.execute(
      "INSERT INTO units (unit_name) VALUES (?)",
      [unit_name]
    );
    
    res.status(201).json({ 
      message: "Unit created successfully", 
      unit_id: result.insertId,
      unit_name: unit_name
    });
  } catch (err) {
    console.error("Error creating unit:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const { vehicle_no, vehicle_type, unit_id, status } = req.body;
    
    if (!vehicle_no || !vehicle_type || !unit_id) {
      return res.status(400).json({ error: "Vehicle number, type, and unit are required" });
    }
    
    const [result] = await db.execute(
      "INSERT INTO vehicles (vehicle_no, vehicle_type, unit_id, status) VALUES (?, ?, ?, ?)",
      [vehicle_no, vehicle_type, unit_id, status || 'ACTIVE']
    );
    
    res.status(201).json({ 
      message: "Vehicle created successfully", 
      vehicle_id: result.insertId,
      vehicle_no: vehicle_no
    });
  } catch (err) {
    console.error("Error creating vehicle:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/units/:id", async (req, res) => {
  try {
    const unitId = req.params.id;
    
    // First delete all vehicles associated with this unit
    await db.execute("DELETE FROM vehicles WHERE unit_id = ?", [unitId]);
    
    // Then delete the unit
    const [result] = await db.execute("DELETE FROM units WHERE unit_id = ?", [unitId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Unit not found" });
    }
    
    res.json({ message: "Unit and associated vehicles deleted successfully" });
  } catch (err) {
    console.error("Error deleting unit:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    const [result] = await db.execute("DELETE FROM vehicles WHERE vehicle_id = ?", [vehicleId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/sidebar/violations-alerts", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT 
                va.alert_id,
                va.alert_type,
                va.details,
                va.is_resolved,
                va.created_at,
                v.vehicle_no AS ba, 
                u.unit_name AS unit
            FROM violations_alerts va 
            JOIN vehicles v ON va.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            WHERE va.is_resolved = FALSE 
            ORDER BY va.created_at DESC
        `);
    res.json(rows);
  } catch (err) {
    console.error("Alerts Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// app.get('/api/path/:vehicleId', async (req, res) => {

// Ensure this matches: http://localhost:5000/api/path/:vehicleId
app.get("/api/path/:vehicleId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
            SELECT * FROM (
            SELECT lat, lng, speed, recorded_at as time 
            FROM active_move 
            WHERE vehicle_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL 15 SECOND)
            ORDER BY recorded_at DESC
            LIMIT 10
        ) AS sub ORDER BY time ASC
        `,
      [req.params.vehicleId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full path history for Active Move page
app.get("/api/path-full/:vehicleId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
            SELECT lat, lng, speed, recorded_at as time 
            FROM active_move 
            WHERE vehicle_id = ? 
            ORDER BY recorded_at ASC
        `,
      [req.params.vehicleId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch fetch paths for multiple vehicles to improve performance
app.post("/api/path-batch", async (req, res) => {
  try {
    const { vehicleIds } = req.body;
    if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.json({});
    }

    // Using a more efficient query for large datasets
    const [rows] = await db.execute(
      `
            SELECT vehicle_id, lat, lng, speed, recorded_at as time 
            FROM active_move 
            WHERE vehicle_id IN (${vehicleIds.map(() => '?').join(',')})
            AND recorded_at >= DATE_SUB(NOW(), INTERVAL 15 SECOND)
            ORDER BY recorded_at ASC
        `,
      vehicleIds,
    );

    const pathMap = {};
    rows.forEach(row => {
      if (!pathMap[row.vehicle_id]) pathMap[row.vehicle_id] = [];
      pathMap[row.vehicle_id].push({
        lat: row.lat,
        lng: row.lng,
        speed: row.speed,
        time: row.time
      });
    });
    res.json(pathMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ACTIVE MOVEMENT & REPLAY LOGIC
 * Drives the Map and Sidebar in the frontend
 **/

// 1. Get the list of sanctioned vehicles for the Sidebar
app.get("/api/sidebar/move-sanctions", async (req, res) => {
  try {
    const [rows] = await db.execute(`
            SELECT 
                ms.vehicle_id, 
                v.vehicle_no AS ba, 
                u.unit_name AS unit, 
                v.vehicle_type
            FROM move_sanctions ms
            JOIN vehicles v ON ms.vehicle_id = v.vehicle_id
            JOIN units u ON v.unit_id = u.unit_id
            WHERE ms.status = 'ACTIVE'
            ORDER BY ms.created_at DESC
        `);
    console.log(`[REPLAY]: Serving ${rows.length} active sanctions.`);
    res.json(rows);
    console.log(rows);
  } catch (err) {
    console.error("SQL Error in move-sanctions:", err.message);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Manual endpoint to trigger sanction cleanup (for testing/admin)
app.post("/api/sanctions/cleanup", async (req, res) => {
  try {
    await deactivateExpiredSanctions();
    res.json({ message: "Sanction cleanup completed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** SETTINGS MANAGEMENT **/
// Get all settings
app.get("/api/settings", async (req, res) => {
  try {
    const [settings] = await db.execute(`
      SELECT setting_key, setting_value, setting_type, description
      FROM system_settings 
      WHERE is_active = TRUE
      ORDER BY setting_key
    `);
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      // Convert based on type
      let value = setting.setting_value;
      if (setting.setting_type === 'number') {
        value = parseInt(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      }
      settingsObj[setting.setting_key] = value;
    });
    
    res.json(settingsObj);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update settings
app.post("/api/settings", async (req, res) => {
  try {
    const settings = req.body;
    const updatePromises = [];
    
    for (const [key, value] of Object.entries(settings)) {
      // Get setting type first
      const [typeResult] = await db.execute(`
        SELECT setting_type FROM system_settings 
        WHERE setting_key = ? AND is_active = TRUE
      `, [key]);
      
      if (typeResult.length === 0) {
        console.warn(`Setting ${key} not found, skipping`);
        continue;
      }
      
      // Convert value to string for storage
      let stringValue = String(value);
      
      updatePromises.push(
        db.execute(`
          UPDATE system_settings 
          SET setting_value = ?, updated_at = NOW()
          WHERE setting_key = ? AND is_active = TRUE
        `, [stringValue, key])
      );
    }
    
    await Promise.all(updatePromises);
    
    // Update global variables
    if (settings.first_overspeed_limit) {
      FIRST_OVERSPEED_LIMIT = parseInt(settings.first_overspeed_limit);
      console.log(`Updated overspeed limit: ${FIRST_OVERSPEED_LIMIT}`);
    }
    if (settings.second_overspeed_limit) {
      SECOND_OVERSPEED_LIMIT = parseInt(settings.second_overspeed_limit);
      console.log(`Updated overspeed limit: ${SECOND_OVERSPEED_LIMIT}`);
    }
    if (settings.night_move_start) {
      NIGHT_MOVE_START = settings.night_move_start;
      console.log(`Updated night move start: ${NIGHT_MOVE_START}`);
    }
    if (settings.night_move_end) {
      NIGHT_MOVE_END = settings.night_move_end;
      console.log(`Updated night move end: ${NIGHT_MOVE_END}`);
    }
    
    console.log("Settings updated successfully:", settings);
    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy overspeed limits endpoints (for backward compatibility)
app.get("/api/settings/overspeed-limits", (req, res) => {
  res.json({
    first: FIRST_OVERSPEED_LIMIT,
    second: SECOND_OVERSPEED_LIMIT
  });
});

app.post("/api/settings/overspeed-limits", (req, res) => {
  const { first, second } = req.body;
  if (first && second && first > 0 && second > first) {
    FIRST_OVERSPEED_LIMIT = parseInt(first);
    SECOND_OVERSPEED_LIMIT = parseInt(second);
    
    // Update database
    db.execute(`
      UPDATE system_settings 
      SET setting_value = ?, updated_at = NOW()
      WHERE setting_key = 'first_overspeed_limit'
    `, [String(first)]).then(() => {
      return db.execute(`
        UPDATE system_settings 
        SET setting_value = ?, updated_at = NOW()
        WHERE setting_key = 'second_overspeed_limit'
      `, [String(second)]);
    }).then(() => {
      console.log(`Updated overspeed limits: First=${FIRST_OVERSPEED_LIMIT}, Second=${SECOND_OVERSPEED_LIMIT}`);
      res.json({ 
        message: "Overspeed limits updated successfully",
        first: FIRST_OVERSPEED_LIMIT,
        second: SECOND_OVERSPEED_LIMIT
      });
    }).catch(err => {
      console.error("Error updating overspeed limits in database:", err);
      res.status(500).json({ error: "Failed to update database" });
    });
  } else {
    res.status(400).json({ error: "Invalid limits. Second limit must be greater than first limit." });
  }
});

// Get sanction statistics
app.get("/api/sanctions/stats", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM move_sanctions
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTO-DEACTIVATE EXPIRED SANCTIONS (Runs daily at midnight)
const deactivateExpiredSanctions = async () => {
  try {
    const [result] = await db.execute(
      `UPDATE move_sanctions 
       SET status = 'EXPIRED' 
       WHERE status = 'ACTIVE' 
       AND end_datetime < NOW()`
    );
    
    if (result.affectedRows > 0) {
      console.log(`[AUTO-DEACTIVATE] ${result.affectedRows} expired sanctions deactivated at ${new Date().toLocaleString()}`);
      
      // Broadcast to all connected clients about status changes
      broadcast({
        type: "SANCTIONS_UPDATED",
        message: `${result.affectedRows} sanctions automatically expired`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("Auto-deactivation error:", err.message);
  }
};

// Schedule daily check at midnight (00:00)
const scheduleDailyCleanup = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow - now;
  
  setTimeout(() => {
    deactivateExpiredSanctions();
    // Schedule to run every 24 hours
    setInterval(deactivateExpiredSanctions, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  console.log(`[SCHEDULER] Daily sanction cleanup scheduled for ${tomorrow.toLocaleString()}`);
};

// Start the scheduler
scheduleDailyCleanup();

// Also run on server startup
deactivateExpiredSanctions();

// Periodic cleanup of live feed (every 30 seconds)
setInterval(() => {
  const beforeLength = liveVehicleFeed.length;
  // Just clean up stale updates (older than 1 minute)
  const oneMinuteAgo = Date.now() - 60000;
  liveVehicleFeed = liveVehicleFeed.filter(v => v.last_update > oneMinuteAgo);
  const afterLength = liveVehicleFeed.length;
  
  if (beforeLength !== afterLength) {
    console.log(`[PERIODIC CLEANUP] Removed ${beforeLength - afterLength} stale vehicles from live feed`);
    broadcast({
      type: "LIVE_FEED",
      vehicles: liveVehicleFeed
    });
  }
}, 30000); // Every 30 seconds

// Also add immediate cleanup on server start
setTimeout(() => {
  console.log("[STARTUP CLEANUP] Refreshing live feed...");
  broadcast({
    type: "LIVE_FEED",
    vehicles: liveVehicleFeed
  });
}, 5000); // 5 seconds after server starts

app.listen(5000, () => console.log("Tactical VMS Server active on Port 5000"));

// sanctioned moves
app.get("/api/fleet/sanction-status", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          v.vehicle_id,
          v.vehicle_no,
          v.vehicle_type,
          u.unit_name,

          CASE 
              WHEN ms.sanction_id IS NULL THEN 'UNSANCTIONED'
              ELSE 'SANCTIONED'
          END AS sanction_status,

          ms.route_from,
          ms.route_to,
          ms.start_datetime,
          ms.end_datetime

      FROM vehicles v
      JOIN units u ON v.unit_id = u.unit_id

      LEFT JOIN move_sanctions ms 
          ON ms.vehicle_id = v.vehicle_id
          AND ms.status = 'ACTIVE'
          AND NOW() BETWEEN ms.start_datetime AND ms.end_datetime

      ORDER BY v.vehicle_no
    `);

    res.json(rows);
  } catch (err) {
    console.error("Sanction Status Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- PROFILE MANAGEMENT API ENDPOINTS ---

// Get all profiles
app.get("/api/profiles", async (req, res) => {
  try {
    const [profiles] = await db.query(`
      SELECT p.*, u.unit_name 
      FROM profiles p 
      LEFT JOIN units u ON p.unit_id = u.unit_id 
      ORDER BY p.created_at DESC
    `);
    res.json(profiles);
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single profile by ID
app.get("/api/profiles/:id", async (req, res) => {
  try {
    const [profiles] = await db.query(`
      SELECT p.*, u.unit_name 
      FROM profiles p 
      LEFT JOIN units u ON p.unit_id = u.unit_id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profiles[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new profile
app.post("/api/profiles", async (req, res) => {
  try {
    const { username, password, full_name, email, role, unit_id, contact_number } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Check if username already exists
    const [existing] = await db.query("SELECT id FROM profiles WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    const [result] = await db.query(`
      INSERT INTO profiles (username, password, full_name, email, role, unit_id, contact_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, password, full_name, email, role, unit_id, contact_number]);
    
    res.status(201).json({ 
      message: "Profile created successfully", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update profile
app.put("/api/profiles/:id", async (req, res) => {
  try {
    const { username, password, full_name, email, role, unit_id, contact_number, is_active } = req.body;
    const profileId = req.params.id;
    
    // Check if profile exists
    const [existing] = await db.query("SELECT id FROM profiles WHERE id = ?", [profileId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    // Check if username is being changed and if it already exists
    if (username) {
      const [usernameCheck] = await db.query("SELECT id FROM profiles WHERE username = ? AND id != ?", [username, profileId]);
      if (usernameCheck.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (username !== undefined) {
      updateFields.push("username = ?");
      updateValues.push(username);
    }
    if (password !== undefined) {
      updateFields.push("password = ?");
      updateValues.push(password);
    }
    if (full_name !== undefined) {
      updateFields.push("full_name = ?");
      updateValues.push(full_name);
    }
    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (role !== undefined) {
      updateFields.push("role = ?");
      updateValues.push(role);
    }
    if (unit_id !== undefined) {
      updateFields.push("unit_id = ?");
      updateValues.push(unit_id);
    }
    if (contact_number !== undefined) {
      updateFields.push("contact_number = ?");
      updateValues.push(contact_number);
    }
    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(is_active);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    updateValues.push(profileId);
    
    await db.query(`
      UPDATE profiles 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `, updateValues);
    
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete profile
app.delete("/api/profiles/:id", async (req, res) => {
  try {
    const profileId = req.params.id;
    
    // Check if profile exists
    const [existing] = await db.query("SELECT id FROM profiles WHERE id = ?", [profileId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    // Prevent deletion of admin users (optional safety measure)
    const [adminCheck] = await db.query("SELECT role FROM profiles WHERE id = ?", [profileId]);
    if (adminCheck[0]?.role === 'admin') {
      return res.status(400).json({ error: "Cannot delete admin profiles" });
    }
    
    await db.query("DELETE FROM profiles WHERE id = ?", [profileId]);
    
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ error: err.message });
  }
});

// Authenticate user (for login)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    const [profiles] = await db.query(`
      SELECT p.*, u.unit_name 
      FROM profiles p 
      LEFT JOIN units u ON p.unit_id = u.unit_id 
      WHERE p.username = ? AND p.password = ? AND p.is_active = 1
    `, [username, password]);
    
    if (profiles.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const profile = profiles[0];
    
    // Update last login
    await db.query("UPDATE profiles SET last_login = NOW() WHERE id = ?", [profile.id]);
    
    // Remove password from response
    delete profile.password;
    
    res.json({ 
      message: "Login successful", 
      user: profile 
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: err.message });
  }
});

//-- npm install sound-play      for sound alerts on panic/overspeed