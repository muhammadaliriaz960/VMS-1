import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardMap from "./pages/DashboardMap";
import OverallSummary from "./pages/OverallSummary";
import FleetStatus from "./pages/FleetStatus";
import MoveSanction from "./pages/MoveSanction";
import MoveHistory from "./pages/MoveHistory";
import History from "./pages/History";
import AlertsPage from "./pages/AlertsPage";
import Settings from "./pages/Settings";
import TeamPage from "./pages/TeamPage";
import Architecture from "./pages/Architecture";
import NightMove from "./pages/NightMove";

import Login from "./pages/Login";
import { TrackingProvider } from './context/TrackingContext';

import "./responsive.css";

export default function App() {
  const [activePage, setActivePage] = useState("overall_summary");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load authentication state from localStorage on app startup
  useEffect(() => {
    const savedUser = localStorage.getItem('vms_user');
    const savedLoginState = localStorage.getItem('vms_logged_in');
    
    if (savedUser && savedLoginState === 'true') {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear corrupted data
        localStorage.removeItem('vms_user');
        localStorage.removeItem('vms_logged_in');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Save to localStorage for persistence
    localStorage.setItem('vms_user', JSON.stringify(userData));
    localStorage.setItem('vms_logged_in', 'true');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActivePage("overall_summary");
    // Clear localStorage only on explicit logout
    localStorage.removeItem('vms_user');
    localStorage.removeItem('vms_logged_in');
  };

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <TrackingProvider>
      <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar 
          active={activePage} 
          setActive={setActivePage}
          user={user} 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <div className="flex-grow-1 d-flex flex-column bg-light main-content">
          <main className="flex-grow-1 overflow-auto">
            {activePage === "dashboard" ? <DashboardMap setActivePage={setActivePage} onLogout={handleLogout} /> : 
             activePage === "overall_summary" ? <OverallSummary setActivePage={setActivePage} onLogout={handleLogout} /> :
             activePage === "fleet" ? <FleetStatus /> :
             activePage === "moving" ? <MoveSanction /> :
             activePage === "history" ? <History /> :
             activePage === "Active_move" ? <MoveHistory /> :
             activePage === "night_move" ? <NightMove /> :

             activePage === "alerts" ? <AlertsPage /> :
             activePage === "settings" ? <Settings /> :
             activePage === "rd_team" ? <TeamPage /> :
             activePage === "architecture" ? <Architecture /> : (
              <div className="p-4">
                <h1>Page Not Found</h1>
                <p>The page "{activePage}" is not available.</p>
                <button 
                  onClick={() => setActivePage("dashboard")}
                  className="btn btn-primary"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </TrackingProvider>
  );
}