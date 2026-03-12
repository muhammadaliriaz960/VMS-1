import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Clock, CheckCircle, Loader2 } from "lucide-react";
import { playBeep, startContinuousBeep, stopContinuousBeep } from "../utils/beep";
import { API_URL } from '../config';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beepInterval, setBeepInterval] = useState(null);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sidebar/violations-alerts`);
      const data = await res.json();
      
      // Get the last known alert count from localStorage
      const storedCount = parseInt(localStorage.getItem('lastAlertCount') || '0');
      
      // Only play beep for NEW alerts that haven't been seen yet
      if (data.length > storedCount) {
        const newAlerts = data.slice(storedCount);
        const hasCriticalAlert = newAlerts.some(alert => 
          alert.alert_type === 'PANIC' || alert.alert_type === 'OVERSPEED' || alert.alert_type === 'UNSANCTIONED_MOVE' || alert.alert_type === 'POWER_CUT'
        );
        
        if (hasCriticalAlert) {
          // Stop any existing continuous beep before starting a new one
          if (beepInterval) {
            stopContinuousBeep(beepInterval);
            setBeepInterval(null);
          }
          
          const hasPanic = newAlerts.some(alert => alert.alert_type === 'PANIC');
          if (hasPanic) {
            // Play 2 beeps for panic
            playBeep('panic');
            const intervalId = startContinuousBeep('panic');
            setBeepInterval(intervalId);
          } else {
            const hasOverspeed = newAlerts.some(alert => alert.alert_type === 'OVERSPEED');
            if (hasOverspeed) {
              // Play 3 beeps for overspeed
              playBeep('overspeed');
            } else {
              playBeep('alert'); // For unsanctioned movement
            }
          }
        }
      }
      
      // Update the stored count to current alert count
      localStorage.setItem('lastAlertCount', data.length.toString());
      setAlerts(data);
      setLastAlertCount(data.length);
      setLoading(false);
    } catch (err) {
      console.error("Fetch alerts error:", err);
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a.alert_id !== id));
    alert(`Alert ${id} marked as resolved in HQ Log.`);
  };

  // Clear notification badge when component mounts
  useEffect(() => {
    // Clear any stored notification count
    localStorage.setItem('alertNotificationCount', '0');
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => {
      clearInterval(interval);
      if (beepInterval) {
        stopContinuousBeep(beepInterval);
      }
    };
  }, []);

  // Reset notification flag when alerts are manually refreshed
  const handleRefresh = () => {
    // Clear the stored count to allow beeping for new alerts
    localStorage.removeItem('lastAlertCount');
    fetchAlerts();
  };

  // Calculate stats from live data
  const criticalCount = alerts.filter(a => a.alert_type === 'PANIC' || a.alert_type === 'OVERSPEED' || a.alert_type === 'POWER_CUT').length;

  return (
    <div className="p-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Violations & Sanctions</h3>
          <p className="text-muted small mb-0">Live log of disciplinary and security breaches across all units.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm px-3" onClick={handleRefresh}>Refresh Feed</button>
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
              <tr className="text-muted small text-uppercase" style={{ fontSize: '11px' }}><th className="ps-4">Timestamp</th><th>BA Number / Unit</th><th>Violation Type</th><th>Details</th><th>Location</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5"><Loader2 className="animate-spin" /></td>
                </tr>
              ) : alerts.length > 0 ? alerts.map((alert) => (
                <tr key={alert.alert_id} style={{ fontSize: '14px' }}>
                  <td className="ps-4 text-muted">
                    <div className="small">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">
                      {alert.ba}
                      {(alert.alert_type === 'OVERSPEED' || alert.alert_type === 'POWER_CUT') && (
                        <span className="ms-1" style={{ color: "#dc2626", fontSize: "10px" }}>⚠️</span>
                      )}
                    </div>
                    <div className="text-muted small">{alert.unit}</div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      alert.alert_type === 'PANIC' ? 'bg-danger' :
                      alert.alert_type === 'OVERSPEED' ? 'bg-warning text-dark' : 
                      alert.alert_type === 'UNSANCTIONED_MOVE' ? 'bg-info text-white' : 
                      alert.alert_type === 'POWER_CUT' ? 'bg-danger border border-white' : 'bg-secondary'
                    }`}>
                      {alert.alert_type === 'UNSANCTIONED_MOVE' ? 'UNAUTHORIZED MOVE' : 
                       alert.alert_type === 'POWER_CUT' ? 'EXTERNAL POWER CUT' : alert.alert_type}
                    </span>
                  </td>
                  <td className="text-muted small" style={{ maxWidth: '300px' }}>
                    {alert.details}
                  </td>
                  <td className="text-muted small" style={{ maxWidth: '300px' }}>
                    {alert.location_name || 'N/A'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No active violations detected. System clear.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}