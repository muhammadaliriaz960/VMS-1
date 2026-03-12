import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL, WS_URL } from '../config';

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    // Existing States
    const [mileageLogs, setMileageLogs] = useState([]);
    const [liveData, setLiveData] = useState({});

    // New States for Replay Logic
    const [fleetData, setFleetData] = useState({});
    const [selectedBA, setSelectedBA] = useState(null);
    const [isLoadingReplay, setIsLoadingReplay] = useState(true);

    /**
     * 1. ACTIVE MOVE FETCH (Replay Logic)
     * Fetches sanctioned vehicles and their full coordinate paths for the map replay.
     */
    const fetchActiveMoveData = useCallback(async () => {
        setIsLoadingReplay(true);
        try {
            console.log('[DEBUG] Fetching move-sanctions...');
            const sancRes = await fetch(`${API_URL}/api/sidebar/move-sanctions`);
            if (!sancRes.ok) throw new Error(`API error: ${sancRes.status}`);
            
            const sanctions = await sancRes.json();
            const freshFleet = {};

            for (const sanc of sanctions) {
                const pathRes = await fetch(`${API_URL}/api/path-full/${sanc.vehicle_id}`);
                const pathPoints = await pathRes.json();
                
                freshFleet[sanc.ba] = {
                    vehicle_id: sanc.vehicle_id,
                    name: sanc.vehicle_type,
                    unit: sanc.unit,
                    type: sanc.vehicle_type,
                    path: pathPoints.map(p => ({
                        lat: parseFloat(p.lat),
                        lng: parseFloat(p.lng),
                        speed: p.speed || 0,
                        time: p.time
                    }))
                };
            }

            setFleetData(freshFleet);
            
            // Functional update to avoid dependency on selectedBA
            setSelectedBA(current => {
                if (!current && sanctions.length > 0) {
                    return sanctions[0].ba;
                }
                return current;
            });
        } catch (err) {
            console.error("[DEBUG] Replay Data Fetch Error:", err);
        } finally {
            setIsLoadingReplay(false);
        }
    }, []); // No dependencies! Now it only fetches on mount or manual refresh.

    /**
     * 2. MILEAGE HISTORY FETCH
     */
    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/sidebar/move-history`);
            const data = await response.json();
            
            const formatted = data.map(row => ({
                ba: row.ba,
                unit: row.unit || "N/A",
                startLat: row.startLat,
                startLng: row.startLng,
                lastLat: row.lastLat,
                lastLng: row.lastLng,
                total: row.total || "0.00",
                currentSpeed: row.currentSpeed ? `${row.currentSpeed} km/h` : "0 km/h",
                completedAt: row.completed_at
            }));
            
            setMileageLogs(formatted);
        } catch (err) {
            console.error("Mileage History Fetch Error:", err);
        }
    }, []);

    /**
     * 3. INITIALIZATION & WEBSOCKET
     */
    useEffect(() => {
        fetchHistory(); 
        fetchActiveMoveData(); // Initialize Replay paths
    }, [fetchHistory, fetchActiveMoveData]);

    useEffect(() => {
        const socket = new WebSocket(WS_URL);
        
        socket.onmessage = (event) => {
            const incoming = JSON.parse(event.data);

            // Update Live Assets
            setLiveData(prev => ({
                ...prev,
                [incoming.ba]: { 
                    lat: incoming.lat, 
                    lng: incoming.lng, 
                    speed: incoming.speed, 
                    unit: incoming.unit 
                }
            }));

            // Update Mileage Logs (Live increment)
            setMileageLogs(prev => prev.map(item => {
                if (item.ba === incoming.ba) {
                    return {
                        ...item,
                        lastLat: incoming.lat,
                        lastLng: incoming.lng,
                        total: (parseFloat(item.total) + 0.01).toFixed(2),
                        currentSpeed: `${incoming.speed} km/h`
                    };
                }
                return item;
            }));
        };
        
        return () => socket.close();
    }, []); // Only run on mount

    return (
        <TrackingContext.Provider value={{ 
            mileageLogs, 
            liveData, 
            fleetData,          // For Replay Map
            selectedBA,         // For Replay Map
            setSelectedBA,      // To switch vehicles in Replay
            isLoadingReplay, 
            refreshAll: () => { fetchHistory(); fetchActiveMoveData(); } 
        }}>
            {children}
        </TrackingContext.Provider>
    );
};

export const useTracking = () => {
    const context = useContext(TrackingContext);
    if (!context) throw new Error("useTracking must be used within TrackingProvider");
    return context;
};