import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Polygon, Marker, CircleMarker, Tooltip, Polyline, useMap } from "react-leaflet";
import { Menu, User, LogOut, Settings, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Assets
import signalsLogo from "../assets/images/UnitLogo3.png";
import jeepIconImg from "../assets/images/jeep.png";
import Ton5Img from "../assets/images/5Ton.png";
import gpsIcon from "../assets/images/gps.png";

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

const LiveVehicleItem = React.memo(({ v, getBorderWidth, getBorderColor, getBoxShadow, getSpeedTextColor, getOverspeedStatus, getSpeedColor, focusOnVehicle, gpsIcon, isDataStale }) => {
  const stale = isDataStale(v.last_update);

  return (
    <div
      className="mb-2 rounded-3 p-2"
      style={{
        background: "#0f172a",
        border: "1px solid #374151",
        transition: "all 0.3s ease",
        opacity: stale ? 0.6 : 1,
      }}
    >
      <div className="row">
        <div className="col-7">
          <div style={{ fontWeight: "bold", color: getSpeedTextColor(v.speed), fontSize: "14px" }}>
            {v.ba}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            {v.unit || v.unit_name}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Lat: {v.lat?.toFixed ? v.lat.toFixed(4) : v.lat}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Lng: {v.lng?.toFixed ? v.lng.toFixed(4) : v.lng}
          </div>
        </div>
        <div className="col-5 d-flex flex-column justify-content-between align-items-end">
          <div
            className="px-2 py-0 rounded-pill d-flex align-items-center"
            style={{
              backgroundColor: getSpeedColor(v.speed),
              color: "#f9fafb",
              height: "24px"
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap" }}>{v.speed} km/h</span>
          </div>
          <button
            onClick={() => focusOnVehicle(parseFloat(v.lat), parseFloat(v.lng))}
            className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center border-0 p-1 px-2"
            style={{
              borderRadius: "999px",
              fontSize: "10px",
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              fontWeight: "bold",
            }}
            title="Track Vehicle"
          >
            <img
              src={gpsIcon}
              alt="GPS"
              style={{ width: "12px", height: "12px", marginRight: "6px" }}
            />
            Focus
          </button>
        </div>
      </div>
    </div>
  );
});

import { useVehicleData } from '../hooks/useVehicleData';
import { API_URL } from '../config';

export default function BlinkingTacticalMap({ setActivePage, onLogout }) {
  const { fleet, liveVehicles, vehiclePaths, sanctions, refreshData, refreshing } = useVehicleData();
  const [activeUnit, setActiveUnit] = useState("34 DIV");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomToVehicle, setZoomToVehicle] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [overspeedLimits, setOverspeedLimits] = useState({
    first: 60,
    second: 80,
  });

  // Load overspeed limits from localStorage on component mount
  useEffect(() => {
    const savedLimits = localStorage.getItem('overspeedLimits');
    if (savedLimits) {
      try {
        setOverspeedLimits(JSON.parse(savedLimits));
      } catch (error) {
        console.error('Error loading overspeed limits:', error);
      }
    }
  }, []);

  // Save overspeed limits to localStorage when they change
  useEffect(() => {
    localStorage.setItem('overspeedLimits', JSON.stringify(overspeedLimits));
  }, [overspeedLimits]);

  // Sync overspeed limits with backend on component mount
  useEffect(() => {
    const syncOverspeedLimits = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/sync-overspeed-limits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(overspeedLimits)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Backend synced with overspeed limits:', result);
        } else {
          console.error('Failed to sync overspeed limits with backend');
        }
      } catch (error) {
        console.error('Error syncing overspeed limits:', error);
      }
    };

    // Sync after a short delay to ensure backend is ready
    const timer = setTimeout(syncOverspeedLimits, 2000);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Red square / block icon - moved inside component
  const redBlockIcon = useMemo(() => {
    return L.icon({
      iconUrl: "/icons/block.png",
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  }, []);

  // Define Icons - moved inside component
  const jeepIcon = useMemo(() => {
    return new L.Icon({
      iconUrl: jeepIconImg,
      iconSize: [35, 35],
      iconAnchor: [17, 17],
    });
  }, []);

  const truckIcon = useMemo(() => {
    return new L.Icon({
      iconUrl: Ton5Img,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, []);

  // Global refs to persist across MapController remounts
  const hasUserInteracted = useRef(false);
  const isInitialized = useRef(false);

  // View Controller - moved inside component
  function MapController({ activeUnit, zoomTo }) {
    const map = useMap();

    useEffect(() => {
      console.log('[MAP DEBUG] useEffect triggered with:', { 
        zoomTo: zoomTo?.lat ? `${zoomTo.lat}, ${zoomTo.lng}` : 'none', 
        hasUserInteracted: hasUserInteracted.current,
        isInitialized: isInitialized.current,
        activeUnit 
      });
      
      // Only set view on first initialization or when zoomTo is set AND user hasn't manually zoomed
      if (zoomTo?.lat && zoomTo?.lng && !hasUserInteracted.current) {
        console.log('[MAP DEBUG] zoomTo triggered - setting view to vehicle');
        map.setView([zoomTo.lat, zoomTo.lng], 17, { animate: true });
        // Don't reset hasUserInteracted - allow user to take control after
      } else if (!isInitialized.current && !hasUserInteracted.current) {
        // Only set default view on initial load and if user hasn't interacted
        console.log('[MAP DEBUG] Setting default view - user has not interacted yet');
        if (activeUnit === "34 DIV") {
          map.setView([32.20, 73.20], 7, { animate: true, duration: 1.5 });
        } else {
          const unit = hierarchy[activeUnit];
          if (unit && unit.locations.length > 0) {
            map.setView(unit.locations[0].pos, 10, { animate: true, duration: 1.5 });
          }
        }
        isInitialized.current = true;
      }
    }, [zoomTo, activeUnit, map]);

    // Detect user interaction with zoom controls
    useEffect(() => {
      const handleZoomEnd = () => {
        console.log('[MAP DEBUG] User manually zoomed - setting hasUserInteracted to true');
        hasUserInteracted.current = true;
      };

      const handleDragEnd = () => {
        console.log('[MAP DEBUG] User manually dragged - setting hasUserInteracted to true');
        hasUserInteracted.current = true;
      };

      map.on('zoomend', handleZoomEnd);
      map.on('dragend', handleDragEnd);

      return () => {
        map.off('zoomend', handleZoomEnd);
        map.off('dragend', handleDragEnd);
      };
    }, [map]);

    return null;
  }

  // Function to reset user interaction (enable auto-zoom again)
  const resetUserInteraction = () => {
    hasUserInteracted.current = false;
    console.log('[MAP DEBUG] User interaction reset - auto-zoom enabled again');
  };

  // Function to focus on specific vehicle (overrides user interaction)
  const focusOnVehicle = useCallback((lat, lng) => {
    hasUserInteracted.current = false; // Reset user interaction to allow focus
    setZoomToVehicle({ lat, lng });
    console.log('[MAP DEBUG] Focus on vehicle - resetting user interaction and setting zoom target');
  }, []);

  // Prevent auto zoom-out - keep zoom focused until user manually changes it
  useEffect(() => {
    // This useEffect is intentionally left empty to prevent any auto zoom-out logic
    // The zoom will stay focused on the selected vehicle until user manually changes it
  }, [zoomToVehicle]);

  // Mock data for testing when backend is down
  const mockFleet = [
    {
      vehicle_no: "BA-123",
      unit_name: "340 BDE",
      vehicle_type: "Jeep",
      latitude: 34.8491,
      longitude: 73.5725,
      speed: 45,
      is_blocked: 0,
      engine_status: "ON"
    },
    {
      vehicle_no: "BA-456", 
      unit_name: "341 BDE",
      vehicle_type: "5 Ton Truck",
      latitude: 30.1741,
      longitude: 71.3913,
      speed: 0,
      is_blocked: 0,
      engine_status: "ON"
    },
    {
      vehicle_no: "BA-789",
      unit_name: "342 BDE", 
      vehicle_type: "Jeep",
      latitude: 31.4787,
      longitude: 74.4160,
      speed: 60,
      is_blocked: 1,
      engine_status: "OFF"
    }
  ];

  const filteredFleet = useMemo(() => {
    // Use mock data if fleet is empty (backend down)
    const dataToUse = fleet.length > 0 ? fleet : mockFleet;
    
    if (activeUnit === "34 DIV") {
      return dataToUse;
    }
    
    const filtered = dataToUse.filter(v => v.unit_name === activeUnit);
    return filtered;
  }, [fleet, activeUnit]);

  // Get active sanction for a vehicle
  const getVehicleSanction = (vehicleNo) => {
    const now = new Date();
    return sanctions.find(s => 
      s.vehicle_no === vehicleNo && 
      new Date(s.end_datetime) > now
    );
  };

  // Check if vehicle is moving without sanction
  const isVehicleUnsanctioned = (vehicleNo, speed) => {
    if (speed <= 0) return false; // Not moving
    const sanction = getVehicleSanction(vehicleNo);
    return !sanction;
  };

  const getVehicleIcon = (veh) => {
    if (veh.is_blocked === 1 || veh.engine_status === "OFF") {
      return redBlockIcon;
    }
    if (veh.vehicle_type?.includes("5 Ton")) {
      return truckIcon;
    }
    return jeepIcon;
  };

  const getSpeedColor = (speed) => {
    if (speed >= overspeedLimits.second) return "#dc2626"; // red - second limit crossed
    if (speed >= overspeedLimits.first) return "#fbbf24"; // yellow - first limit crossed
    return "#22c55e"; // bright green (default)
  };

  const getSpeedTextColor = (speed) => {
    if (speed >= overspeedLimits.second) return "#dc2626"; // red - second limit crossed
    if (speed >= overspeedLimits.first) return "#fbbf24"; // yellow - first limit crossed
    return "#e2e8f0"; // light gray (default)
  };

  const getOverspeedStatus = (speed) => {
    if (speed >= overspeedLimits.second) return 'second'; // crossed second limit
    if (speed >= overspeedLimits.first) return 'first'; // crossed first limit
    return 'normal'; // normal speed
  };

  const getBorderColor = (speed) => {
    if (speed >= overspeedLimits.second) return "#dc2626"; // red - second limit crossed
    if (speed >= overspeedLimits.first) return "#fbbf24"; // yellow - first limit crossed
    return "#6b7280"; // gray - normal speed
  };

  const getBorderWidth = (speed) => {
    if (speed >= overspeedLimits.second) return "2px"; // thicker border for second limit
    if (speed >= overspeedLimits.first) return "2px"; // thicker border for first limit
    return "1px"; // normal border
  };

  const getBoxShadow = (speed) => {
    if (speed >= overspeedLimits.second) return "0 0 12px rgba(220, 38, 38, 0.5)"; // red glow
    if (speed >= overspeedLimits.first) return "0 0 12px rgba(251, 191, 36, 0.5)"; // yellow glow
    return "0 0 8px rgba(0,0,0,0.8)"; // normal shadow
  };

  const isDataStale = (lastUpdate) => {
    if (!lastUpdate) return true;
    const now = new Date().getTime();
    const updateTime = new Date(lastUpdate).getTime();
    return (now - updateTime) > 10000; // 10 seconds
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="vh-100 vw-100 bg-dark d-flex position-relative overflow-hidden">
      {isMobile && (
        <button 
          className="btn btn-primary position-absolute top-0 start-0 m-2"
          style={{ zIndex: 1002 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
      )}
      {/* TOP NAV BAR */}
      <div className="position-absolute top-0 start-0 w-100" style={{ zIndex: 1000 }}>
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 shadow-lg flex-nowrap"
          style={{
            background: "linear-gradient(90deg,#020617 0%,#020617 40%,#030712 100%)",
            backdropFilter: "blur(14px)",
            height: "60px",
            borderBottom: "1px solid rgba(15,23,42,0.9)",
            width: "100%"
          }}
        >
          {/* Left: logo + unit selector */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <img
                src={signalsLogo}
                alt="Logo"
                style={{ height: "34px", filter: "brightness(0) invert(1)" }}
              />
            </div>

            <div className="vr text-white opacity-25 mx-2"></div>

            <div className="d-flex gap-2">
              {Object.keys(hierarchy).reverse().map((unit) => (
                <button
                  key={unit}
                  onClick={() => setActiveUnit(unit)}
                  className={`btn btn-sm px-3 rounded-2 d-flex align-items-center gap-2 transition-all ${
                    activeUnit === unit
                      ? "btn-success shadow"
                      : "btn-outline-secondary border-0 text-white-50"
                  }`}
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  <div
                    className={activeUnit === unit ? "blink-dot" : ""}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: hierarchy[unit].color,
                    }}
                  ></div>
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Right: profile menu */}
          <div className="d-flex align-items-center gap-3 top-nav-right">
            {/* Profile Menu */}
            <div className="position-relative">
              <button
                className="btn btn-outline-light btn-sm"
                style={{ 
                  border: "none",
                  color: "white",
                  padding: "6px 10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  zIndex: 1001
                }}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ transition: 'all 0.3s ease' }}>
  <rect width="16" height="2" rx="1" fill="currentColor" opacity="0.8"/>
  <rect x="6" y="4.5" width="10" height="2" rx="1" fill="currentColor"/>
  <rect y="9" width="16" height="2" rx="1" fill="currentColor" opacity="0.8"/>
</svg>
              </button>
              
              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div 
                  className="position-absolute"
                  style={{ 
                    top: "100%", 
                    right: "0", 
                    marginTop: "6px",
                    minWidth: "160px",
                    zIndex: 9999,
                    position: "absolute"
                  }}
                >
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '8px',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden',
                      animation: 'slideDown 0.3s ease-out'
                    }}
                  >
                    <div className="py-1">
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-white"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Profile</span>
                      </button>
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-white"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => {
                          // Navigate to settings page
                          setActivePage && setActivePage('settings');
                          setProfileMenuOpen(false);
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Settings size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Settings</span>
                      </button>
                      <div style={{ 
                        height: '1px', 
                        background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)',
                        margin: '4px 12px'
                      }} />
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-danger"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => {
                          // Handle logout
                          if (confirm("Are you sure you want to logout?")) {
                            onLogout && onLogout();
                          }
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <LogOut size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Live Vehicle Feed */}
      <div
        className="live-feed-sidebar text-white"
        style={{
          width: sidebarOpen ? (isMobile ? "100%" : "200px") : "0px",
          marginTop: "60px",
          borderRight: sidebarOpen ? "1px solid #374151" : "none",
          overflow: "hidden",
          transition: "all 0.3s ease",
          background: "linear-gradient(180deg, #020617 0%, #020617 30%, #030712 100%)",
          position: isMobile ? "absolute" : "relative",
          zIndex: isMobile ? 1000 : "auto"
        }}
      >
        {/* Sidebar Toggle Button - positioned at top when sidebar is closed */}
        {!sidebarOpen && (
          <div
            className="sidebar-toggle"
            style={{
              top: "280px",
              left: "10px"
            }}
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight size={14} />
          </div>
        )}

        {/* Close button when sidebar is open */}
        {sidebarOpen && (
          <div
            className="sidebar-toggle"
            style={{
              top: "280px",
              left: "190px"
            }}
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={14} />
          </div>
        )}

        <div style={{ width: "200px", padding: "10px 10px 6px 10px" }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <div
                className="text-xs text-uppercase fw-bold"
                style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#9ca3af" }}
              >
                LIVE FEED
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f9fafb" }}>
                Moving Veh
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
              title="Refresh Live Data"
            >
              <div className="blink-dot" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
              {liveVehicles.filter(v => v.speed > 0).length} ONLINE
            </button>
          </div>

          <div
            className="mb-2 rounded-pill px-2 py-1 d-flex align-items-center"
            style={{ backgroundColor: "#020617", fontSize: "11px", border: "1px solid #374151" }}
          >
            <span
              className="me-2"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: liveVehicles.length ? "#22c55e" : "#9ca3af",
              }}
            ></span>
            <span style={{ color: "#e5e7eb" }}>
              {liveVehicles.length ? "Live GPS stream active" : "Waiting for vehicles..."}
            </span>
          </div>

          <div
            className="custom-scrollbar"
            style={{
              maxHeight: "calc(100vh - 150px)",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {liveVehicles.length === 0 && (
              <div className="text-center text-muted small py-3">No vehicles online</div>
            )}

            {liveVehicles.filter(v => v.speed > 0).map((v, idx) => (
              <LiveVehicleItem 
                key={v.ba || idx}
                v={v}
                getBorderWidth={getBorderWidth}
                getBorderColor={getBorderColor}
                getBoxShadow={getBoxShadow}
                getSpeedTextColor={getSpeedTextColor}
                getOverspeedStatus={getOverspeedStatus}
                getSpeedColor={getSpeedColor}
                focusOnVehicle={focusOnVehicle}
                gpsIcon={gpsIcon}
                isDataStale={isDataStale}
              />
            ))}
          </div>
        </div>
      </div>
      <div style={{ 
        flex: 1, 
        marginTop: "60px",
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Reset Auto-Zoom Button */}
        <button
          onClick={resetUserInteraction}
          className="btn btn-sm btn-outline-light position-absolute"
          style={{
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '12px',
            padding: '6px 10px',
            borderRadius: '4px'
          }}
          title="Enable Auto-Zoom (Reset manual control)"
        >
          <RotateCcw size={14} className="me-1" />
          Auto-Zoom
        </button>
        
        <MapContainer 
          center={[32.5, 73.0]} 
          zoom={10} 
          style={{ 
            height: "100%",
            backgroundColor: 'transparent'
          }}
        >
          {/* Online OpenStreetMap Tile Layer */}
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController activeUnit={activeUnit} zoomTo={zoomToVehicle} />

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
                    
                    pathOptions={{ color: isVisible ? data.color : '#555', fillOpacity: 1 }}
                  >
                    <Tooltip direction="top" offset={[0, -5]} className="tactical-tooltip">{loc.name}</Tooltip>
                  </CircleMarker>
                ))}
              </React.Fragment>
            );
          })}

          {/* LIVE DATABASE MARKERS */}
          {(() => {
            return filteredFleet.map((veh) => {
              if (!veh.latitude || !veh.longitude) {
                return null;
              }
              
              // Get vehicle path for moving vehicles
              const vehiclePath = vehiclePaths[veh.vehicle_id] || [];
              const pathCoords = vehiclePath.map(point => [parseFloat(point.lat), parseFloat(point.lng)]);
              
              // Debug logging
              console.log(`Vehicle ${veh.vehicle_no} (ID: ${veh.vehicle_id}):`, {
                speed: veh.speed,
                hasPath: vehiclePath.length > 0,
                pathCoords: pathCoords.length,
                shouldShowPolyline: veh.speed > 0 && pathCoords.length > 1
              });
              
              return (
                <React.Fragment key={veh.vehicle_no}>
                  {/* Vehicle Route Polyline - only show if has path */}
                  {pathCoords.length > 1 && (
                    <Polyline
                      positions={pathCoords}
                      pathOptions={{
                        color: getSpeedColor(veh.speed),
                        weight: 5, // Increased from 4 to 5
                        opacity: 0.9, // Increased from 0.8 to 0.9
                        // dashArray: '10, 10' // Removed dashArray for solid line
                      }}
                    />
                  )}
                  
                  {/* Vehicle Marker */}
                  <Marker
                    position={[parseFloat(veh.latitude), parseFloat(veh.longitude)]}
                    icon={getVehicleIcon(veh)}
                    className={
                      veh.is_blocked === 1 || veh.engine_status === "OFF"
                        ? "blocked-blink"
                        : ""
                    }
                  >
                  <Tooltip direction="right" offset={[15, 0]}>
                    <div style={{ fontSize: '11px', minWidth: '150px' }}>
                      <div className="fw-bold text-primary border-bottom mb-1">
                        {veh.vehicle_no}
                        {veh.is_blocked === 1 && (
                          <span className="text-danger ms-1">[BLOCKED]</span>
                        )}
                      </div>
                      <div>Unit: {veh.unit_name}</div>
                      <div>Type: {veh.vehicle_type}</div>
                      <div
                        className={
                          veh.is_blocked === 1
                            ? "text-danger fw-bold"
                            : veh.speed > 0
                              ? "text-success fw-bold"
                              : "text-warning fw-bold"
                        }
                      >
                        {veh.is_blocked === 1
                          ? "ENGINE CUT"
                          : veh.speed > 0
                            ? `MOVING — ${veh.speed} km/h`
                            : "PARKED"}
                      </div>
                      
                      {/* Move Sanction Details */}
                      {(() => {
                        const sanction = getVehicleSanction(veh.vehicle_no);
                        return sanction ? (
                          <div className="mt-2 pt-2 border-top border-secondary">
                            <div className="text-primary fw-bold mb-1">Move Sanction:</div>
                            <div className="small">
                              <div><strong>Route:</strong> {sanction.route_from} → {sanction.route_to}</div>
                              <div><strong>Driver:</strong> {sanction.driver_name || "Not specified"}</div>
                              <div><strong>Contact:</strong> {sanction.contact_no || "Not specified"}</div>
                              <div><strong>Purpose:</strong> {sanction.purpose || "Not specified"}</div>
                              <div><strong>Start:</strong> {new Date(sanction.start_datetime).toLocaleString()}</div>
                              <div><strong>End:</strong> {new Date(sanction.end_datetime).toLocaleString()}</div>
                              <div><strong>Status:</strong> 
                                <span className={`badge ms-1 ${
                                  new Date() > new Date(sanction.end_datetime) 
                                    ? 'bg-danger' 
                                    : 'bg-success'
                                }`}>
                                  {new Date() > new Date(sanction.end_datetime) ? 'EXPIRED' : 'ACTIVE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 pt-2 border-top border-secondary">
                            <div className="text-warning fw-bold mb-1">No Active Sanction</div>
                            <div className="small text-muted">Vehicle moving without proper sanction</div>
                          </div>
                        );
                      })()}
                    </div>
                  </Tooltip>
                </Marker>
                </React.Fragment>
              );
            });
          })()}
        </MapContainer>
      </div>

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

        /* Live Feed Toggle Button */
        .live-feed-toggle {
          width: 20px;
          height: 36px;
          background: linear-gradient(180deg, #0f172a 0%, #020617 50%, #0f172a 100%);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0 10px 10px 0;
          border: 1px solid #1e293b;
          border-left: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .live-feed-toggle:hover {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
          color: #e2e8f0;
          transform: translateX(3px) scale(1.1);
          box-shadow: 
            0 6px 16px rgba(0, 0, 0, 0.5),
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .live-feed-toggle:active {
          transform: translateX(1px) scale(0.95);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 1px 4px rgba(0, 0, 0, 0.2);
        }

        /* Sidebar Toggle Button (same as main sidebar) */
        .sidebar-toggle {
          position: absolute;
          width: 20px;
          height: 22px;
          background: linear-gradient(180deg, #0f172a 20%, #020617ab 50%, #0f172a 80%);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 5px;
          border: 1px solid #1e293b;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          font-size: 12px;
        }

        .sidebar-toggle:hover {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
          color: #e2e8f0;
          transform: translateX(3px) scale(1.1);
          box-shadow: 
            0 6px 16px rgba(0, 0, 0, 0.5),
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .sidebar-toggle:active {
          transform: translateX(1px) scale(0.95);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.3),
            0 1px 4px rgba(0, 0, 0, 0.2);
        }

        /* Sidebar Toggle Hover */
        .live-toggle {
          background: rgba(255, 255, 255, 0.08);
          color: #454446;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .live-toggle:hover {
          background: #000;
          color: #fff;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
