import { useState, useEffect, useMemo, useCallback } from 'react';
import { API_URL, WS_URL } from '../config';

export function useVehicleData() {
  const [fleet, setFleet] = useState([]);
  const [liveVehicles, setLiveVehicles] = useState([]);
  const [vehiclePaths, setVehiclePaths] = useState({});
  const [sanctions, setSanctions] = useState([]);

  const fetchFleetData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/fleet/status`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched fleet data:', data);
        setFleet(data);

        const activeVehicles = data.filter(v => (v.speed > 0 || v.vehicle_status === 'ACTIVE') && v.vehicle_id);
        if (activeVehicles.length > 0) {
          const vehicleIds = activeVehicles.map(v => v.vehicle_id);
          try {
            const pathRes = await fetch(`${API_URL}/api/path-batch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vehicleIds })
            });
            
            if (pathRes.ok) {
              const pathMap = await pathRes.json();
              setVehiclePaths(pathMap);
            }
          } catch (error) {
            console.error("Batch path fetch error:", error);
          }
        } else {
          setVehiclePaths({});
        }
      }
    } catch (err) {
      console.error("Database Fetch Error:", err);
      setFleet([]);
      setVehiclePaths({});
    }
  }, []);

  const fetchSanctions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sanctions`);
      if (res.ok) {
        const data = await res.json();
        setSanctions(data);
      }
    } catch (err) {
      console.error("Sanctions Fetch Error:", err);
      setSanctions([]);
    }
  }, []);

  useEffect(() => {
    fetchFleetData();
    fetchSanctions();
    const interval = setInterval(fetchFleetData, 5000);
    return () => clearInterval(interval);
  }, [fetchFleetData, fetchSanctions]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "LIVE_FEED") {
          setLiveVehicles(data.vehicles || []);
        }
      } catch (err) {
        console.error("WebSocket Error:", err);
      }
    };
    ws.onerror = (err) => {
      console.error("WebSocket Connection Error:", err);
    };
    return () => {
      ws.close();
    };
  }, []);

  const refreshData = useCallback(() => {
    fetchFleetData();
    fetchSanctions();
  }, [fetchFleetData, fetchSanctions]);

  return { fleet, liveVehicles, vehiclePaths, sanctions, refreshData };
}