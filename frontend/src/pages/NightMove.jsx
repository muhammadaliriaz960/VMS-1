import React, { useState, useEffect } from "react";
import { Moon, Clock, MapPin, ShieldCheck, Download, Loader2, FileText, PlayCircle, Map, Route } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_URL } from '../config';

export default function NightMove({ onViewReplay }) {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMove, setSelectedMove] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState([]);
  const [nightMoveSettings, setNightMoveSettings] = useState({
    startTime: '20:00',
    endTime: '06:00'
  });

  // Fetch night moves with enhanced data
  const fetchNightMoves = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sidebar/night-move-logs`);
      const data = await res.json();
      
      // Enhanced data with mileage and timing calculations
      const enrichedData = data.map(m => {
        const recordedTime = new Date(m.recorded_at);
        const inTime = calculateInTime(recordedTime);
        const moveTime = calculateMoveTime(recordedTime);
        
        return {
          ...m,
          sanction_id: m.sanction_id || `SAN-${m.ba}-26`,
          destination: m.destination || "Wah Cantt",
          auth_by: "CO 41 Sig",
          mileage: Math.floor(Math.random() * 50) + 10, // Mock mileage (would come from DB)
          inTime: inTime,
          moveTime: moveTime
        };
      });
      
      setMoves(enrichedData);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  // Calculate in-time based on night move settings
  const calculateInTime = (recordedTime) => {
    const hours = recordedTime.getHours().toString().padStart(2, '0');
    const minutes = recordedTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate move time based on night move settings
  const calculateMoveTime = (recordedTime) => {
    const startHour = parseInt(nightMoveSettings.startTime.split(':')[0]);
    const endHour = parseInt(nightMoveSettings.endTime.split(':')[0]);
    const currentHour = recordedTime.getHours();
    
    // Check if current time is within night move period
    if (startHour > endHour) {
      // Crosses midnight (e.g., 20:00 to 06:00)
      if (currentHour >= startHour || currentHour < endHour) {
        return "Night Move";
      }
    } else {
      // Same day (e.g., 22:00 to 05:00 wouldn't happen, but handling anyway)
      if (currentHour >= startHour && currentHour < endHour) {
        return "Night Move";
      }
    }
    return "Day Time";
  };

  // Fetch night move history for map plotting
  const fetchMoveHistory = async (baNumber) => {
    try {
      // Mock path data for the selected vehicle
      const mockPath = [
        { lat: 33.7781, lng: 72.3611, time: "20:15", speed: 45 },
        { lat: 33.7791, lng: 72.3621, time: "20:20", speed: 50 },
        { lat: 33.7801, lng: 72.3631, time: "20:25", speed: 48 },
        { lat: 33.7811, lng: 72.3641, time: "20:30", speed: 52 },
        { lat: 33.7821, lng: 72.3651, time: "20:35", speed: 47 },
      ];
      
      setMapData(mockPath);
      setShowMap(true);
    } catch (err) {
      console.error("Error fetching move history:", err);
    }
  };

  // Handle plot button click
  const handlePlotClick = (move) => {
    setSelectedMove(move);
    fetchMoveHistory(move.ba);
  };

  // Export PDF function
  const exportPDF = () => {
    try {
      console.log("Exporting Night Moves PDF with data:", moves);
      
      const doc = new jsPDF();
      
      // 1. Add Header Content
      doc.setFontSize(18);
      doc.text("Night Moves Report", 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total Records: ${moves.length}`, 14, 30);
      
      // 2. Prepare table data
      const tableData = moves.map(move => [
        move.ba,
        move.unit,
        `${move.mileage} km`,
        move.moveTime,
        new Date(move.recorded_at).toLocaleString(),
        `${move.speed} km/h`,
        move.speed > 0 ? 'Moving' : 'Halted'
      ]);
      
      // 3. Add Table
      autoTable(doc, {
        head: [['BA Number', 'Unit', 'Mileage', 'Move Time', 'Recorded At', 'Speed', 'Status']],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [52, 58, 64],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });
      
      // 4. Save the file
      doc.save(`Night_Moves_Report_${Date.now()}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert("Could not generate PDF. Check console for details.");
    }
  };

  useEffect(() => {
    fetchNightMoves();
  }, []);

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Night Moves</h3>
          <p className="text-muted small mb-0">Live log of Night Moves.</p>
        </div>
        <button 
          onClick={exportPDF}
          className="btn btn-dark btn-sm d-flex align-items-center gap-2"
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr className="small text-uppercase text-center" style={{ fontSize: '10px' }}>
                <th className="ps-4 text-center">Asset / BA</th>
                <th className="text-center">Mileage</th>
                <th className="text-center">Move Time</th>
                <th className="text-center">Movement Time</th>
                <th className="text-center">Speed & Heading</th>
                <th className="text-center">Route Status</th>
                <th className="text-end pe-4 text-center">Tactical Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && moves.map((move, i) => (
                <tr key={i}>
                  <td className="ps-4 text-center">
                    <div className="fw-bold text-primary">{move.ba}</div>
                    <small className="text-muted">{move.unit}</small>
                  </td>
                  <td className="text-center">
                    <div className="fw-bold">{move.mileage} km</div>
                    <small className="text-muted">Total</small>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${
                      move.moveTime === 'Night Move' ? 'bg-warning text-dark' : 'bg-info'
                    }`}>
                      {move.moveTime}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span className="font-monospace">{new Date(move.recorded_at).toLocaleTimeString([], {hour12: false})}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="fw-bold">{move.speed} km/h</div>
                    <div className="x-small text-muted">To: {move.destination}</div>
                  </td>
                  <td className="text-center">
                    <span className={`badge rounded-pill ${move.speed > 0 ? 'bg-primary' : 'bg-success'}`}>
                      {move.speed > 0 ? 'Sanctioned Transit' : 'Halted'}
                    </span>
                  </td>
                  <td className="text-center pe-4">
                    <div className="d-flex justify-content-center gap-2">
                      <button 
                        onClick={() => handlePlotClick(move)}
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        title="Plot Night Move History"
                      >
                        <Route size={14} /> Plot
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Night Move History Map Modal */}
      {showMap && selectedMove && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  <Route size={18} className="me-2" />
                  Night Move History - {selectedMove.ba}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowMap(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div style={{ height: '500px' }}>
                  <MapContainer 
                    center={[33.7781, 72.3611]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Plot the route */}
                    {mapData.map((point, index) => (
                      <Marker 
                        key={index} 
                        position={[point.lat, point.lng]}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>{selectedMove.ba}</strong><br/>
                            Time: {point.time}<br/>
                            Speed: {point.speed} km/h<br/>
                            Lat: {point.lat.toFixed(4)}<br/>
                            Lng: {point.lng.toFixed(4)}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {/* Draw route line */}
                    <Polyline 
                      positions={mapData.map(point => [point.lat, point.lng])}
                      color="red"
                      weight={3}
                      opacity={0.7}
                    />
                  </MapContainer>
                </div>
              </div>
              <div className="modal-footer">
                <div className="row w-100">
                  <div className="col-md-3">
                    <div className="text-center">
                      <h6 className="text-muted">Total Distance</h6>
                      <h4 className="text-primary">{selectedMove.mileage} km</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h6 className="text-muted">Move Type</h6>
                      <h4>
                        <span className={`badge ${
                          selectedMove.moveTime === 'Night Move' ? 'bg-warning text-dark' : 'bg-info'
                        }`}>
                          {selectedMove.moveTime}
                        </span>
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h6 className="text-muted">In Time</h6>
                      <h4 className="text-success">{selectedMove.inTime}</h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h6 className="text-muted">Current Speed</h6>
                      <h4 className="text-info">{selectedMove.speed} km/h</h4>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowMap(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}