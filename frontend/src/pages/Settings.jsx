import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Map, Users, Clock, Wifi, Plus, Trash2, Edit2, Moon, User } from 'lucide-react';
import { API_URL } from '../config';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={16} /> },
    { id: 'overspeed', label: 'Overspeed Control', icon: <Clock size={16} /> },
    { id: 'nightmove', label: 'Night Move', icon: <Moon size={16} /> },
    { id: 'units', label: 'Unit Management', icon: <Users size={16} /> },
    { id: 'vehicles', label: 'Vehicle Management', icon: <Map size={16} /> },
    { id: 'profiles', label: 'Profile Management', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  // Fetch units from database
  const [units, setUnits] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [overspeedLimits, setOverspeedLimits] = useState({
    first: 60,
    second: 80,
  });

  const [newUnit, setNewUnit] = useState({ name: '', commander: '', contact: '' });
  const [newVehicle, setNewVehicle] = useState({ baNumber: '', type: 'Jeep', unit: '', status: 'Active' });

  // Profile Management State
  const [profiles, setProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState({ 
    username: '', 
    password: '', 
    full_name: '', 
    email: '', 
    role: 'user', 
    unit_id: '', 
    contact_number: '' 
  });
  const [editingProfile, setEditingProfile] = useState(null);

  // Fetch units from database on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch(`${API_URL}/api/units_full`);
        const unitsData = await response.json();
        
        // Transform database units to match component structure
        const transformedUnits = unitsData.map(unit => ({
          id: unit.unit_id,
          name: unit.unit_name,
          commander: `Commander ${unit.unit_name}`, // Mock commander name
          contact: `0300-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` // Mock contact
        }));
        
        setUnits(transformedUnits);
        
        // Update vehicle units to match first available unit
        if (transformedUnits.length > 0) {
          setNewVehicle(prev => ({ ...prev, unit: transformedUnits[0].name }));
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        // Fallback to mock data
        setUnits([
          { id: 1, name: '340', commander: 'Col. ', contact: '0300-1234567' },
          { id: 2, name: '341', commander: 'Col. ', contact: '0300-9876543' },
          { id: 3, name: '342', commander: 'Col. ', contact: '0300-4567890' },
          { id: 4, name: 'Div Arty', commander: '', contact: '0300-3456789' },
          { id: 5, name: 'HQ 34 Div', commander: 'Col. ', contact: '0300-2345678' },
        ]);
      }
    };

    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fleet/status`);
        const vehiclesData = await response.json();
        
        // Transform database vehicles to match component structure
        const transformedVehicles = vehiclesData.map(vehicle => ({
          id: vehicle.vehicle_id || vehicle.id,
          baNumber: vehicle.vehicle_no || vehicle.ba,
          type: vehicle.vehicle_type || 'Jeep',
          unit: vehicle.unit_name || '',
          status: vehicle.vehicle_status === 'ACTIVE' ? 'Active' : 
                  vehicle.vehicle_status === 'FAULTY' ? 'Maintenance' : 'Active'
        }));
        
        setVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        // Fallback to empty array
        setVehicles([]);
      }
    };
    
    fetchUnits();
    fetchVehicles();
  }, []);

  // Unit Management Functions
  const handleAddUnit = async () => {
    if (newUnit.name) {
      try {
        const response = await fetch(`${API_URL}/api/units`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unit_name: newUnit.name
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Refresh units list to show the new unit
          const fetchUnits = async () => {
            try {
              const response = await fetch(`${API_URL}/api/units_full`);
              const unitsData = await response.json();
              
              const transformedUnits = unitsData.map(unit => ({
                id: unit.unit_id,
                name: unit.unit_name,
                commander: `Commander ${unit.unit_name}`,
                contact: `0300-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`
              }));
              
              setUnits(transformedUnits);
            } catch (error) {
              console.error('Error refreshing units:', error);
            }
          };
          
          await fetchUnits();
          setNewUnit({ name: '', commander: '', contact: '' });
          console.log('Unit added successfully:', result);
        } else {
          const error = await response.json();
          console.error('Error adding unit:', error.error);
          alert('Error adding unit: ' + error.error);
        }
      } catch (error) {
        console.error('Error adding unit:', error);
        alert('Error adding unit. Please try again.');
      }
    } else {
      alert('Please enter a unit name');
    }
  };

  const handleDeleteUnit = (id) => {
    setUnits(units.filter(unit => unit.id !== id));
  };

  // Vehicle Management Functions
  const handleAddVehicle = async () => {
    if (newVehicle.baNumber && newVehicle.type && newVehicle.unit) {
      try {
        // Find the unit ID for the selected unit name
        const selectedUnit = units.find(unit => unit.name === newVehicle.unit);
        if (!selectedUnit) {
          alert('Please select a valid unit');
          return;
        }

        const response = await fetch(`${API_URL}/api/vehicles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicle_no: newVehicle.baNumber,
            vehicle_type: newVehicle.type,
            unit_id: selectedUnit.id,
            status: newVehicle.status
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Refresh vehicles list to show the new vehicle
          const fetchVehicles = async () => {
            try {
              const response = await fetch(`${API_URL}/api/fleet/status`);
              const vehiclesData = await response.json();
              
              const transformedVehicles = vehiclesData.map(vehicle => ({
                id: vehicle.vehicle_id || vehicle.id,
                baNumber: vehicle.vehicle_no || vehicle.ba,
                type: vehicle.vehicle_type || 'Jeep',
                unit: vehicle.unit_name || '',
                status: vehicle.vehicle_status === 'ACTIVE' ? 'Active' : 
                        vehicle.vehicle_status === 'FAULTY' ? 'Maintenance' : 'Active'
              }));
              
              setVehicles(transformedVehicles);
            } catch (error) {
              console.error('Error refreshing vehicles:', error);
            }
          };
          
          await fetchVehicles();
          setNewVehicle({ baNumber: '', type: 'Jeep', unit: units.length > 0 ? units[0].name : '', status: 'Active' });
          console.log('Vehicle added successfully:', result);
        } else {
          const error = await response.json();
          console.error('Error adding vehicle:', error.error);
          alert('Error adding vehicle: ' + error.error);
        }
      } catch (error) {
        console.error('Error adding vehicle:', error);
        alert('Error adding vehicle. Please try again.');
      }
    }
  };

  const handleDeleteVehicle = (id) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  // Profile Management Functions
  const handleAddProfile = async () => {
    if (newProfile.username && newProfile.password && newProfile.role) {
      try {
        const response = await fetch(`${API_URL}/api/profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfile)
        });
        
        if (response.ok) {
          const createdProfile = await response.json();
          setProfiles([...profiles, createdProfile]);
          setNewProfile({ 
            username: '', 
            password: '', 
            full_name: '', 
            email: '', 
            role: 'user', 
            unit_id: '', 
            contact_number: '' 
          });
        } else {
          // Fallback to local state if API fails
          const profile = {
            id: profiles.length + 1,
            ...newProfile,
            is_active: true,
            created_at: new Date().toISOString()
          };
          setProfiles([...profiles, profile]);
          setNewProfile({ 
            username: '', 
            password: '', 
            full_name: '', 
            email: '', 
            role: 'user', 
            unit_id: '', 
            contact_number: '' 
          });
        }
      } catch (error) {
        console.error('Error adding profile:', error);
        // Fallback to local state
        const profile = {
          id: profiles.length + 1,
          ...newProfile,
          is_active: true,
          created_at: new Date().toISOString()
        };
        setProfiles([...profiles, profile]);
        setNewProfile({ 
          username: '', 
          password: '', 
          full_name: '', 
          email: '', 
          role: 'user', 
          unit_id: '', 
          contact_number: '' 
        });
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (editingProfile) {
      try {
        const response = await fetch(`${API_URL}/api/profiles/${editingProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProfile)
        });
        
        if (response.ok) {
          const updatedProfile = await response.json();
          setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
        } else {
          // Fallback to local state if API fails
          setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        // Fallback to local state
        setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
      }
      setEditingProfile(null);
    }
  };

  const handleDeleteProfile = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setProfiles(profiles.filter(p => p.id !== id));
      } else {
        // Fallback to local state if API fails
        setProfiles(profiles.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      // Fallback to local state
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  // Load overspeed limits from localStorage on component mount
  useEffect(() => {
    const savedLimits = localStorage.getItem('overspeedLimits');
    if (savedLimits) {
      try {
        setOverspeedLimits(JSON.parse(savedLimits));
      } catch (error) {
        console.error('Error loading overspeed limits:', error);
      }
    }
  }, []);

  // Save overspeed limits to localStorage when they change
  useEffect(() => {
    localStorage.setItem('overspeedLimits', JSON.stringify(overspeedLimits));
  }, [overspeedLimits]);

  const [nightMoveSettings, setNightMoveSettings] = useState({
    startTime: '20:00', // 8 PM
    endTime: '06:00',   // 6 AM
    enabled: true,
    alertOnViolation: true,
    gracePeriod: 15, // minutes
    allowedUnits: [], // Which units are allowed night moves
    weekendRules: {
      enabled: false,
      startTime: '22:00',
      endTime: '05:00'
    }
  });

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profiles`);
        if (response.ok) {
          const profilesData = await response.json();
          setProfiles(profilesData);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    
    fetchProfiles();
  }, []);

  // Helper function to calculate night duration
  const calculateNightDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let duration;
    if (end > start) {
      duration = (end - start) / (1000 * 60 * 60);
    } else {
      // Crosses midnight
      const nextDay = new Date(`2000-01-02T${endTime}`);
      duration = (nextDay - start) / (1000 * 60 * 60);
    }
    
    return duration.toFixed(1);
  };

  const handleSaveOverspeedSettings = async () => {
    try {
      // Save to localStorage for frontend
      localStorage.setItem('overspeedLimits', JSON.stringify(overspeedLimits));
      
      // Send to backend for server-side overspeed detection
      const response = await fetch(`${API_URL}/api/settings/overspeed-limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(overspeedLimits)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Backend updated:', result);
        alert('Overspeed settings saved successfully! The new limits are now active in the dashboard.');
      } else {
        const error = await response.json();
        console.error('Backend update failed:', error);
        alert('Overspeed settings saved locally, but backend update failed: ' + error.error);
      }
    } catch (error) {
      console.error('Error saving overspeed settings:', error);
      alert('Error saving overspeed settings: ' + error.message);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Settings</h3>
          <p className="text-muted small mb-0">Configure system preferences and manage your VMS settings</p>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {settingsTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-100 text-start px-4 py-3 border-0 d-flex align-items-center gap-3 transition-all position-relative ${
                    activeTab === tab.id 
                      ? 'text-primary' 
                      : 'text-muted'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(13, 110, 253, 0.08)' : 'transparent',
                    color: activeTab === tab.id ? '#0d6efd' : '#6c757d',
                    borderRadius: activeTab === tab.id ? '8px' : '0px',
                    margin: activeTab === tab.id ? '4px 8px' : '0px',
                    borderLeft: activeTab === tab.id ? '4px solid #0d6efd' : '4px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: activeTab === tab.id ? 'translateX(4px)' : 'translateX(0)',
                    fontWeight: activeTab === tab.id ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 117, 125, 0.08)';
                      e.currentTarget.style.color = '#495057';
                      e.currentTarget.style.transform = 'translateX(2px)';
                      e.currentTarget.style.borderLeft = '4px solid rgba(108, 117, 125, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6c757d';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderLeft = '4px solid transparent';
                    }
                  }}
                >
                  <span style={{ 
                    color: activeTab === tab.id ? '#0d6efd' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    {tab.icon}
                  </span>
                  <span className="fw-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="rounded-2 p-5 border-0 shadow-sm bg-white" style={{
            minHeight: '600px'
          }}>
            {activeTab === 'general' && (
              <div>
                <h5 className="mb-4">General Settings</h5>
                <div className="mb-3">
                  <label className="form-label">System Name</label>
                  <input type="text" className="form-control" defaultValue="Vehicle Management System" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Division Name</label>
                  <input type="text" className="form-control" defaultValue="34 Division" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Time Zone</label>
                  <select className="form-select">
                    <option>UTC+05:00 Pakistan Standard Time</option>
                    <option>UTC+00:00 Greenwich Mean Time</option>
                    <option>UTC-05:00 Eastern Standard Time</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select className="form-select">
                    <option>English</option>
                    <option>Urdu</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'overspeed' && (
              <div>
                <h5 className="mb-4">Overspeed Control Settings</h5>
                
                {/* Speed Limit Legend */}
                <div className="alert alert-info mb-4" role="alert">
                  <div className="d-flex align-items-center mb-2">
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#fbbf24', 
                      borderRadius: '4px',
                      marginRight: '10px'
                    }} />
                    <span><strong>First Limit:</strong> Vehicle BA number and speed turn yellow</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#ef4444', 
                      borderRadius: '4px',
                      marginRight: '10px'
                    }} />
                    <span><strong>Second Limit:</strong> Vehicle BA number and speed turn red</span>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label">First Overspeed Limit (km/h)</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        className="form-control" 
                        value={overspeedLimits.first}
                        onChange={(e) => setOverspeedLimits({...overspeedLimits, first: parseInt(e.target.value)})}
                        style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                      />
                      <span className="input-group-text" style={{ backgroundColor: '#fef3c7', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#fbbf24', borderRadius: '2px' }} />
                      </span>
                    </div>
                    <small className="text-muted">Vehicles exceeding this speed will show yellow BA number and speed</small>
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <label className="form-label">Second Overspeed Limit (km/h)</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        className="form-control" 
                        value={overspeedLimits.second}
                        onChange={(e) => setOverspeedLimits({...overspeedLimits, second: parseInt(e.target.value)})}
                        style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      />
                      <span className="input-group-text" style={{ backgroundColor: '#fee2e2', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                      </span>
                    </div>
                    <small className="text-muted">Vehicles exceeding this speed will show red BA number and speed with warning</small>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Enable Overspeed Alerts</label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Auto-report Violations</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nightmove' && (
              <div>
                <h5 className="mb-4">Night Movement Settings</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={nightMoveSettings.startTime}
                      onChange={(e) => setNightMoveSettings({...nightMoveSettings, startTime: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={nightMoveSettings.endTime}
                      onChange={(e) => setNightMoveSettings({...nightMoveSettings, endTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={nightMoveSettings.enabled}
                      onChange={(e) => setNightMoveSettings({...nightMoveSettings, enabled: e.target.checked})}
                    />
                    <label className="form-check-label">Enable Night Movement Monitoring</label>
                  </div>
                </div>
                <div className="alert alert-info">
                  Night duration: {calculateNightDuration(nightMoveSettings.startTime, nightMoveSettings.endTime)} hours
                </div>
              </div>
            )}

            {activeTab === 'units' && (
              <div>
                <h5 className="mb-4">Unit Management</h5>
                
                {/* Add New Unit */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Unit</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Unit Name"
                          value={newUnit.name}
                          onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Commander"
                          value={newUnit.commander}
                          onChange={(e) => setNewUnit({...newUnit, commander: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Contact"
                          value={newUnit.contact}
                          onChange={(e) => setNewUnit({...newUnit, contact: e.target.value})}
                        />
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddUnit}>
                      <Plus size={16} className="me-2" />
                      Add Unit
                    </button>
                  </div>
                </div>

                {/* Units List */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Units List</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Unit Name</th>
                            <th>Commander</th>
                            <th>Contact</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {units.map(unit => (
                            <tr key={unit.id}>
                              <td>{unit.name}</td>
                              <td>{unit.commander}</td>
                              <td>{unit.contact}</td>
                              <td>
                                <button 
                                  onClick={() => handleDeleteUnit(unit.id)}
                                  className="btn btn-sm btn-outline-danger"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div>
                <h5 className="mb-4">Vehicle Management</h5>
                
                {/* Add New Vehicle */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Vehicle</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="BA Number"
                          value={newVehicle.baNumber}
                          onChange={(e) => setNewVehicle({...newVehicle, baNumber: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <select 
                          className="form-select"
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                        >
                          <option value="Jeep">Jeep</option>
                          <option value="5 Ton">5 Ton</option>
                          <option value="3 Ton">3 Ton</option>
                          <option value="Motorcycle">Motorcycle</option>
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <select 
                          className="form-select"
                          value={newVehicle.unit}
                          onChange={(e) => setNewVehicle({...newVehicle, unit: e.target.value})}
                        >
                          <option value="">Select Unit</option>
                          {units.map(unit => (
                            <option key={unit.id} value={unit.name}>{unit.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <select 
                          className="form-select"
                          value={newVehicle.status}
                          onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                        >
                          <option value="Active">Active</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddVehicle}>
                      <Plus size={16} className="me-2" />
                      Add Vehicle
                    </button>
                  </div>
                </div>

                {/* Vehicles List */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Vehicles List</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>BA Number</th>
                            <th>Type</th>
                            <th>Unit</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.map(vehicle => (
                            <tr key={vehicle.id}>
                              <td>{vehicle.baNumber}</td>
                              <td>{vehicle.type}</td>
                              <td>{vehicle.unit}</td>
                              <td>
                                <span className={`badge ${
                                  vehicle.status === 'Active' ? 'bg-success' : 
                                  vehicle.status === 'Maintenance' ? 'bg-warning' : 'bg-secondary'
                                }`}>
                                  {vehicle.status}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="btn btn-sm btn-outline-danger"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profiles' && (
              <div>
                <h5 className="mb-4">Profile Management</h5>
                
                {/* Add New Profile Form */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Profile</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Username"
                          value={newProfile.username}
                          onChange={(e) => setNewProfile({...newProfile, username: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Password"
                          value={newProfile.password}
                          onChange={(e) => setNewProfile({...newProfile, password: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Full Name"
                          value={newProfile.full_name}
                          onChange={(e) => setNewProfile({...newProfile, full_name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <select 
                          className="form-select"
                          value={newProfile.role}
                          onChange={(e) => setNewProfile({...newProfile, role: e.target.value})}
                        >
                          <option value="user">User</option>
                          <option value="operator">Operator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="Email"
                          value={newProfile.email}
                          onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <select 
                          className="form-select"
                          value={newProfile.unit_id}
                          onChange={(e) => setNewProfile({...newProfile, unit_id: e.target.value})}
                        >
                          <option value="">Select Unit</option>
                          {units.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Contact Number"
                          value={newProfile.contact_number}
                          onChange={(e) => setNewProfile({...newProfile, contact_number: e.target.value})}
                        />
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddProfile}>
                      <Plus size={16} className="me-2" />
                      Add Profile
                    </button>
                  </div>
                </div>

                {/* Profiles List */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Profiles List</h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Unit</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profiles.map(profile => (
                            <tr key={profile.id}>
                              <td>{profile.username}</td>
                              <td>{profile.full_name || '-'}</td>
                              <td>{profile.email || '-'}</td>
                              <td>
                                <span className={`badge ${
                                  profile.role === 'admin' ? 'bg-danger' : 
                                  profile.role === 'operator' ? 'bg-warning' : 'bg-info'
                                }`}>
                                  {profile.role}
                                </span>
                              </td>
                              <td>{profile.unit_name || '-'}</td>
                              <td>{profile.contact_number || '-'}</td>
                              <td>
                                <span className={`badge ${profile.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                  {profile.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => setEditingProfile(profile)}
                                  className="btn btn-sm btn-outline-primary me-2"
                                  disabled={profile.role === 'admin'}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProfile(profile.id)}
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={profile.role === 'admin'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h5 className="mb-4">Notification Settings</h5>
                <div className="alert alert-info">
                  <strong>Coming Soon:</strong> SMS and email notifications will be available in future updates.
                </div>
                <div className="card">
                  <div className="card-body">
                    <p className="text-muted mb-3">Configure how you receive alerts for vehicle violations and emergencies.</p>
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Enable Email Notifications</label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" disabled />
                        <label className="form-check-label">Enable SMS Notifications</label>
                      </div>
                    </div>
                    <button className="btn btn-primary" disabled>
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h5 className="mb-4">Security Settings</h5>
                <div className="mb-3">
                  <label className="form-label">Session Timeout (minutes)</label>
                  <input type="number" className="form-control" defaultValue="30" />
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Require Two-Factor Authentication</label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <label className="form-check-label">Log Failed Login Attempts</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password Policy</label>
                  <select className="form-select">
                    <option>Strong (8+ characters, mixed case, numbers, symbols)</option>
                    <option>Medium (6+ characters, mixed case, numbers)</option>
                    <option>Basic (6+ characters)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button className="btn btn-primary me-2" onClick={activeTab === 'overspeed' ? handleSaveOverspeedSettings : undefined}>
                Save Changes
              </button>
              <button className="btn btn-secondary">Reset to Default</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
