import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Clock, CheckCircle, MapPin, Loader2 } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sidebar/violations-alerts');
      const data = await res.json();
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch alerts error:", err);
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    // In a real app, you'd call a PUT/PATCH endpoint here
    // For now, we'll filter it out locally to show the UI response
    setAlerts(prev => prev.filter(a => a.alert_id !== id));
    alert(`Alert ${id} marked as resolved in HQ Log.`);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats from live data
  const criticalCount = alerts.filter(a => a.alert_type === 'SOS_TRIGGER' || a.alert_type === 'GEOFENCE_EXIT').length;

  return (
    <div className="p-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Violations & Sanctions</h3>
          <p className="text-muted small mb-0">Live log of disciplinary and security breaches across all units.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm px-3" onClick={fetchAlerts}>Refresh Feed</button>
          <button className="btn btn-dark btn-sm px-3">Download Log</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Critical', count: criticalCount, color: 'text-danger', icon: <ShieldAlert size={18}/> },
          { label: 'Active', count: alerts.length, color: 'text-primary', icon: <Clock size={18}/> },
          { label: 'Units Flagged', count: [...new Set(alerts.map(a => a.unit))].length, color: 'text-warning', icon: <AlertTriangle size={18}/> }
        ].map((stat, i) => (
          <div className="col-md-4" key={i}>
            <div className="card border-0 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small fw-bold text-uppercase">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="fs-3 fw-bold">{String(stat.count).padStart(2, '0')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>
                <th className="ps-4">Timestamp</th>
                <th>BA Number / Unit</th>
                <th>Violation Type</th>
                <th>Details</th>
                {/* <th>Status</th> */}
                {/* <th className="text-end pe-4">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5"><Loader2 className="animate-spin" /></td>
                </tr>
              ) : alerts.length > 0 ? alerts.map((alert) => (
                <tr key={alert.alert_id} style={{ fontSize: '14px' }}>
                  <td className="ps-4 text-muted">
                    <div className="small">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{alert.ba}</div>
                    <div className="text-muted small">{alert.unit}</div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      alert.alert_type === 'SOS_TRIGGER' ? 'bg-danger' : 
                      alert.alert_type === 'OVERSPEED' ? 'bg-warning text-dark' : 'bg-secondary'
                    }`}>
                      {alert.alert_type}
                    </span>
                  </td>
                  <td className="text-muted small" style={{ maxWidth: '300px' }}>
                    {alert.details}
                  </td>
                  {/* <td>
                    <span className="badge bg-light text-danger border border-danger-subtle">Unresolved</span>
                  </td> */}
                  <td className="text-end pe-4">
                    {/* <button className="btn btn-outline-primary btn-sm me-2">Investigate</button> */}
                    {/* <button 
                      className="btn btn-success btn-sm text-white" 
                      onClick={() => resolveAlert(alert.alert_id)}
                    >
                      <CheckCircle size={14} />
                    </button> */}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No active violations detected. System clear.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}