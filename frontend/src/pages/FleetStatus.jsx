import React, { useState, useEffect, useMemo } from "react";
import { Filter, FileDown, MapPin, Loader2, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_URL } from '../config';

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
    engine_status: "ON",
    vehicle_status: "ACTIVE"
  },
  {
    vehicle_no: "BA-456", 
    unit_name: "341 BDE",
    vehicle_type: "5 Ton Truck",
    latitude: 30.1741,
    longitude: 71.3913,
    speed: 0,
    is_blocked: 0,
    engine_status: "ON",
    vehicle_status: "PARKED"
  },
  {
    vehicle_no: "BA-789",
    unit_name: "342 BDE", 
    vehicle_type: "Jeep",
    latitude: 31.4787,
    longitude: 74.4160,
    speed: 60,
    is_blocked: 1,
    engine_status: "OFF",
    vehicle_status: "FAULTY"
  }
];

const mockUnits = [
  { unit_id: 1, unit_name: "340 BDE" },
  { unit_id: 2, unit_name: "341 BDE" },
  { unit_id: 3, unit_name: "342 BDE" },
  { unit_id: 4, unit_name: "34 DIV ARTY" },
  { unit_id: 5, unit_name: "34 DIV" }
];

export default function FleetStatus() {
  const [fleet, setFleet] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // Added state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // New state for tabs
  const [error, setError] = useState(null);

  // Debug logging
  console.log("FleetStatus component rendering, loading:", loading, "fleet length:", fleet.length);

  const getSpeedStyle = (speed) => {
    if (speed > 80) return { color: '#dc2626', fontWeight: 'bold' }; // High Speed - Red
    if (speed > 60) return { color: '#f59e0b', fontWeight: 'bold' }; // Moderate Speed - Yellow
    if (speed > 0) return { color: '#22c55e', fontWeight: 'bold' }; // Moving - Green
    return { color: '#6b7280' }; // Stopped - Gray
  };

  const getStatusBadge = (status) => {
    const baseClass = "badge rounded-pill px-3 py-1";
    switch(status) {
      case 'ACTIVE': return <span className={`${baseClass} bg-success`}>ACTIVE</span>;
      case 'PARKED': return <span className={`${baseClass} bg-primary`}>PARKED</span>;
      case 'FAULTY': return <span className={`${baseClass} bg-danger`}>FAULTY</span>;
      case 'OFFLINE': return <span className={`${baseClass} bg-secondary`}>OFFLINE</span>;
      default: return <span className={`${baseClass} bg-dark`}>{status}</span>;
    }
  };

  // 1. Fetching Logic (unchanged)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log("Fetching fleet data...");
        
        // Test backend connection first
        console.log("Testing backend connection...");
        const testResponse = await fetch(`${API_URL}/api/fleet/status`);
        console.log("Backend response status:", testResponse.status);
        console.log("Backend response ok:", testResponse.ok);
        
        if (!testResponse.ok) {
          console.error("Backend not responding correctly - using mock data");
          setError(`Backend API error: ${testResponse.status} - Using mock data`);
          setFleet(mockFleet);
          setUnits(mockUnits);
          setLoading(false);
          return;
        }
        
        const [fleetRes, unitsRes] = await Promise.all([
          fetch(`${API_URL}/api/fleet/status`),
          fetch(`${API_URL}/api/units_full`)
        ]);
        
        if (fleetRes.ok) {
          const fleetData = await fleetRes.json();
          console.log("Fleet data received:", fleetData);
          console.log("Fleet data type:", typeof fleetData);
          console.log("Fleet data is array:", Array.isArray(fleetData));
          
          if (Array.isArray(fleetData)) {
            console.log("First vehicle data:", fleetData[0]);
          }
          
          setFleet(fleetData || []);
        } else {
          console.error("Fleet API error:", fleetRes.status);
          setError(`Fleet API error: ${fleetRes.status} - Using mock data`);
          setFleet(mockFleet);
          setUnits(mockUnits);
        }
        
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          console.log("Units data received:", unitsData);
          setUnits(unitsData || []);
        } else {
          console.error("Units API error:", unitsRes.status);
          setUnits(mockUnits);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Init Error:", err);
        setError(`Connection error: ${err.message} - Using mock data`);
        setFleet(mockFleet);
        setUnits(mockUnits);
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/fleet/status`);
        if (res.ok) {
          const data = await res.json();
          setFleet(data || []);
        }
      } catch (err) {
        console.error("Interval fetch error:", err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 2. Filter Logic (Defined inside the component)
  const filteredFleet = useMemo(() => {
    console.log("Filtering fleet, original fleet:", fleet);
    console.log("Selected unit:", selectedUnit, "Active tab:", activeTab, "Status filter:", statusFilter);
    
    // Use mock data if fleet is empty (backend down)
    const dataToUse = fleet.length > 0 ? fleet : mockFleet;
    console.log("Using data:", fleet.length > 0 ? "real fleet" : "mock data", "length:", dataToUse.length);
    
    let temp = dataToUse;
    
    // Apply unit filter
    if (selectedUnit !== "All") {
        temp = temp.filter(v => v.unit_name === selectedUnit);
        console.log("After unit filter:", temp);
    }
    
    // Apply tab-based filtering
    if (activeTab === "active") {
      temp = temp.filter(v => v.vehicle_status === 'ACTIVE' || v.vehicle_status === 'PARKED');
      console.log("After active tab filter:", temp);
    } else if (activeTab === "faulty") {
      temp = temp.filter(v => v.vehicle_status === 'FAULTY' || v.vehicle_status === 'OFFLINE' || v.is_faulty === 1);
      console.log("After faulty tab filter:", temp);
    }
    
    // Apply status filter (legacy, for backward compatibility)
    if (statusFilter === "Moving") {
        temp = temp.filter(v => v.speed > 0);
        console.log("After moving filter:", temp);
    } else if (statusFilter === "Parked") {
        temp = temp.filter(v => v.speed === 0 || !v.speed);
        console.log("After parked filter:", temp);
    }
    
    console.log("Final filtered fleet:", temp);
    return temp;
  }, [fleet, selectedUnit, statusFilter, activeTab]);

  // 3. Export PDF Logic (Defined inside the component so it can see filteredFleet)
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add Report Branding & Filter Context
    doc.setFontSize(18);
    doc.text("Fleet Status Report", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Filters Applied - Unit: ${selectedUnit} | Status: ${statusFilter}`, 14, 27);

    // Map ONLY the filtered data to table rows
    const tableRows = filteredFleet.map(v => [
      v.vehicle_no,
      v.unit_name,
      v.vehicle_type,
      v.speed > 0 ? "Moving" : "Parked",
      `${v.speed || 0} km/h`,
      `${Number(v.latitude).toFixed(4)}, ${Number(v.longitude).toFixed(4)}`
    ]);

    autoTable(doc, {
      head: [["BA Number", "Unit", "Type", "Status", "Speed", "Coordinates"]],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [33, 37, 41] }, // Dark theme for headers
      styles: { fontSize: 9 }
    });

    doc.save(`Fleet_Report_${selectedUnit}_${statusFilter}.pdf`);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="mt-3 text-muted">Loading fleet data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h4 className="text-danger">Error loading data</h4>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="table-responsive">
          <h3 className="fw-bold mb-0">Fleet Inventory</h3>
          <p className="text-muted small">Live asset monitoring</p>
        </div>
        <div className="d-flex gap-2">
           <button onClick={exportPDF} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
             <FileDown size={16} /> Export
           </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs border-0" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
              type="button"
              role="tab"
            >
              <span className="d-flex align-items-center gap-2">
                <span className="badge bg-success rounded-pill">
                  {fleet.filter(v => v.vehicle_status === 'ACTIVE' || v.vehicle_status === 'PARKED').length}
                </span>
                Active Vehicles
              </span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === "faulty" ? "active" : ""}`}
              onClick={() => setActiveTab("faulty")}
              type="button"
              role="tab"
            >
              <span className="d-flex align-items-center gap-2">
                <span className="badge bg-danger rounded-pill">
                  {fleet.filter(v => v.vehicle_status === 'FAULTY' || v.vehicle_status === 'OFFLINE' || v.is_faulty === 1).length}
                </span>
                Faulty Vehicles
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* ... Table Section (using filteredFleet.map) ... */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          {filteredFleet.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <h5>No vehicles found</h5>
                <p>Try adjusting your filters or check if vehicles are reporting data.</p>
              </div>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4">BA Number</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th className="pe-4 text-end">Speed</th>
                </tr>
              </thead>
              <tbody>
                {filteredFleet.map((veh) => (
                  <tr key={veh.vehicle_no}>
                    <td className="ps-4 fw-bold text-primary">{veh.vehicle_no}</td>
                    <td className="text-muted">{veh.unit_name}</td>
                    <td>{getStatusBadge(veh.vehicle_status || (veh.speed > 0 ? 'ACTIVE' : 'PARKED'))}</td>
                    <td className="text-muted small font-monospace">
                      {Number(veh.latitude).toFixed(5)}, {Number(veh.longitude).toFixed(5)}
                    </td>
                    <td className="pe-4 text-end" style={getSpeedStyle(veh.speed || 0)}>
                      {veh.speed || 0} <small className="text-muted fw-normal">km/h</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

