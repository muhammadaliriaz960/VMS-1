import React, { useState, useEffect } from "react";
import { ShieldAlert, BatteryWarning, ZapOff, Bell, MapPin, Phone, VolumeX, Volume2 } from "lucide-react";
import { playBeep, startContinuousBeep, stopContinuousBeep } from "../utils/beep";

const criticalIncidents = [
  { id: 1, ba: "34-A-1234", unit: "HQ 34 DIV", type: "PANIC BUTTON", time: "2 Mins Ago", loc: "Sector B-2", battery: "85%" },
  { id: 2, ba: "16-GL-0104", unit: "3 LCB", type: "POWER DISCONNECT", time: "15 Mins Ago", loc: "Garrison North", battery: "0%" },
];

export default function PanicList() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beepInterval, setBeepInterval] = useState(null);

  // Play beep on component mount if there are critical incidents
  useEffect(() => {
    if (criticalIncidents.length > 0 && soundEnabled) {
      // Start continuous beep for panic alerts
      const hasPanicAlert = criticalIncidents.some(incident => incident.type === "PANIC BUTTON");
      if (hasPanicAlert) {
        const intervalId = startContinuousBeep('panic');
        setBeepInterval(intervalId);
      } else {
        // Single beep for other alerts
        playBeep('alert');
      }
    }

    // Cleanup beep on unmount
    return () => {
      if (beepInterval) {
        stopContinuousBeep(beepInterval);
      }
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (soundEnabled && beepInterval) {
      stopContinuousBeep(beepInterval);
      setBeepInterval(null);
    } else if (!soundEnabled && criticalIncidents.length > 0) {
      const hasPanicAlert = criticalIncidents.some(incident => incident.type === "PANIC BUTTON");
      if (hasPanicAlert) {
        const intervalId = startContinuousBeep('panic');
        setBeepInterval(intervalId);
      }
    }
  };

  return (
    <div className="p-4" style={{ animation: "fadeIn 0.3s ease-in" }}>
      {/* Emergency Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-danger d-flex align-items-center gap-2">
            <Bell className="animate-bounce" size={24} /> Emergency Status Room
          </h3>
          <p className="text-muted small">Live monitoring of SOS signals and hardware tampering alerts.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button 
            onClick={toggleSound}
            className={`btn btn-sm ${soundEnabled ? 'btn-success' : 'btn-secondary'} d-flex align-items-center gap-1`}
            title={soundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
          <div className="bg-danger-subtle text-danger px-3 py-2 rounded fw-bold border border-danger small">
            SYSTEM STATUS: HIGH ALERT
          </div>
        </div>
      </div>

      {/* Critical Incident Cards */}
      <div className="row g-3 mb-4">
        {criticalIncidents.map((incident) => (
          <div className="col-lg-6" key={incident.id}>
            <div className="card border-danger shadow-lg bg-white overflow-hidden">
              <div className="row g-0">
                <div className="col-3 bg-danger d-flex align-items-center justify-content-center">
                  {incident.type === "PANIC BUTTON" ? 
                    <ShieldAlert size={48} className="text-white" /> : 
                    <ZapOff size={48} className="text-white" />
                  }
                </div>
                <div className="col-9 p-3">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <h5 className="fw-bold mb-0">{incident.ba}</h5>
                    <span className="text-danger fw-bold small">{incident.time}</span>
                  </div>
                  <div className="row small">
                    <div className="col-6"><strong>Unit:</strong> {incident.unit}</div>
                    <div className="col-6 text-end text-danger fw-bold">{incident.type}</div>
                    <div className="col-12 mt-2 d-flex align-items-center gap-1 text-muted">
                      <MapPin size={12} /> Last Known: {incident.loc}
                    </div>
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button className="btn btn-danger btn-sm w-100 fw-bold">DISPATCH QRF</button>
                    <button className="btn btn-outline-secondary btn-sm"><Phone size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Incident Log */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom">
          <h6 className="mb-0 fw-bold text-muted text-uppercase small">Recent Alert History</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small" style={{ fontSize: '11px' }}>
                <th className="ps-4">BA Number</th>
                <th>Alert Type</th>
                <th>Unit Assignment</th>
                <th>Time Received</th>
                <th>Voltage/Battery</th>
                <th className="text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontSize: '14px' }}>
                <td className="ps-4 fw-bold">22-GJ-1109</td>
                <td><span className="text-warning fw-bold">LOW BATTERY</span></td>
                <td>751 WC</td>
                <td>08:45 AM</td>
                <td>11.2V</td>
                <td className="text-end pe-4 text-success fw-bold">Acknowledged</td>
              </tr>
              <tr style={{ fontSize: '14px' }}>
                <td className="ps-4 fw-bold">19-GJ-2114</td>
                <td><span className="text-secondary fw-bold">GPS SIGNAL LOSS</span></td>
                <td>41 Sig Bn</td>
                <td>06:30 AM</td>
                <td>13.8V</td>
                <td className="text-end pe-4 text-muted small">Automatic Clear</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}