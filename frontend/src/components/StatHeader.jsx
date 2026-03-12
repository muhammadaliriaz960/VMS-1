import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import signalsLogo from "../assets/images/UnitLogo3.png";
import { API_URL } from '../config';

export default function StatHeader() {
  const [data, setData] = useState({ total: 0, active: 0, faulty: 0, violations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [fleetRes, alertRes] = await Promise.all([
          fetch(`${API_URL}/api/fleet/status`),
          fetch(`${API_URL}/api/sidebar/violations-alerts`)
        ]);

        const fleet = await fleetRes.json();
        const alerts = await alertRes.json();

        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        let activeCount = 0;
        let faultyCount = 0;

        fleet.forEach(v => {
          const lastPing = v.last_ping ? new Date(v.last_ping) : null;
          const timeDiff = lastPing ? (now - lastPing) : Infinity;
          
          // CRITERIA FOR FAULTY:
          // 1. No data for > 24 hours OR
          // 2. Battery reported as dead/low (assuming 'battery_level' column exists)
          const isSilent = timeDiff > oneDayInMs;
          const isDeadBattery = v.battery_level !== undefined && v.battery_level < 10;

          if (isSilent || isDeadBattery) {
            faultyCount++;
          } else {
            activeCount++;
          }
        });

        setData({
          total: fleet.length,
          active: activeCount,
          faulty: faultyCount,
          violations: alerts.length
        });
        setLoading(false);
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Assets", value: data.total, color: "text-black" },
    { label: "Active", value: data.active, color: "text-success" },
    { label: "Faulty", value: data.faulty, color: "text-danger" },
    { label: "Violations (24h)", value: data.violations, color: "text-warning" },
  ];

  return (
    <div className="bg-white border-bottom shadow-sm p-3 d-flex align-items-center justify-content-between">
      <div className="d-flex gap-4">
        {loading ? (
          <div className="text-muted small">
            <Loader2 size={16} className="animate-spin me-2" />
            Syncing...
          </div>
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="border-end pe-4 last-child-no-border">
              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                {stat.label}
              </div>
              <div className={`fs-4 fw-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))
        )}
      </div>
      <img src={signalsLogo} alt="41 Signals" style={{ height: "60px", objectFit: "contain" }} />
    </div>
  );
}