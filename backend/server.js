const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { WebSocketServer } = require('ws');
const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. WEBSOCKET FOR REAL-TIME UI ---
const wss = new WebSocketServer({ port: 8080 });
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(JSON.stringify(data));
    });
}

// --- 2. MODEM GATEWAY CONFIG ---
const port = new SerialPort({ path: 'COM11', baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const sendAT = (cmd) => {
    console.log(`[AT COMMAND]: ${cmd}`);
    port.write(`${cmd}\r\n`);
};

port.on('open', () => {
    console.log("--- Initializing Tactical Link (4GVMS) ---");
    sendAT("AT+QIDEACT=1");
    setTimeout(() => sendAT('AT+CGDCONT=1,"IP","ufone.corporate"'), 2000);
    setTimeout(() => sendAT("AT+QIACT=1"), 5000);
    setTimeout(() => sendAT('AT+QIOPEN=1,0,"TCP LISTENER","0.0.0.0",0,5000,2'), 8000);
});

// --- 3. DATA ENGINE (GPS PARSER) ---
// --- 3. DATA ENGINE (GPS PARSER) ---
// parser.on('data', async (line) => {
//     const raw = line.trim();
//     if (!raw || !raw.includes("&&")) return; // Only process GPS strings

//     const p = raw.split(',');
//     if (p.length < 10) return;

//     const gps = {
//         imei: p[1],
//         status: p[6], 
//         lat: parseFloat(p[7]),
//         lng: parseFloat(p[8]),
//         speed: parseInt(p[9]) || 0
//     };

//     if (gps.status === 'A') {
//         try {
//             const isNight = (new Date().getHours() >= 19 || new Date().getHours() < 6);

//             // 1. Resolve Vehicle
//             const [asset] = await db.execute(`
//                 SELECT vehicle_id, vehicle_no FROM vehicles WHERE imei = ? LIMIT 1
//             `, [gps.imei]);

//             if (asset.length > 0) {
//                 const { vehicle_id, vehicle_no } = asset[0];

//                 // 2. Update Live Status (Marker)
//                 await db.execute(`
//                     INSERT INTO vehicle_status (vehicle_id, latitude, longitude, speed, last_ping) 
//                     VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE 
//                     latitude=VALUES(latitude), longitude=VALUES(longitude), speed=VALUES(speed), last_ping=NOW()
//                 `, [vehicle_id, gps.lat, gps.lng, gps.speed]);

//                 // 3. Log Movement (Breadcrumb) - FIXED QUERY
//                 // Note: Removed the 6th '?' because NOW() is hardcoded
//                 await db.execute(`
//                     INSERT INTO active_move (vehicle_id, lat, lng, speed, is_night_move, recorded_at) 
//                     VALUES (?, ?, ?, ?, ?, NOW())
//                 `, [vehicle_id, gps.lat, gps.lng, gps.speed, isNight]);

//                 console.log(`\x1b[32m[SUCCESS]\x1b[0m ${vehicle_no} logged to active_move.`);
                
//                 broadcast({ ba: vehicle_no, lat: gps.lat, lng: gps.lng, speed: gps.speed });
//             } else {
//                 console.log(`\x1b[31m[REJECTED]\x1b[0m IMEI ${gps.imei} not linked to any vehicle.`);
//             }
//         } catch (err) { 
//             console.error("\x1b[31m[DB ERROR]\x1b[0m:", err.message); 
//         }
//     }
// });
parser.on('data', async (line) => {
    const raw = line.trim();
    if (!raw) return;

    // 1. Monitor Modem Traffic
    console.log(`\x1b[90m[MODEM]: ${raw}\x1b[0m`);

    // 2. Clear Buffer Notification
    // If the modem says data is waiting, fetch it immediately
    if (raw.includes('+QIURC: "recv",0')) {
        sendAT("AT+QIRD=0,1500");
        return;
    }

    // 3. Process GPS Data
    if (raw.includes("&&")) {
        const p = raw.split(',');
        if (p.length < 10) return;

        const gps = {
            imei: p[1],
            status: p[6], 
            lat: parseFloat(p[7]),
            lng: parseFloat(p[8]),
            speed: parseInt(p[9]) || 0
        };

        if (gps.status === 'A') {
            try {
                const isNight = (new Date().getHours() >= 19 || new Date().getHours() < 6);

                const [asset] = await db.execute(
                    `SELECT vehicle_id, vehicle_no FROM vehicles WHERE imei = ? LIMIT 1`, 
                    [gps.imei]
                );

                if (asset.length > 0) {
                    const { vehicle_id, vehicle_no } = asset[0];

                    // UPDATE BOTH TABLES
                    await Promise.all([
                        db.execute(`
                            INSERT INTO vehicle_status (vehicle_id, latitude, longitude, speed, last_ping) 
                            VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE 
                            latitude=VALUES(latitude), longitude=VALUES(longitude), speed=VALUES(speed), last_ping=NOW()
                        `, [vehicle_id, gps.lat, gps.lng, gps.speed]),
                        
                        db.execute(`
                            INSERT INTO active_move (vehicle_id, lat, lng, speed, is_night_move, recorded_at) 
                            VALUES (?, ?, ?, ?, ?, NOW())
                        `, [vehicle_id, gps.lat, gps.lng, gps.speed, isNight])
                    ]);

                    console.log(`\x1b[32m[FEED OK]\x1b[0m ${vehicle_no} - Point Saved.`);
                    
                    broadcast({ ba: vehicle_no, lat: gps.lat, lng: gps.lng, speed: gps.speed });

                    // 4. THE FIX: Tell modem to move to the next packet in queue
                    // Doing this after the DB write prevents the 5-packet freeze
                    sendAT("AT+QIRD=0,1500"); 

                }
            } catch (err) { 
                console.error("Data Engine Error:", err.message); 
            }
        }
    }
});
// --- 4. API ENDPOINTS ---

/** FLEET & DASHBOARD **/
app.get('/api/fleet/status', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT v.vehicle_no, v.vehicle_type, u.unit_name, 
                   vs.latitude, vs.longitude, vs.speed, vs.last_ping
            FROM vehicles v
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            JOIN units u ON v.unit_id = u.unit_id
            ORDER BY v.vehicle_no ASC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** REPORTS & HISTORY **/
app.get(['/api/sidebar/move-history', '/api/reports/mileage'], async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT v.vehicle_no AS ba, u.unit_name AS unit, 
                   mh.start_lat AS startLat, mh.start_lng AS startLng, 
                   mh.end_lat AS lastLat, mh.end_lng AS lastLng, 
                   mh.total_distance AS total, mh.avg_speed AS currentSpeed,
                   mh.completed_at
            FROM move_history mh
            JOIN vehicles v ON mh.vehicle_id = v.vehicle_id
            JOIN units u ON v.unit_id = u.unit_id
            ORDER BY mh.completed_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** MOVE SANCTION MANAGEMENT **/
app.get('/api/sanctions', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT ms.*, v.vehicle_no, u.unit_name 
            FROM move_sanctions ms 
            JOIN vehicles v ON ms.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            ORDER BY ms.created_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sanctions', async (req, res) => {
    const { vehicle_id, route_from, route_to, start_datetime, end_datetime } = req.body;
    try {
        const [result] = await db.execute(`
            INSERT INTO move_sanctions 
            (vehicle_id, route_from, route_to, start_datetime, end_datetime, status, created_at) 
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW())
        `, [vehicle_id, route_from, route_to, start_datetime, end_datetime]);
        res.status(201).json({ message: "Sanction Issued", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// 3. UPDATE EXISTING SANCTION (The new PUT route)
app.put('/api/sanctions/:id', async (req, res) => {
    const { id } = req.params;
    const { vehicle_id, route_from, route_to, start_datetime, end_datetime } = req.body;
    try {
        const [result] = await db.execute(`
            UPDATE move_sanctions 
            SET vehicle_id = ?, route_from = ?, route_to = ?, 
                start_datetime = ?, end_datetime = ? 
            WHERE sanction_id = ?
        `, [vehicle_id, route_from, route_to, start_datetime, end_datetime, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Sanction record not found" });
        }
        res.json({ message: "Sanction Updated Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. DELETE/REVOKE SANCTION (The new DELETE route)
app.delete('/api/sanctions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute(
            "DELETE FROM move_sanctions WHERE sanction_id = ?", 
            [id]
        );
        res.json({ message: "Sanction Revoked and Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


/** ALERTS & LOGS **/
app.get('/api/sidebar/violations-alerts', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT va.*, v.vehicle_no AS ba, u.unit_name AS unit
            FROM violations_alerts va 
            JOIN vehicles v ON va.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            WHERE va.is_resolved = FALSE ORDER BY va.created_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sidebar/night-move-logs', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT am.*, v.vehicle_no AS ba, u.unit_name AS unit
            FROM active_move am 
            JOIN vehicles v ON am.vehicle_id = v.vehicle_id 
            JOIN units u ON v.unit_id = u.unit_id
            WHERE am.is_night_move = TRUE ORDER BY am.recorded_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/** DROPDOWN HELPERS **/
app.get('/api/units_full', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT unit_id, unit_name FROM units ORDER BY unit_name ASC");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/vehicles/by-unit/:unitId', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT vehicle_id, vehicle_no FROM vehicles WHERE unit_id = ?", [req.params.unitId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/sidebar/violations-alerts', async (req, res) => {
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
//     const [rows] = await db.execute(`
//         SELECT lat, lng, speed, recorded_at as time 
//         FROM active_move 
//         WHERE vehicle_id = ? 
//         ORDER BY recorded_at ASC
//     `, [req.params.vehicleId]);
//     res.json(rows);
// });


// Ensure this matches: http://localhost:5000/api/path/:vehicleId
app.get('/api/path/:vehicleId', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT lat, lng, speed, recorded_at as time 
            FROM active_move 
            WHERE vehicle_id = ? 
            ORDER BY recorded_at ASC
        `, [req.params.vehicleId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/** * ACTIVE MOVEMENT & REPLAY LOGIC 
 * Drives the Map and Sidebar in the frontend
 **/

// 1. Get the list of sanctioned vehicles for the Sidebar
app.get('/api/sidebar/move-sanctions', async (req, res) => {
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
        `);
        console.log(`[REPLAY]: Serving ${rows.length} active sanctions.`);
        res.json(rows);
        console.log(rows);
    } catch (err) {
        console.error("SQL Error in move-sanctions:", err.message);
        res.status(500).json({ error: "Database query failed" });
    }
});

// 2. Get the full coordinate history for a specific vehicle's path
app.get('/api/path/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const [rows] = await db.execute(`
            SELECT 
                lat, 
                lng, 
                speed, 
                recorded_at as time 
            FROM active_move 
            WHERE vehicle_id = ? 
            ORDER BY recorded_at ASC
        `, [vehicleId]);

        // Ensure we send an empty array instead of 404 if no path exists yet
        res.json(rows || []);
        console.log(rows);
    } catch (err) {
        console.error(`Error fetching path for ID ${req.params.vehicleId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log("Tactical VMS Server active on Port 5000"));