import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Car, History, Users, Cpu, 
  AlertTriangle, Gauge, ShieldAlert, Settings, LogOut, User, BarChart3,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import divLogo from "../assets/images/divlogo.png";
import { API_URL, WS_URL } from "../config";

export default function Sidebar({ active, setActive, user, onLogout, isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const [panicAlerts, setPanicAlerts] = useState(0);
  const [alertsViewed, setAlertsViewed] = useState(false);
  const isMobile = window.innerWidth <= 768;

  // Listen for panic alerts via WebSocket
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "PANIC") {
        // Only increment if alerts haven't been viewed
        if (!alertsViewed) {
          setPanicAlerts(prev => prev + 1);
        }
      }
    };
    return () => ws.close();
  }, [alertsViewed]);

  // Fetch existing violation alerts count
  useEffect(() => {
    const fetchPanicAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sidebar/violations-alerts`);
        const data = await res.json();
        // Count all critical alerts (PANIC, OVERSPEED, UNAUTHORIZED MOVE)
        const criticalCount = data.filter(alert => 
          alert.alert_type === 'PANIC' || 
          alert.alert_type === 'OVERSPEED' || 
          alert.alert_type === 'UNSANCTIONED_MOVE' ||
          alert.alert_type === 'POWER_CUT'
        ).length;
        
        // Only update if alerts haven't been viewed
        if (!alertsViewed) {
          setPanicAlerts(criticalCount);
        }
      } catch (err) {
        console.error("Error fetching panic alerts:", err);
      }
    };

    fetchPanicAlerts();
    const interval = setInterval(fetchPanicAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [alertsViewed]);

  const menuGroups = [
    {
      label: "Operational",
      items: [
        { id: "overall_summary", label: "Main Dashboard", icon: <BarChart3 size={20} /> },
        { id: "dashboard", label: "Active Move", icon: <LayoutDashboard size={20} /> },
        { id: "fleet", label: "Vehicle Status", icon: <Car size={20} /> },
        { id: "moving", label: "Move Sanctions", icon: <MapIcon size={20} /> },
        { id: "history", label: "Mileage", icon: <Gauge size={20} /> },
        { id: "Active_move", label: "Move History ", icon: <History size={20} /> },
        { id: "night_move", label: "Night Move Logs", icon: <ShieldAlert size={20} /> },
        { id: "alerts", label: "Violations/Alerts", icon: <AlertTriangle size={20} color="#ef4444" /> },
        { id: "settings", label: "Settings", icon: <Settings size={20} /> },
      ]
    },
    {
      label: "Project Info",
      items: [
        { id: "rd_team", label: "R&D Team", icon: <Users size={20} /> },
        { id: "architecture", label: "System Architecture", icon: <Cpu size={20} /> },
      ]
    }
  ];

  const hideScrollbarStyle = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div 
      className={`d-flex flex-column text-white shadow-lg sidebar ${isMobile && isOpen ? 'open' : ''}`}
      style={{
        width: collapsed ? "72px" : "230px",
        height: "100vh",
        flexShrink: 0,
        transition: "width 0.3s ease, left 0.3s ease",
        position: isMobile ? "absolute" : "relative",
        background: "linear-gradient(180deg,#020617 0%,#020617 55%,#020617 100%)",
        borderRight: "1px solid #111827"
      }}
    >
      
      {/* Internal CSS */}
      <style>
        {`
          .sidebar-toggle {
            position: absolute;
            bottom: 280px;
            right: -10px;
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
            border-left: none;
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

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Collapse Toggle */}
      <div
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </div>

      {/* Branding Header */}
      <div 
        className="p-3 pb-3 border-bottom text-center"
        style={{
          borderColor: "#111827",
          background: "radial-gradient(circle at top,#0b1120 0,#020617 55%,#020617 100%)"
        }}
      >
        <img 
          src={divLogo} 
          alt="34 DIV HQ" 
          style={{ height: collapsed ? "40px" : "54px", objectFit: "contain" }} 
        />
        {!collapsed && (
          <>
            <h5 className="mb-0 fw-bold" style={{ letterSpacing: "1px" }}>
              34 DIV VMS
            </h5>
           
          </>
        )}
      </div>

      {/* Navigation Area */}
      <div 
        className="flex-grow-1 overflow-y-auto py-3 px-2 no-scrollbar" 
        style={{ ...hideScrollbarStyle, overflowX: 'hidden' }}
      >
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-4">
            {!collapsed && (
              <small 
                className="text-uppercase fw-bold px-3 mb-2 d-block" 
                style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#6b7280' }}
              >
                {group.label}
              </small>
            )}
            {group.items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (active === item.id) {
                    window.location.reload();
                  } else {
                    setActive(item.id);
                  }
                  // Reset panic alerts count when clicking on alerts
                  if (item.id === "alerts") {
                    setPanicAlerts(0);
                    setAlertsViewed(true);
                  }
                }}
                className={`d-flex align-items-center px-3 py-2 rounded-3 mb-1 position-relative ${
                  active === item.id 
                    ? "text-white shadow-sm" 
                    : "text-secondary"
                }`}
                style={{ 
                  cursor: "pointer", 
                  transition: '0.2s',
                  background: active === item.id 
                    ? "linear-gradient(90deg,#16a34a,#22c55e)"
                    : "transparent",
                  borderLeft: active === item.id ? "3px solid #bbf7d0" : "3px solid transparent"
                }}
                onMouseEnter={(e) => {
                  if (active !== item.id) {
                    e.currentTarget.style.background = "linear-gradient(90deg,#020617,#020617 60%,#0b1120)";
                    e.currentTarget.style.color = "#e5e7eb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (active !== item.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                <span className="me-3 d-flex align-items-center position-relative">
                  {item.icon}
                  {item.id === "alerts" && panicAlerts > 0 && (
                    <span 
                      className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger"
                      style={{ 
                        fontSize: "8px", 
                        minWidth: "16px", 
                        height: "16px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        padding: "0",
                        lineHeight: "1"
                      }}
                    >
                      {panicAlerts}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span 
                    style={{ 
                      fontSize: "14px", 
                      fontWeight: active === item.id ? "700" : "400" 
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}