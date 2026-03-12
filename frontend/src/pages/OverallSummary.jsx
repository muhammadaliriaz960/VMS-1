import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Settings, LogOut, RefreshCw } from 'lucide-react';
import signalsLogo from "../assets/images/UnitLogo3.png";
import { API_URL } from '../config';

export default function OverallSummary({ setActivePage, onLogout }) {
  const [summaryData, setSummaryData] = useState({
    trackerStatus: [],
    overspeedByUnit: [],
    vehicleStatusByUnit: []
  });
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch real units from database
  const fetchSummaryData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch all data in parallel
      const [unitsResponse, fleetResponse, violationsResponse] = await Promise.all([
        fetch(`${API_URL}/api/units_full`),
        fetch(`${API_URL}/api/fleet/status`),
        fetch(`${API_URL}/api/sidebar/violations-alerts`)
      ]);

      const units = await unitsResponse.json();
      const fleet = await fleetResponse.json();
      const violations = await violationsResponse.json();

      // Calculate tracker status from fleet data
      const workingCount = fleet.filter(v => v.vehicle_status === 'ACTIVE').length;
      const faultyCount = fleet.filter(v => v.vehicle_status === 'FAULTY' || v.is_faulty === 1).length;

      const trackerStatusData = [
        { name: 'Active', value: workingCount, color: '#22c55e' },
        { name: 'Faulty', value: faultyCount, color: '#ef4444' }
      ];

      // Calculate overspeed violations by unit from real violations data
      const overspeedViolations = violations.filter(v => v.alert_type === 'OVERSPEED');
      const overspeedByUnit = units.map(unit => {
        const unitViolations = overspeedViolations.filter(v => v.unit === unit.unit_name);
        return {
          unit: unit.unit_name,
          violations: unitViolations.length
        };
      }).filter(unit => unit.violations > 0); // Only show units with violations

      // Calculate vehicle status by unit from fleet data
      const vehicleStatusByUnit = units.map(unit => {
        const unitVehicles = fleet.filter(v => v.unit_name === unit.unit_name);
        const active = unitVehicles.filter(v => v.vehicle_status === 'ACTIVE').length;
        const faulty = unitVehicles.filter(v => v.vehicle_status === 'FAULTY' || v.is_faulty === 1).length;
        
        return {
          unit: unit.unit_name,
          active: active,
          faulty: faulty,
          total: unitVehicles.length
        };
      }).filter(unit => unit.total > 0); // Only show units with vehicles

      setSummaryData({
        trackerStatus: trackerStatusData,
        overspeedByUnit: overspeedByUnit,
        vehicleStatusByUnit: vehicleStatusByUnit
      });
      
      setLastUpdated(new Date());
      console.log('Summary data updated:', { 
        units: units.length, 
        vehicles: fleet.length,
        vehicleStatusByUnit: vehicleStatusByUnit,
        overspeedByUnit: overspeedByUnit
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
      // Set empty data on error to show "no data" state
      setSummaryData({
        trackerStatus: [
          { name: 'Active', value: 0, color: '#22c55e' },
          { name: 'Faulty', value: 0, color: '#ef4444' }
        ],
        overspeedByUnit: [],
        vehicleStatusByUnit: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSummaryData();
  }, []);

  // Periodic data refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummaryData(true); // Refresh without showing loading spinner
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    fetchSummaryData(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.position-relative')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const COLORS = ['#22c55e', '#ef4444', '#6b7280', '#f59e0b', '#3b82f6'];

  return (
    <div className="vh-100 bg-light d-flex flex-column" style={{ width: '100%', overflow: 'hidden' }}>
      {/* TOP NAV BAR */}
      <div className="position-relative" style={{ zIndex: 1000 }}>
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 shadow-lg flex-nowrap"
          style={{
            background: "linear-gradient(90deg,#020617 0%,#020617 40%,#030712 100%)",
            backdropFilter: "blur(14px)",
            height: "60px",
            borderBottom: "1px solid rgba(15,23,42,0.9)",
            width: "100%",
            flexShrink: 0
          }}
        >
          {/* Left: logo */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <img
                src={signalsLogo}
                alt="Logo"
                style={{ height: "34px", filter: "brightness(0) invert(1)" }}
              />
            </div>
          </div>

          {/* Right: profile menu */}
          <div className="d-flex align-items-center gap-3 text-end flex-shrink-0">
            {/* Profile Menu */}
            <div className="position-relative">
              <button
                className="btn btn-outline-light btn-sm"
                style={{ 
                  border: "none",
                  color: "white",
                  padding: "6px 10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  zIndex: 1001
                }}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ transition: 'all 0.3s ease' }}>
                  <rect width="16" height="2" rx="1" fill="currentColor" opacity="0.8"/>
                  <rect x="6" y="4.5" width="10" height="2" rx="1" fill="currentColor"/>
                  <rect y="9" width="16" height="2" rx="1" fill="currentColor" opacity="0.8"/>
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div 
                  className="position-absolute"
                  style={{ 
                    top: "100%", 
                    right: "0", 
                    marginTop: "6px",
                    minWidth: "160px",
                    zIndex: 9999,
                    position: "absolute"
                  }}
                >
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '8px',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                      overflow: 'hidden',
                      animation: 'slideDown 0.3s ease-out'
                    }}
                  >
                    <div className="py-1">
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-white"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Profile</span>
                      </button>
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-white"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => {
                          setActivePage && setActivePage('settings');
                          setProfileMenuOpen(false);
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Settings size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Settings</span>
                      </button>
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-white"
                        style={{ 
                          backgroundColor: "transparent", 
                          border: "none",
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => {
                          onLogout && onLogout();
                          setProfileMenuOpen(false);
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <LogOut size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-auto" style={{ width: '100%' }}>
        <div className="container-fluid p-4" style={{ maxWidth: '100%' }}>
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
        
        {/* Header Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="fw-bold mb-1 text-dark">Statistics Corner</h3>
              <p className="text-muted small mb-0">Real-time fleet monitoring and analytics dashboard</p>
              <small className="text-muted">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </small>
            </div>
            <button 
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                borderRadius: '8px',
                border: '1px solid #667eea',
                color: '#667eea',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#667eea';
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

      {loading ? (
        <div 
          className="text-center py-5"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="mb-4">
            <div 
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}
            />
          </div>
          <h4 className="text-primary mb-3">Loading Dashboard Data</h4>
          <p className="text-muted">Fetching real-time fleet information...</p>
          <div className="mt-3">
            <div 
              className="progress mx-auto"
              style={{ width: '300px', height: '6px' }}
            >
              <div 
                className="progress-bar"
                style={{
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  animation: 'progress 2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>
      ) : summaryData.trackerStatus.length === 0 ? (
        <div 
          className="text-center py-5"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div 
            className="mb-4"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 10px 25px rgba(255, 107, 107, 0.3)'
            }}
          >
            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h4 className="text-danger mb-3">No Data Available</h4>
          <p className="text-muted">Unable to fetch data from the database. Please check the database connection.</p>
          <button 
            className="btn btn-primary mt-3"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              padding: '10px 30px',
              borderRadius: '25px'
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row mb-4 g-3">
            <div className="col-md-3">
              <div 
                className="card border-0 shadow-lg h-100"
                style={{
                  /*background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',*/
                  background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                <div className="card-body text-white p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="card-title mb-0 fw-light" style={{ fontSize: '14px', opacity: 0.9 }}>Total Vehicles</h5>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>
                    {summaryData.vehicleStatusByUnit.reduce((sum, unit) => sum + unit.total, 0)}
                  </h2>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-pill px-2 py-1 me-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '11px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      All Units
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div 
                className="card border-0 shadow-lg h-100"
                style={{
                  /*background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',*/
                  background: 'linear-gradient(135deg, #022c22, #16a34a)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(86, 171, 47, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                <div className="card-body text-white p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="card-title mb-0 fw-light" style={{ fontSize: '14px', opacity: 0.9 }}>Active Trackers</h5>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>
                    {summaryData.trackerStatus.find(t => t.name === 'Active')?.value || 0}
                  </h2>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-pill px-2 py-1 me-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '11px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {((summaryData.trackerStatus.find(t => t.name === 'Active')?.value || 0) / summaryData.vehicleStatusByUnit.reduce((sum, unit) => sum + unit.total, 0) * 100).toFixed(1)}% of fleet
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div 
                className="card border-0 shadow-lg h-100"
                style={{
                  /*background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',*/
                  background: 'linear-gradient(135deg, #1f0a0a, #dc2626)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 107, 107, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                <div className="card-body text-white p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="card-title mb-0 fw-light" style={{ fontSize: '14px', opacity: 0.9 }}>Total Violations</h5>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>
                    {summaryData.overspeedByUnit.reduce((sum, unit) => sum + unit.violations, 0)}
                  </h2>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-pill px-2 py-1 me-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '11px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      This month
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div 
                className="card border-0 shadow-lg h-100"
                style={{
                  /*background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',*/
                  background: 'linear-gradient(135deg, #1e1b4b, #9333ea)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 87, 108, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
              >
                <div className="card-body text-white p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.69)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="card-title mb-0 fw-light" style={{ fontSize: '14px', opacity: 0.9 }}>Faulty Trackers</h5>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>
                    {summaryData.trackerStatus.find(t => t.name === 'Faulty')?.value || 0}
                  </h2>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-pill px-2 py-1 me-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '11px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      Need attention
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Charts Row 1 */}
      <div className="row mb-4 g-4">
        {/* Tracker Status Pie Chart */}
        <div className="col-md-4">
          <div 
            className="card border-0 shadow-lg h-100"
            style={{
              transition: 'all 0.3s ease',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div 
              className="card-header border-0 pt-4 pb-3"
              style={{ background: 'transparent' }}
            >
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
                  </svg>
                </div>
                <div>
                  <h5 className="card-title mb-0 fw-bold" style={{ color: '#2d3748' }}>Tracker Status</h5>
                  <small className="text-muted">Real-time fleet overview</small>
                </div>
              </div>
            </div>
            <div className="card-body pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summaryData.trackerStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    /*label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}*/
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelStyle={{ fill: "#cbd5f1" }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {summaryData.trackerStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                {summaryData.trackerStatus.map((item, index) => (
                  <div 
                    key={index} 
                    className="d-flex align-items-center justify-content-between mb-3 p-2 rounded"
                    style={{
                      background: 'rgba(248, 250, 252, 0.8)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(248, 250, 252, 1)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          backgroundColor: item.color, 
                          marginRight: '12px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <span className="fw-medium" style={{ color: '#4a5568' }}>{item.name}</span>
                    </div>
                    <span 
                      className="fw-bold"
                      style={{ 
                        color: item.color,
                        fontSize: '1.1rem'
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overspeed Summary by Unit */}
        <div className="col-md-8">
          <div 
            className="card border-0 shadow-lg h-100"
            style={{
              transition: 'all 0.3s ease',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div 
              className="card-header border-0 pt-4 pb-3"
              style={{ background: 'transparent' }}
            >
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                  }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <h5 className="card-title mb-0 fw-bold" style={{ color: '#2d3748' }}>Overspeed Violations by Unit</h5>
                  <small className="text-muted">Speed violation analytics</small>
                </div>
              </div>
            </div>
            <div className="card-body pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summaryData.overspeedByUnit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="unit" 
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="violations" 
                    fill="url(#violationsGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                     <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Status by Unit Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div 
            className="card border-0 shadow-lg"
            style={{
              transition: 'all 0.3s ease',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div 
              className="card-header border-0 pt-4 pb-3"
              style={{ background: 'transparent' }}
            >
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #56ab2f, #a8e063)',
                    boxShadow: '0 4px 12px rgba(86, 171, 47, 0.3)'
                  }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <div>
                  <h5 className="card-title mb-0 fw-bold" style={{ color: '#2d3748' }}>Vehicle Status by Unit</h5>
                  <small className="text-muted">Unit-wise fleet availability overview</small>
                </div>
              </div>
            </div>
            <div className="card-body pb-4">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={summaryData.vehicleStatusByUnit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="unit" 
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="active" stackId="a" fill="#2563eb" name="Active" />
                  <Bar dataKey="faulty" stackId="a" fill="#1e293b" name="Faulty" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Enhanced Unit-wise Summary Table */}
              <div className="mt-4">
                <h6 className="fw-bold mb-3" style={{ color: '#2d3748' }}>Unit-wise Summary</h6>
                <div className="table-responsive">
                  <table 
                    className="table table-sm"
                    style={{
                      background: 'rgba(248, 250, 252, 0.8)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <thead>
                      <tr style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                        <th className="border-0 px-3 py-3 text-center" style={{ color: '#4a5568', fontWeight: '600' }}>Unit</th>
                        <th className="border-0 px-3 py-3 text-center" style={{ color: '#4a5568', fontWeight: '600' }}>Total Vehicles</th>
                        <th className="border-0 px-3 py-3 text-center" style={{ color: '#4a5568', fontWeight: '600' }}>Active</th>
                        <th className="border-0 px-3 py-3 text-center" style={{ color: '#4a5568', fontWeight: '600' }}>Faulty</th>
                        <th className="border-0 px-3 py-3 text-center" style={{ color: '#4a5568', fontWeight: '600' }}>Availability %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.vehicleStatusByUnit.map((unit, index) => (
                        <tr 
                          key={index}
                          style={{
                            transition: 'all 0.2s ease',
                            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                            e.currentTarget.style.transform = 'translateX(3px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <td className="px-3 py-3 fw-medium text-center" style={{ color: '#2d3748' }}>{unit.unit}</td>
                          <td className="px-3 py-3 fw-semibold text-center" style={{ color: '#4a5568' }}>{unit.total}</td>
                          <td className="px-3 py-3 text-center">
                            <span 
                              className="fw-semibold"
                              style={{ 
                                color: '#22c55e',
                                background: 'rgba(34, 197, 94, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                display: 'inline-block'
                              }}
                            >
                              {unit.active}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span 
                              className="fw-semibold"
                              style={{ 
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                display: 'inline-block'
                              }}
                            >
                              {unit.faulty}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span 
                              className="badge fw-semibold px-3 py-2"
                              style={{
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                background: (unit.active / unit.total * 100) >= 75 ? 'rgba(34, 197, 94, 0.1)' :
                                          (unit.active / unit.total * 100) >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: (unit.active / unit.total * 100) >= 75 ? '#22c55e' :
                                       (unit.active / unit.total * 100) >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              {((unit.active / unit.total) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
        </div>
    </div>
  </div>
  );
}
