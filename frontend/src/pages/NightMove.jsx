import React, { useState, useEffect } from "react";
import { Moon, Clock, MapPin, ShieldCheck, Download, Loader2, FileText, PlayCircle } from "lucide-react";

export default function NightMove({ onViewReplay }) {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch night moves with mock sanction data included
  const fetchNightMoves = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sidebar/night-move-logs');
      const data = await res.json();
      // In a real DB, your join would provide these fields
      const enrichedData = data.map(m => ({
        ...m,
        sanction_id: m.sanction_id || `SAN-${m.ba}-26`,
        destination: m.destination || "Wah Cantt",
        auth_by: "CO 41 Sig"
      }));
      setMoves(enrichedData);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNightMoves();
  }, []);

  return (
    <div className="p-4">
      {/* Header & Stats omitted for brevity, same as previous */}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr className="small text-uppercase" style={{ fontSize: '10px' }}>
                <th className="ps-4">Asset / BA</th>
                <th>Sanction ID</th>
                <th>Movement Time</th>
                <th>Speed & Heading</th>
                <th>Route Status</th>
                <th className="text-end pe-4">Tactical Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && moves.map((move, i) => (
                <tr key={i}>
                  <td className="ps-4">
                    <div className="fw-bold text-primary">{move.ba}</div>
                    <small className="text-muted">{move.unit}</small>
                  </td>
                  <td>
                    <button className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1">
                      <FileText size={14} /> {move.sanction_id}
                    </button>
                    <div className="x-small text-muted" style={{fontSize: '10px'}}>Auth: {move.auth_by}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span className="font-monospace">{new Date(move.recorded_at).toLocaleTimeString([], {hour12: false})}</span>
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold">{move.speed} km/h</div>
                    <div className="x-small text-muted">To: {move.destination}</div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${move.speed > 0 ? 'bg-primary' : 'bg-success'}`}>
                      {move.speed > 0 ? 'Sanctioned Transit' : 'Halted'}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      {/* This button links to your ActiveMove logic */}
                      <button 
                        onClick={() => onViewReplay(move.ba)}
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      >
                        <PlayCircle size={14} /> Monitor
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}