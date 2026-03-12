import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Map, Users, Clock, Wifi, Plus, Trash2, Edit2, Moon, User } from 'lucide-react';

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
  const [vehicles, setVehicles] = useState([
    { id: 1, baNumber: '34-A-1234', type: 'Jeep', unit: '', status: 'Active' },
    { id: 2, baNumber: '34-A-5678', type: '5 Ton', unit: '', status: 'Active' },
    { id: 3, baNumber: '34-A-9012', type: 'Jeep', unit: '', status: 'Maintenance' },
  ]);

  const [overspeedLimits, setOverspeedLimits] = useState({
    first: 60,
    second: 80,
  });

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

  const [smsSettings, setSmsSettings] = useState({
    enabled: true,
    emergencyContact: '',
    unitCommanders: true,
    systemAdmin: true,
    violationTypes: {
      panic: true,
      overspeed: true,
      unsanctioned: true
    }
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
        const response = await fetch('http://localhost:5000/api/units_full');
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
          setVehicles(prev => prev.map(vehicle => ({
            ...vehicle,
            unit: transformedUnits[0].name
          })));
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

    fetchUnits();
  }, []);

  const handleAddUnit = () => {
    if (newUnit.name && newUnit.commander) {
      setUnits([...units, { ...newUnit, id: units.length + 1 }]);
      setNewUnit({ name: '', commander: '', contact: '' });
    }
  };

  const handleDeleteUnit = (id) => {
    setUnits(units.filter(unit => unit.id !== id));
  };

  const handleAddVehicle = () => {
    if (newVehicle.baNumber && newVehicle.unit) {
      setVehicles([...vehicles, { ...newVehicle, id: vehicles.length + 1 }]);
      setNewVehicle({ baNumber: '', type: 'Jeep', unit: '', status: 'Active' });
    }
  };

  const handleDeleteVehicle = (id) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  // Profile Management Functions
  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profiles');
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleAddProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      
      if (response.ok) {
        setNewProfile({ 
          username: '', 
          password: '', 
          full_name: '', 
          email: '', 
          role: 'user', 
          unit_id: '', 
          contact_number: '' 
        });
        fetchProfiles();
        alert('Profile created successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error adding profile:', error);
      alert('Error creating profile');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfile)
      });
      
      if (response.ok) {
        setEditingProfile(null);
        fetchProfiles();
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleDeleteProfile = async (id) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchProfiles();
        alert('Profile deleted successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSaveOverspeedSettings = () => {
    localStorage.setItem('overspeedLimits', JSON.stringify(overspeedLimits));
    alert('Overspeed settings saved successfully! The new limits are now active in the dashboard.');
  };

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

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Settings</h3>
          <p className="text-muted small mb-0">Configure system preferences and manage your VMS settings</p>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-3">
          <div className="rounded-2 border-0 shadow-sm" style={{
            background: 'white'
          }}>
            {settingsTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-100 d-flex align-items-center gap-3 px-4 py-3 border-0 transition-all ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                style={{
                  background: activeTab === tab.id 
                    ? '#f8f9fa'
                    : 'transparent',
                  color: activeTab === tab.id ? '#212529' : '#6c757d',
                  borderLeft: activeTab === tab.id ? '3px solid #0d6efd' : '3px solid transparent',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: activeTab === tab.id 
                    ? '#0d6efd'
                    : '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {React.cloneElement(tab.icon, { 
                    size: 16, 
                    style: { color: activeTab === tab.id ? 'white' : '#6c757d' } 
                  })}
                </div>
                <span style={{ 
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '14px',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        
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
                <div className="alert alert-info mb-4" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  borderRadius: '8px'
                }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#fbbf24'
                    }} />
                    <span><strong>First Limit:</strong> Vehicle BA number and speed turn yellow</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#ef4444'
                    }} />
                    <span><strong>Second Limit:</strong> Vehicle BA number and speed turn red</span>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">First Overspeed Limit (km/h)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={overspeedLimits.first}
                        onChange={(e) => setOverspeedLimits({...overspeedLimits, first: parseInt(e.target.value)})}
                        style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                      />
                      <small className="text-muted">Vehicles exceeding this speed will show yellow BA number and speed</small>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label">Second Overspeed Limit (km/h)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={overspeedLimits.second}
                        onChange={(e) => setOverspeedLimits({...overspeedLimits, second: parseInt(e.target.value)})}
                        style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      />
                      <small className="text-muted">Vehicles exceeding this speed will show red BA number and speed with warning</small>
                    </div>
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
                <h5 className="mb-4">Night Move Time Settings</h5>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Night Start Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={nightMoveSettings.startTime}
                        onChange={(e) => setNightMoveSettings({...nightMoveSettings, startTime: e.target.value})}
                      />
                      <small className="text-muted">Time when night move restrictions begin</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Night End Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={nightMoveSettings.endTime}
                        onChange={(e) => setNightMoveSettings({...nightMoveSettings, endTime: e.target.value})}
                      />
                      <small className="text-muted">Time when night move restrictions end</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Grace Period (minutes)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={nightMoveSettings.gracePeriod}
                        onChange={(e) => setNightMoveSettings({...nightMoveSettings, gracePeriod: parseInt(e.target.value)})}
                      />
                      <small className="text-muted">Allowed delay before violation is recorded</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Current Time Period</label>
                      <div className="alert alert-info">
                        <strong>Night Period:</strong> {nightMoveSettings.startTime} - {nightMoveSettings.endTime}<br/>
                        <strong>Duration:</strong> {calculateNightDuration(nightMoveSettings.startTime, nightMoveSettings.endTime)} hours
                      </div>
                    </div>
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
                    <label className="form-check-label">Enable Night Move Monitoring</label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={nightMoveSettings.alertOnViolation}
                      onChange={(e) => setNightMoveSettings({...nightMoveSettings, alertOnViolation: e.target.checked})}
                    />
                    <label className="form-check-label">Alert on Night Move Violations</label>
                  </div>
                </div>

                {/* Weekend Rules */}
                <div className="card mt-4">
                  <div className="card-header">
                    <h6 className="mb-0">Weekend Rules</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={nightMoveSettings.weekendRules.enabled}
                          onChange={(e) => setNightMoveSettings({
                            ...nightMoveSettings, 
                            weekendRules: {...nightMoveSettings.weekendRules, enabled: e.target.checked}
                          })}
                        />
                        <label className="form-check-label">Enable Different Weekend Times</label>
                      </div>
                    </div>
                    
                    {nightMoveSettings.weekendRules.enabled && (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Weekend Start Time</label>
                            <input 
                              type="time" 
                              className="form-control" 
                              value={nightMoveSettings.weekendRules.startTime}
                              onChange={(e) => setNightMoveSettings({
                                ...nightMoveSettings, 
                                weekendRules: {...nightMoveSettings.weekendRules, startTime: e.target.value}
                              })}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Weekend End Time</label>
                            <input 
                              type="time" 
                              className="form-control" 
                              value={nightMoveSettings.weekendRules.endTime}
                              onChange={(e) => setNightMoveSettings({
                                ...nightMoveSettings, 
                                weekendRules: {...nightMoveSettings.weekendRules, endTime: e.target.value}
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Allowed Units */}
                <div className="card mt-4">
                  <div className="card-header">
                    <h6 className="mb-0">Units Allowed for Night Moves</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {units.map(unit => (
                        <div key={unit.id} className="col-md-4 mb-2">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`unit-${unit.id}`}
                              checked={nightMoveSettings.allowedUnits.includes(unit.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNightMoveSettings({
                                    ...nightMoveSettings, 
                                    allowedUnits: [...nightMoveSettings.allowedUnits, unit.name]
                                  });
                                } else {
                                  setNightMoveSettings({
                                    ...nightMoveSettings, 
                                    allowedUnits: nightMoveSettings.allowedUnits.filter(u => u !== unit.name)
                                  });
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`unit-${unit.id}`}>
                              {unit.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <small className="text-muted">Select units that are permitted to move during night hours</small>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'units' && (
              <div>
                <h5 className="mb-4">Unit Management</h5>
                
                {/* Add New Unit Form */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Unit</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Unit Name"
                          value={newUnit.name}
                          onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Commander"
                          value={newUnit.commander}
                          onChange={(e) => setNewUnit({...newUnit, commander: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Contact"
                          value={newUnit.contact}
                          onChange={(e) => setNewUnit({...newUnit, contact: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <button onClick={handleAddUnit} className="btn btn-primary">
                          <Plus size={16} className="me-1" /> Add Unit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Units List */}
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
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <Edit2 size={14} />
                            </button>
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
            )}

            {activeTab === 'vehicles' && (
              <div>
                <h5 className="mb-4">Vehicle Management</h5>
                
                {/* Add New Vehicle Form */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Vehicle</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="BA Number"
                          value={newVehicle.baNumber}
                          onChange={(e) => setNewVehicle({...newVehicle, baNumber: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2">
                        <select 
                          className="form-select"
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                        >
                          <option value="Jeep">Jeep</option>
                          <option value="5 Ton">5 Ton</option>
                          <option value="Motorcycle">Motorcycle</option>
                        </select>
                      </div>
                      <div className="col-md-3">
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
                      <div className="col-md-2">
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
                      <div className="col-md-2">
                        <button onClick={handleAddVehicle} className="btn btn-primary">
                          <Plus size={16} className="me-1" /> Add Vehicle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicles List */}
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
                            <button className="btn btn-sm btn-outline-primary me-2">
                              <Edit2 size={14} />
                            </button>
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
                      <div className="col-md-2">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Username"
                          value={newProfile.username}
                          onChange={(e) => setNewProfile({...newProfile, username: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Password"
                          value={newProfile.password}
                          onChange={(e) => setNewProfile({...newProfile, password: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Full Name"
                          value={newProfile.full_name}
                          onChange={(e) => setNewProfile({...newProfile, full_name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="Email"
                          value={newProfile.email}
                          onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
                        />
                      </div>
                      <div className="col-md-1">
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
                      <div className="col-md-2">
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
                      <div className="col-md-1">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Contact"
                          value={newProfile.contact_number}
                          onChange={(e) => setNewProfile({...newProfile, contact_number: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-12">
                        <button onClick={handleAddProfile} className="btn btn-primary">
                          <Plus size={16} className="me-1" /> Add Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profiles List */}
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

                {/* Edit Profile Modal */}
                {editingProfile && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Edit Profile</h5>
                          <button 
                            type="button" 
                            className="btn-close"
                            onClick={() => setEditingProfile(null)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={editingProfile.username}
                              onChange={(e) => setEditingProfile({...editingProfile, username: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input 
                              type="password" 
                              className="form-control" 
                              placeholder="Leave blank to keep current password"
                              value={editingProfile.password || ''}
                              onChange={(e) => setEditingProfile({...editingProfile, password: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={editingProfile.full_name}
                              onChange={(e) => setEditingProfile({...editingProfile, full_name: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              className="form-control" 
                              value={editingProfile.email}
                              onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Role</label>
                            <select 
                              className="form-select"
                              value={editingProfile.role}
                              onChange={(e) => setEditingProfile({...editingProfile, role: e.target.value})}
                            >
                              <option value="user">User</option>
                              <option value="operator">Operator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Unit</label>
                            <select 
                              className="form-select"
                              value={editingProfile.unit_id || ''}
                              onChange={(e) => setEditingProfile({...editingProfile, unit_id: e.target.value})}
                            >
                              <option value="">Select Unit</option>
                              {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Contact Number</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={editingProfile.contact_number}
                              onChange={(e) => setEditingProfile({...editingProfile, contact_number: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={editingProfile.is_active}
                                onChange={(e) => setEditingProfile({...editingProfile, is_active: e.target.checked})}
                              />
                              <label className="form-check-label">Active</label>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setEditingProfile(null)}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={handleUpdateProfile}
                          >
                            Update Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h5 className="mb-4">SMS Alert Settings</h5>
                    
                    {/* SMS Enable/Disable */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">SMS Configuration</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.enabled}
                              onChange={(e) => setSmsSettings({...smsSettings, enabled: e.target.checked})}
                            />
                            <label className="form-check-label">Enable SMS Alerts</label>
                          </div>
                          <small className="text-muted">Send SMS notifications for violations and emergencies</small>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">Emergency Contact Number</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="+92XXXXXXXXXX"
                            value={smsSettings.emergencyContact}
                            onChange={(e) => setSmsSettings({...smsSettings, emergencyContact: e.target.value})}
                          />
                          <small className="text-muted">Primary contact for emergency alerts</small>
                        </div>
                      </div>
                    </div>

                    {/* Alert Recipients */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Alert Recipients</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.unitCommanders}
                              onChange={(e) => setSmsSettings({...smsSettings, unitCommanders: e.target.checked})}
                            />
                            <label className="form-check-label">Unit Commanders</label>
                          </div>
                          <small className="text-muted">Send alerts to unit commander contact numbers</small>
                        </div>
                        
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.systemAdmin}
                              onChange={(e) => setSmsSettings({...smsSettings, systemAdmin: e.target.checked})}
                            />
                            <label className="form-check-label">System Administrators</label>
                          </div>
                          <small className="text-muted">Send alerts to system admin contacts</small>
                        </div>
                      </div>
                    </div>

                    {/* Violation Types */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Violation Types</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.violationTypes.panic}
                              onChange={(e) => setSmsSettings({
                                ...smsSettings, 
                                violationTypes: {...smsSettings.violationTypes, panic: e.target.checked}
                              })}
                            />
                            <label className="form-check-label">Panic Button Alerts</label>
                          </div>
                          <small className="text-muted">Send SMS for panic button emergencies</small>
                        </div>
                        
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.violationTypes.overspeed}
                              onChange={(e) => setSmsSettings({
                                ...smsSettings, 
                                violationTypes: {...smsSettings.violationTypes, overspeed: e.target.checked}
                              })}
                            />
                            <label className="form-check-label">Overspeed Violations</label>
                          </div>
                          <small className="text-muted">Send SMS for overspeed violations</small>
                        </div>
                        
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={smsSettings.violationTypes.unsanctioned}
                              onChange={(e) => setSmsSettings({
                                ...smsSettings, 
                                violationTypes: {...smsSettings.violationTypes, unsanctioned: e.target.checked}
                              })}
                            />
                            <label className="form-check-label">Unauthorized Movement</label>
                          </div>
                          <small className="text-muted">Send SMS for unsanctioned vehicle movement</small>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={() => {
                        localStorage.setItem('smsSettings', JSON.stringify(smsSettings));
                        alert('SMS settings saved successfully!');
                      }}>
                        Save SMS Settings
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => {
                        // Test SMS functionality
                        if (smsSettings.enabled && smsSettings.emergencyContact) {
                          alert(`Test SMS would be sent to: ${smsSettings.emergencyContact}`);
                        } else {
                          alert('Please enable SMS and set emergency contact number first.');
                        }
                      }}>
                        Send Test SMS
                      </button>
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
