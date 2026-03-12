import React, { useState, useEffect } from "react";
import { API_URL } from '../config';

export default function SummaryDashboard() {
  const [summaryData, setSummaryData] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    faultyVehicles: 0,
    overspeedCount: 0,
    unsanctionedCount: 0
  });

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      // Parallelize data fetching for better speed
      const [fleetRes, violationsRes] = await Promise.all([
        fetch(`${API_URL}/api/fleet/status`),
        fetch(`${API_URL}/api/sidebar/violations-alerts`)
      ]);
      
      const [fleetData, violationsData] = await Promise.all([
        fleetRes.json(),
        violationsRes.json()
      ]);
      
      // Efficient processing
      const activeCount = fleetData.filter(v => v.vehicle_status === 'ACTIVE' || v.vehicle_status === 'PARKED').length;
      const faultyCount = fleetData.filter(v => v.vehicle_status === 'FAULTY' || v.vehicle_status === 'OFFLINE').length;
      const overspeedCount = violationsData.filter(v => v.alert_type === 'OVERSPEED').length;
      const unsanctionedCount = violationsData.filter(v => v.alert_type === 'UNSANCTIONED_MOVE').length;
      
      setSummaryData({
        totalVehicles: fleetData.length,
        activeVehicles: activeCount,
        faultyVehicles: faultyCount,
        overspeedCount: overspeedCount,
        unsanctionedCount: unsanctionedCount
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`rounded-circle p-3 me-3`} style={{ backgroundColor: `${color}20` }}>
            <span style={{ fontSize: '24px', color }}>{icon}</span>
          </div>
          <div>
            <h6 className="text-muted mb-1" style={{ fontSize: '12px' }}>{title}</h6>
            <h4 className="mb-0 fw-bold" style={{ color }}>{value}</h4>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Summary Dashboard</h3>
          <p className="text-muted small">Real-time fleet analytics</p>
        </div>
        <button onClick={fetchSummaryData} className="btn btn-primary btn-sm">
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <StatCard 
            title="Total Vehicles" 
            value={summaryData.totalVehicles} 
            color="#6366f1"
            icon="🚗"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard 
            title="Active Vehicles" 
            value={summaryData.activeVehicles} 
            color="#22c55e"
            icon="✅"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard 
            title="Faulty Vehicles" 
            value={summaryData.faultyVehicles} 
            color="#dc2626"
            icon="⚠️"
          />
        </div>
        <div className="col-md-3 mb-3">
          <StatCard 
            title="Overspeed Alerts" 
            value={summaryData.overspeedCount} 
            color="#f59e0b"
            icon="🏃"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="row">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0">
              <h6 className="mb-0 fw-bold">System Overview</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted">Vehicle Status</h6>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Active Vehicles</span>
                      <span className="fw-bold text-success">{summaryData.activeVehicles}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ 
                          width: `${(summaryData.activeVehicles / summaryData.totalVehicles) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Faulty Vehicles</span>
                      <span className="fw-bold text-danger">{summaryData.faultyVehicles}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ 
                          width: `${(summaryData.faultyVehicles / summaryData.totalVehicles) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Alert Summary</h6>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Overspeed Alerts</span>
                      <span className="fw-bold text-warning">{summaryData.overspeedCount}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ 
                          width: `${Math.min((summaryData.overspeedCount / Math.max(summaryData.totalVehicles, 1)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Unsanctioned Moves</span>
                      <span className="fw-bold text-info">{summaryData.unsanctionedCount}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ 
                          width: `${Math.min((summaryData.unsanctionedCount / Math.max(summaryData.totalVehicles, 1)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
