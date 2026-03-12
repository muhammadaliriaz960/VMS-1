import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, Search, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useTracking } from "../context/TrackingContext"; // Path to your context file

// Asset Icons
import jeepIconImg from "../assets/images/jeep.png";
import Ton5Img from "../assets/images/5Ton.png";

const getVehicleIcon = (type) => {
  const iconUrl = type === "5 Ton" ? Ton5Img : jeepIconImg;
  return new L.Icon({
    iconUrl,
    iconSize: [52, 52],
    iconAnchor: [26, 26], // Centered the anchor
  });
};

const VehicleListItem = React.memo(({ ba, fleetData, selectedBA, onClick }) => {
  return (
    <div onClick={onClick}
         className={`p-2 px-3 mb-2 rounded border-start border-4 cursor-pointer transition ${selectedBA === ba ? 'bg-primary border-white' : 'bg-secondary opacity-50'}`}>
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold" style={{ letterSpacing: '1px' }}>{ba}</span>
        <span className="badge bg-black text-white x-small" style={{ fontSize: '10px' }}>{fleetData[ba].type}</span>
      </div>
      <small className="d-block text-white-50">{fleetData[ba].unit}</small>
    </div>
  );
});

export default function ActiveMove() {
  const { fleetData, selectedBA, setSelectedBA, isLoadingReplay } = useTracking();
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 5x
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showLogs, setShowLogs] = useState(false); // New state to control logs visibility
  const timerRef = useRef(null);
  const [plotZoomLevel, setPlotZoomLevel] = useState(20);
  const [showVehicleHistory, setShowVehicleHistory] = useState(false); // New state to control vehicle history display

  // Derived data from Context
  const currentAsset = fleetData[selectedBA];
  const flightPath = currentAsset?.path || [];
  const currentPos = flightPath[currentIndex] || flightPath[0];

  // Logs list filtered by date range
  const logEntries = useMemo(() => {
    if (!flightPath.length) return [];

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return flightPath.filter((p) => {
      if (!p.time) return true;
      const t = new Date(p.time);
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [flightPath, fromDate, toDate]);

  // No longer automatically jumping to end when path length changes
  // as this is a history replay page.
  
  // Playback Logic
  useEffect(() => {
    if (isPlaying && currentIndex < logEntries.length - 1) {
      timerRef.current = setTimeout(() => setCurrentIndex(prev => prev + 1), playbackSpeed / speedMultiplier);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, playbackSpeed, logEntries, speedMultiplier]);

  // Filter fleet based on search
  const filteredBAs = useMemo(() => 
    Object.keys(fleetData).filter(ba => 
      ba.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fleetData[ba].unit.toLowerCase().includes(searchTerm.toLowerCase())
    ), [fleetData, searchTerm]);

  // Handle Loading State
  if (isLoadingReplay) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-black text-success" style={{ height: "100vh" }}>
        <div className="spinner-border me-2"></div>
        <span>Initializing Tactical Map Data...</span>
      </div>
    );
  }

  // Debug: Log the current state
  console.log('Active Move Debug:', {
    fleetData,
    fleetDataKeys: Object.keys(fleetData),
    selectedBA,
    filteredBAs,
    isLoadingReplay
  });

  // Handle plot button click
  const handlePlotClick = (point, index) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="d-flex border-2 shadow-sm" style={{ height: "100vh", overflow: "hidden" }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #198754; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #333 #000; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <div className={`bg-black transition-all shadow-lg`} 
           style={{ width: isSidebarOpen ? '320px' : '0px', transition: '0.3s ease', overflow: 'hidden', zIndex: 1050 }}>
        <div style={{ width: '320px' }} className="p-3 border-2 text-white">
          <h6 className="text-success fw-bold mb-1">Vehicles</h6>
          <small className="text-white d-block mb-3 border-bottom border-secondary pb-2">Movement Overview</small>
          
          <div className="input-group input-group-sm mb-3">
            <span className="input-group-text bg-secondary border-0 text-white"><Search size={14}/></span>
            <input 
              type="text" 
              className="form-control bg-secondary border-0 text-white shadow-none" 
              placeholder="Search BA / Unit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-auto custom-scrollbar flex-grow-1 pe-2" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {filteredBAs.length === 0 ? (
              <div className="text-center text-white-50 py-4">
                <div className="mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div className="fw-bold">No Active Vehicles</div>
                <small>No vehicles with active movement sanctions found</small>
              </div>
            ) : (
              filteredBAs.map(ba => (
                <VehicleListItem 
                  key={ba} 
                  ba={ba} 
                  fleetData={fleetData} 
                  selectedBA={selectedBA} 
                  onClick={() => { 
                    setSelectedBA(ba); 
                    setCurrentIndex(0); 
                    setIsPlaying(false); 
                    setShowVehicleHistory(true); // Show vehicle history when clicked
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-grow-1 d-flex flex-column position-relative bg-success">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="btn btn-dark ms-2 border border-secondary bg-black position-absolute start-0 top-50 translate-middle-y rounded-end p-1 shadow-lg" 
                style={{ zIndex: 1100, left: 0 }}>
          {isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
        </button>

        {showVehicleHistory && selectedBA && (
          <div className="bg-black border-2 border-white border-bottom text-white p-3 d-flex align-items-center gap-4 shadow" style={{ zIndex: 1001 }}>
            {currentAsset && (
              <div className="table-responsive">
                <h5 className="mb-0 fw-bold">{selectedBA} <small className="text-white">| {currentAsset.name}</small></h5>
                <div className="d-flex gap-3 mt-1">
                    <span className="badge bg-warning text-dark">{currentAsset.unit}</span>
                    <span className="badge bg-secondary">Active Sanction</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Map */}
        <div className="flex-grow-1 position-relative">
          {showVehicleHistory && selectedBA && flightPath.length > 0 ? (
            // Show vehicle history map when vehicle is selected
            <MapContainer 
              center={[currentPos.lat, currentPos.lng]} 
              zoom={19} 
              className="h-100 w-100"
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* 1. Ghost line (Full History) */}
              <Polyline positions={flightPath.map(p => [p.lat, p.lng])} color="#4f46e5" weight={2} dashArray="10, 10" opacity={0.4} />
              
              {/* 2. Live Active Line (Solid) */}
              <Polyline positions={flightPath.slice(0, currentIndex + 1).map(p => [p.lat, p.lng])} color="#22c55e" weight={5} />
              
              {/* 3. The Marker */}
              <Marker 
                key={`${selectedBA}-${currentPos.lat}-${currentPos.lng}`} 
                position={[currentPos.lat, currentPos.lng]} 
                icon={getVehicleIcon(currentAsset?.type)}
              >
                <Popup>
                  <strong>{selectedBA}</strong><br/>
                  Speed: {currentPos.speed} km/h<br/>
                  Lat: {currentPos.lat.toFixed(6)}<br/>
                  Lng: {currentPos.lng.toFixed(6)}
                </Popup>
              </Marker>
              
              {/* 4. The Recenter Hook */}
              <RecenterMap lat={currentPos.lat} lng={currentPos.lng} zoomLevel={plotZoomLevel} />
            </MapContainer>
          ) : (
            // Show simple map when no vehicle is selected
            <MapContainer 
              center={[32.5, 73.0]} 
              zoom={7} 
              className="h-100 w-100"
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Simple instruction overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '20px 30px',
                borderRadius: '10px',
                textAlign: 'center',
                zIndex: 1000,
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                <div style={{ marginBottom: '10px' }}>🗺️ Active Move Map</div>
                <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                  Click on a vehicle BA number from the sidebar to view its movement history
                </div>
              </div>
            </MapContainer>
          )}
        </div>

        {/* 3. Replay Controller */}
        {showVehicleHistory && selectedBA && flightPath.length > 0 && (
          <div className="bg-white border-top p-3 px-4 shadow-lg" style={{ zIndex: 1001 }}>
            <div className="row align-items-center gy-2">
              <div className="col-auto d-flex gap-2">
                <button
                  className={`btn ${isPlaying ? "btn-outline-danger" : "btn-primary"} rounded-circle p-2`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  className="btn btn-light rounded-circle p-2"
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsPlaying(false);
                  }}
                >
                  <RotateCcw size={24} />
                </button>
              </div>

              {/* Date Range Filters */}
              <div className="col-auto d-flex align-items-center gap-2">
                <label className="form-label form-label-sm mb-0">From</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <label className="form-label form-label-sm mb-0">To</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              {/* Speed Control */}
              <div className="col-auto">
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Speed: {speedMultiplier}x
                  </button>
                  <ul className="dropdown-menu">
                    {[1, 2, 5].map(m => (
                      <li key={m}><a className="dropdown-item" href="#" onClick={() => setSpeedMultiplier(m)}>{m}x</a></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col px-4">
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={logEntries.length - 1}
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(Number(e.target.value))}
                />
              </div>

              <div className="col-auto">
                <button 
                  onClick={() => setShowLogs(!showLogs)} 
                  className="btn btn-sm btn-outline-secondary"
                >
                  {showLogs ? "Hide Logs" : "Show Logs"}
                </button>
              </div>
            </div>

            {showLogs && (
              <div className="bg-light border-top px-4 py-3 mt-3" style={{ maxHeight: "260px", overflowY: "auto" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">Movement Logs</h6>
                  <small className="text-muted">
                    {logEntries.length} point{logEntries.length === 1 ? "" : "s"}
                  </small>
                </div>
                
                {logEntries.length === 0 ? (
                  <div className="text-muted small">No logs found for selected date range.</div>
                ) : (
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr className="small text-uppercase">
                        <th style={{ width: "35%" }}>Time</th>
                        <th style={{ width: "20%" }}>Lat</th>
                        <th style={{ width: "20%" }}>Lng</th>
                        <th style={{ width: "15%" }}>Speed</th>
                        <th style={{ width: "10%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logEntries.map((p, idx) => {
                        const originalIndex = flightPath.findIndex(fp => 
                          fp.lat === p.lat && fp.lng === p.lng && fp.time === p.time
                        );
                        return (
                          <tr key={idx} className="small">
                            <td>{p.time ? new Date(p.time).toLocaleString() : "-"}</td>
                            <td>{p.lat?.toFixed ? p.lat.toFixed(5) : p.lat}</td>
                            <td>{p.lng?.toFixed ? p.lng.toFixed(5) : p.lng}</td>
                            <td>{p.speed} km/h</td>
                            <td>
                              <button 
                                onClick={() => handlePlotClick(p, originalIndex)}
                                className="btn btn-sm btn-primary p-1"
                                title="Plot on map"
                              >
                                <MapPin size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecenterMap({ lat, lng, zoomLevel }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      // Use specified zoom level when not playing, default to current zoom
      const targetZoom = zoomLevel || map.getZoom();
      map.setView([lat, lng], targetZoom);
    }
  }, [lat, lng, map, zoomLevel]);
  return null;
}