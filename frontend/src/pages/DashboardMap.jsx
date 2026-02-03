import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Marker, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Assets
import signalsLogo from "../assets/images/UnitLogo3.png";
import jeepIconImg from "../assets/images/jeep.png";
import Ton5Img from "../assets/images/5Ton.png";

const hierarchy = {
  "340 BDE": {
    color: "#ff4d4d",
    locations: [
      { name: "Phalodran", pos: [34.8491, 73.5725] },
      { name: "Penstok", pos: [34.7676, 73.5258] },
      { name: "Paras", pos: [34.6625, 73.4624] },
      { name: "Rashakai", pos: [34.0664, 72.1441] },
      { name: "Havelian", pos: [34.0358, 73.1157] }
    ]
  },
  "341 BDE": {
    color: "#3498db",
    locations: [
      { name: "Multan", pos: [30.1741, 71.3913] },
      { name: "RCM", pos: [30.1176, 71.5233] },
      { name: "QASP", pos: [29.3248, 71.9189] },
      { name: "SCFPP", pos: [30.7129, 73.2392] },
      { name: "Okara", pos: [30.8138, 73.4533] }
    ]
  },
  "342 BDE": {
    color: "#f1c40f",
    locations: [
      { name: "Lahore", pos: [31.4787, 74.4160] },
      { name: "TNB", pos: [31.4940, 74.2438] },
      { name: "Balloki", pos: [31.0367, 73.9267] }
    ]
  },
  "34 DIV ARTY": {
    color: "#9b59b6",
    locations: [
      { name: "GWA", pos: [32.1475, 74.1914] },
      { name: "Sialkot", pos: [32.5162, 74.5639] },
      { name: "KHPP", pos: [33.6016, 73.6075] },
      { name: "Wah Cantt", pos: [33.7715, 72.7510] }
    ]
  },
  "34 DIV": {
    color: "#2ecc71",
    locations: [{ name: "HQ 34 DIV", pos: [33.5690, 73.0865] }]
  }
};

// Define Icons
const jeepIcon = new L.Icon({
  iconUrl: jeepIconImg,
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

const truckIcon = new L.Icon({
  iconUrl: Ton5Img,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// View Controller
function MapController({ activeUnit }) {
  const map = useMap();
  useEffect(() => {
    if (activeUnit === "34 DIV") {
      map.setView([32.20, 73.20], 7, { animate: true, duration: 1.5 });
    } else if (hierarchy[activeUnit]) {
      map.setView(hierarchy[activeUnit].locations[0].pos, 9, { animate: true, duration: 1.5 });
    }
  }, [activeUnit, map]);
  return null;
}

export default function BlinkingTacticalMap() {
  const [activeUnit, setActiveUnit] = useState("34 DIV");
  const [fleet, setFleet] = useState([]);

  // FETCH FROM DB (Synced with your server.js /api/fleet/status)
  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/fleet/status');
        const data = await res.json();
        setFleet(data);
      } catch (err) {
        console.error("Database Fetch Error:", err);
      }
    };

    fetchFleetData();
    const interval = setInterval(fetchFleetData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter fleet based on selection
  const filteredFleet = useMemo(() => {
    if (activeUnit === "34 DIV" || activeUnit === "34 DIV ARTY" || activeUnit==="340 BDE" || activeUnit==="341 BDE" || activeUnit==="342 BDE") return fleet;
    return fleet.filter(v => v.unit_name === activeUnit);
  }, [fleet, activeUnit]);

  return (
    <div className="vh-100 vw-100 bg-dark position-relative overflow-hidden">
      
      {/* TOP NAV BAR */}
      <div className="position-absolute top-0 start-0 w-100" style={{ zIndex: 1000 }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2 shadow-lg" 
             style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)', height: '60px' }}>
          
          <div className="d-flex align-items-center gap-3">
            <img src={signalsLogo} alt="Logo" style={{ height: "35px", filter: "brightness(0) invert(1)" }} />
            <div className="vr text-white opacity-25 mx-2"></div>
            <div className="d-flex gap-2">
              {Object.keys(hierarchy).reverse().map((unit) => (
                <button
                  key={unit}
                  onClick={() => setActiveUnit(unit)}
                  className={`btn btn-sm px-3 rounded-2 d-flex align-items-center gap-2 transition-all ${
                    activeUnit === unit ? 'btn-success shadow' : 'text-white border-0 opacity-50'
                  }`}
                  style={{ fontSize: '11px', fontWeight: '700' }}
                >
                  <div className={activeUnit === unit ? "blink-dot" : ""} 
                       style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hierarchy[unit].color }}></div>
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MapContainer center={[32.5, 73.0]} zoom={18} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController activeUnit={activeUnit} />

        {/* Tactical Boundaries */}
        {Object.entries(hierarchy).map(([unitName, data]) => {
          const isVisible = activeUnit === "34 DIV" || activeUnit === unitName;
          return (
            <React.Fragment key={unitName}>
              {unitName !== "34 DIV" && (
                <Polygon 
                  positions={data.locations.map(l => l.pos)}
                  pathOptions={{
                    color: isVisible ? data.color : '#444',
                    fillColor: isVisible ? data.color : 'transparent',
                    fillOpacity: activeUnit === unitName ? 0.1 : 0.02,
                    weight: isVisible ? 2 : 1,
                    dashArray: isVisible ? '0' : '5, 10'
                  }}
                />
              )}
              {data.locations.map((loc, i) => (
                <CircleMarker 
                  key={i} center={loc.pos} radius={isVisible ? 6 : 3}
                  className={isVisible ? "tactical-node-blink" : ""}
                  pathOptions={{ color: isVisible ? data.color : '#555', fillOpacity: 1 }}
                >
                  <Tooltip direction="top" offset={[0, -5]} className="tactical-tooltip">{loc.name}</Tooltip>
                </CircleMarker>
              ))}
            </React.Fragment>
          );
        })}

        {/* LIVE DATABASE MARKERS */}
        {filteredFleet.map((veh) => {
          // Verify vehicle has valid coordinates before rendering
          if (!veh.latitude || !veh.longitude) return null;

          return (
            <Marker
              key={veh.vehicle_no}
              position={[parseFloat(veh.latitude), parseFloat(veh.longitude)]}
              icon={veh.vehicle_type?.includes("5 Ton") ? truckIcon : jeepIcon}
            >
              <Tooltip direction="right" offset={[15, 0]}>
                <div style={{ fontSize: '11px', minWidth: '100px' }}>
                  <div className="fw-bold text-primary border-bottom mb-1">{veh.vehicle_no}</div>
                  <div>Unit: {veh.unit_name}</div>
                  <div>Type: {veh.vehicle_type}</div>
                  <div className={veh.speed > 0 ? "text-success fw-bold" : "text-muted"}>
                    {veh.speed > 0 ? `Speed: ${veh.speed} km/h` : "Status: Parked"}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .tactical-node-blink { animation: node-pulse 2s infinite; }
        @keyframes node-pulse {
          0% { stroke-width: 2; stroke-opacity: 1; }
          50% { stroke-width: 10; stroke-opacity: 0.3; }
          100% { stroke-width: 2; stroke-opacity: 1; }
        }
        .blink-dot { animation: simple-blink 1s infinite; }
        @keyframes simple-blink { 50% { opacity: 0.2; } }
        .tactical-tooltip {
          background: #1a1a1a !important;
          border: 1px solid #444 !important;
          color: #00ff00 !important;
          font-family: monospace;
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
}