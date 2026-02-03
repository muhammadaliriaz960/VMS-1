import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Search, ChevronRight, ChevronLeft } from "lucide-react";
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

export default function ActiveMove() {
  const { fleetData, selectedBA, setSelectedBA, isLoadingReplay } = useTracking();
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const timerRef = useRef(null);

  // Derived data from Context
  const currentAsset = fleetData[selectedBA];
  const flightPath = currentAsset?.path || [];
  const currentPos = flightPath[currentIndex] || flightPath[0];


useEffect(() => {
  if (!isPlaying) {
    setCurrentIndex(flightPath.length - 1);
  }
}, [flightPath.length]);
  // Playback Logic
  useEffect(() => {
    if (isPlaying && currentIndex < flightPath.length - 1) {
      timerRef.current = setTimeout(() => setCurrentIndex(prev => prev + 1), playbackSpeed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, playbackSpeed, flightPath]);

  // Handle Loading State
  if (isLoadingReplay) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-black text-success" style={{ height: "100vh" }}>
        <div className="spinner-border me-2"></div>
        <span>Initializing Tactical Map Data...</span>
      </div>
    );
  }

  // Filter fleet based on search
  const filteredBAs = Object.keys(fleetData).filter(ba => 
    ba.toLowerCase().includes(searchTerm.toLowerCase()) || 
    fleetData[ba].unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredBAs.map(ba => (
              <div key={ba} onClick={() => { setSelectedBA(ba); setCurrentIndex(0); setIsPlaying(false); }}
                   className={`p-2 px-3 mb-2 rounded border-start border-4 cursor-pointer transition ${selectedBA === ba ? 'bg-primary border-white' : 'bg-secondary opacity-50'}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold" style={{ letterSpacing: '1px' }}>{ba}</span>
                  <span className="badge bg-black text-white x-small" style={{ fontSize: '10px' }}>{fleetData[ba].type}</span>
                </div>
                <small className="d-block text-white-50">{fleetData[ba].unit}</small>
              </div>
            ))}
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

        {/* 1. Header */}
        <div className="bg-black border-2 border-white border-bottom text-white p-3 d-flex align-items-center gap-4 shadow" style={{ zIndex: 1001 }}>
          {currentAsset && (
            <div>
              <h5 className="mb-0 fw-bold">{selectedBA} <small className="text-white">| {currentAsset.name}</small></h5>
              <div className="d-flex gap-3 mt-1">
                  <span className="badge bg-warning text-dark">{currentAsset.unit}</span>
                  <span className="badge bg-secondary">Active Sanction</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Map */}
        <div className="flex-grow-1 position-relative">
          {flightPath.length > 0 ? (
            <MapContainer 
  center={[currentPos.lat, currentPos.lng]} 
  zoom={19} 
  className="h-100 w-100"
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  
  {/* 1. Ghost line (Full History) */}
  <Polyline positions={flightPath.map(p => [p.lat, p.lng])} color="#4f46e5" weight={2} dashArray="10, 10" opacity={0.4} />
  
  {/* 2. Live Active Line (Solid) */}
  <Polyline positions={flightPath.slice(0, currentIndex + 1).map(p => [p.lat, p.lng])} color="#22c55e" weight={5} />
  
  {/* 3. The Marker - Using a unique 'key' forces React to re-render it if it gets stuck */}
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
  <RecenterMap lat={currentPos.lat} lng={currentPos.lng} />
</MapContainer>
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center bg-dark text-white">
              No movement data recorded for this vehicle.
            </div>
          )}
        </div>

        {/* 3. Replay Controller */}
        <div className="bg-white border-top p-3 px-5 shadow-lg" style={{ zIndex: 1001 }}>
          <div className="row align-items-center">
            <div className="col-auto d-flex gap-2">
              <button className={`btn ${isPlaying ? 'btn-outline-danger' : 'btn-primary'} rounded-circle p-2`} onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="btn btn-light rounded-circle p-2" onClick={() => {setCurrentIndex(0); setIsPlaying(false);}}>
                <RotateCcw size={24} />
              </button>
            </div>
            <div className="col px-4">
              <input 
                type="range" 
                className="form-range" 
                max={Math.max(0, flightPath.length - 1)} 
                value={currentIndex} 
                onChange={(e) => setCurrentIndex(parseInt(e.target.value))} 
              />
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm fw-bold border-primary" onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}>
                <option value="500">1.0x</option>
                <option value="200">2.5x</option>
                <option value="50">10.0x</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecenterMap({ lat, lng, isPlaying }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      // If playing, use panTo for smoother flow. If jumping/seeking, use flyTo.
      if (isPlaying) {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      } else {
        map.setView([lat, lng], map.getZoom());
      }
    }
  }, [lat, lng, map, isPlaying]);
  return null;
}