import React, { useState, useEffect, useMemo } from "react";
import { Filter, FileDown, MapPin, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function FleetStatus() {
  const [fleet, setFleet] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // Added state
  const [loading, setLoading] = useState(true);

  // 1. Fetching Logic (unchanged)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fleetRes, unitsRes] = await Promise.all([
          fetch('http://localhost:5000/api/fleet/status'),
          fetch('http://localhost:5000/api/units_full')
        ]);
        setFleet(await fleetRes.json());
        setUnits(await unitsRes.json());
        setLoading(false);
      } catch (err) {
        console.error("Init Error:", err);
        setLoading(false);
      }
    };
    fetchInitialData();
    const interval = setInterval(async () => {
      const res = await fetch('http://localhost:5000/api/fleet/status');
      setFleet(await res.json());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Filter Logic (Defined inside the component)
  const filteredFleet = useMemo(() => {
    let temp = fleet;
    if (selectedUnit !== "All") {
        temp = temp.filter(v => v.unit_name === selectedUnit);
    }
    if (statusFilter === "Moving") {
        return temp.filter(v => v.speed > 0);
    } else if (statusFilter === "Parked") {
        return temp.filter(v => v.speed === 0 || !v.speed);
    }
    return temp;
  }, [fleet, selectedUnit, statusFilter]);

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
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="p-4">
      {/* ... Your JSX Headers ... */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Fleet Inventory</h3>
          <p className="text-muted small">Live asset monitoring</p>
        </div>
        
        <div className="d-flex gap-2">
           {/* UNIT FILTER */}
           <div className="dropdown">
             <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
               <Filter size={16} className="me-1"/> {selectedUnit}
             </button>
             <ul className="dropdown-menu">
               <li><button className="dropdown-item" onClick={() => setSelectedUnit("All")}>All Units</button></li>
               {units.map(u => (
                 <li key={u.unit_id}><button className="dropdown-item" onClick={() => setSelectedUnit(u.unit_name)}>{u.unit_name}</button></li>
               ))}
             </ul>
           </div>

           {/* STATUS FILTER */}
           <div className="dropdown">
             <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
               <Filter size={16} className="me-1"/> Status: {statusFilter}
             </button>
             <ul className="dropdown-menu">
               <li><button className="dropdown-item" onClick={() => setStatusFilter("All")}>All</button></li>
               <li><button className="dropdown-item text-success" onClick={() => setStatusFilter("Moving")}>Moving</button></li>
               <li><button className="dropdown-item text-warning" onClick={() => setStatusFilter("Parked")}>Parked</button></li>
             </ul>
           </div>

           <button onClick={exportPDF} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
             <FileDown size={16} /> Export
           </button>
        </div>
      </div>

      {/* ... Table Section (using filteredFleet.map) ... */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
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
                  <td>{veh.unit_name}</td>
                  <td>
                    <span className={`badge rounded-pill ${veh.speed > 0 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                      {veh.speed > 0 ? 'Moving' : 'Parked'}
                    </span>
                  </td>
                  <td className="text-muted small">{Number(veh.latitude).toFixed(4)}, {Number(veh.longitude).toFixed(4)}</td>
                  <td className="pe-4 text-end fw-bold">{veh.speed || 0} km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}