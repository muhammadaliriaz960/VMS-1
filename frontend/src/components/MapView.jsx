import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FaCar } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

export default function MapView({ vehicles }) { // Changed prop name to 'vehicles'
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map", { center: [33.7, 72.8], zoom: 9 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (vehicles && mapRef.current) {
      // 1. Logic to handle single object or array
      const vehicleList = Array.isArray(vehicles) ? vehicles : [vehicles];

      // 2. Clear markers that are no longer in the list (Cleanup)
      const currentIds = vehicleList.map(v => v.id);
      Object.keys(markersRef.current).forEach(id => {
        if (!currentIds.includes(id)) {
          mapRef.current.removeLayer(markersRef.current[id]);
          delete markersRef.current[id];
        }
      });

      // 3. Update or Add markers
      vehicleList.forEach((vehicle) => {
        // Updated to use 'lat' and 'lng' to match Dashboard data
        const { id, lat, lng, speed, status } = vehicle;

        const iconMarkup = renderToStaticMarkup(
          <div style={{ 
            backgroundColor: "#fff", 
            border: `2px solid ${status === "MOVING" ? "#059669" : "#1e3a5f"}`, 
            borderRadius: "50%", 
            padding: "5px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            color: status === "MOVING" ? "#059669" : "#1e3a5f"
          }}>
            <FaCar style={{ display: 'block' }} />
          </div>
        );

        const tacticalIcon = L.divIcon({
          html: iconMarkup,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (!markersRef.current[id]) {
          // New Marker
          markersRef.current[id] = L.marker([lat, lng], { icon: tacticalIcon })
            .addTo(mapRef.current)
            .bindPopup(`<b>Unit ID:</b> ${id}<br/><b>Status:</b> ${status}<br/><b>Speed:</b> ${speed}`);
        } else {
          // Move Existing Marker
          markersRef.current[id].setLatLng([lat, lng]);
          markersRef.current[id].setIcon(tacticalIcon); // Update icon color if status changed
        }
      });
    }
  }, [vehicles]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div id="map" style={{ width: "100%", height: "100%", border: "2px solid #94a3b8" }}></div>
      <div style={{ 
        position: 'absolute', top: '10px', right: '10px', zIndex: 1000,
        background: 'rgba(255,255,255,0.9)', padding: '5px 10px', border: '1px solid #94a3b8',
        fontSize: '11px', fontWeight: 'bold'
      }}>
        MAP STATUS: <span style={{ color: '#059669' }}>OPERATIONAL</span>
      </div>
    </div>
  );
}