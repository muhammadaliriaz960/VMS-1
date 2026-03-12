import React, { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { API_URL } from '../config';

export default function SettingsTable() {
  const [settings, setSettings] = useState({
    overspeedLimit: 120,
    nightMoveStart: "19:00",
    nightMoveEnd: "06:00"
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [units, setUnits] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ vehicle_no: '', vehicle_type: '', unit_id: '' });
  const [newUnit, setNewUnit] = useState({ unit_name: '' });

  useEffect(() => {
    fetchSettings();
    fetchVehicles();
    fetchUnits();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real implementation, this would fetch from a settings API
      // For now, using default values
      setSettings({
        overspeedLimit: 120,
        nightMoveStart: "19:00",
        nightMoveEnd: "06:00"
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vehicles`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/units_full`);
      const data = await res.json();
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleSettingsSave = async () => {
    try {
      // In a real implementation, this would save to a settings API
      console.log('Saving settings:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const handleAddVehicle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });
      
      if (res.ok) {
        setNewVehicle({ vehicle_no: '', vehicle_type: '', unit_id: '' });
        fetchVehicles();
        alert('Vehicle added successfully!');
      } else {
        alert('Error adding vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle');
    }
  };

  const handleUpdateVehicle = async (vehicleId) => {
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVehicle)
      });
      
      if (res.ok) {
        setEditingVehicle(null);
        fetchVehicles();
        alert('Vehicle updated successfully!');
      } else {
        alert('Error updating vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchVehicles();
        alert('Vehicle deleted successfully!');
      } else {
        alert('Error deleting vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  const handleAddUnit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit)
      });
      
      if (res.ok) {
        setNewUnit({ unit_name: '' });
        fetchUnits();
        alert('Unit added successfully!');
      } else {
        alert('Error adding unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      alert('Error adding unit');
    }
  };

  const handleUpdateUnit = async (unitId) => {
    try {
      const res = await fetch(`${API_URL}/api/units/${unitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUnit)
      });
      
      if (res.ok) {
        setEditingUnit(null);
        fetchUnits();
        alert('Unit updated successfully!');
      } else {
        alert('Error updating unit');
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Error updating unit');
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/units/${unitId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchUnits();
        alert('Unit deleted successfully!');
      } else {
        alert('Error deleting unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Error deleting unit');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">
            <Settings className="me-2" size={24} />
            System Settings
          </h3>
          <p className="text-muted small">Configure system parameters and manage assets</p>
        </div>
      </div>

      {/* System Settings */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-white border-0">
          <h6 className="mb-0 fw-bold">System Parameters</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Overspeed Limit (km/h)</label>
              <input
                type="number"
                className="form-control"
                value={settings.overspeedLimit}
                onChange={(e) => setSettings({...settings, overspeedLimit: parseInt(e.target.value)})}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Night Move Start Time</label>
              <input
                type="time"
                className="form-control"
                value={settings.nightMoveStart}
                onChange={(e) => setSettings({...settings, nightMoveStart: e.target.value})}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Night Move End Time</label>
              <input
                type="time"
                className="form-control"
                value={settings.nightMoveEnd}
                onChange={(e) => setSettings({...settings, nightMoveEnd: e.target.value})}
              />
            </div>
          </div>
          <button onClick={handleSettingsSave} className="btn btn-primary">
            <Save className="me-2" size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {/* Units Management */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-white border-0">
          <h6 className="mb-0 fw-bold">Units Management</h6>
        </div>
        <div className="card-body">
          {/* Add New Unit */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Unit Name"
                value={newUnit.unit_name}
                onChange={(e) => setNewUnit({...newUnit, unit_name: e.target.value})}
              />
            </div>
            <div className="col-md-2">
              <button onClick={handleAddUnit} className="btn btn-success">
                <Plus className="me-1" size={16} />
                Add Unit
              </button>
            </div>
          </div>

          {/* Units Table */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Unit Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.unit_id}>
                    <td>{unit.unit_id}</td>
                    <td>
                      {editingUnit && editingUnit.unit_id === unit.unit_id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingUnit.unit_name}
                          onChange={(e) => setEditingUnit({...editingUnit, unit_name: e.target.value})}
                        />
                      ) : (
                        unit.unit_name
                      )}
                    </td>
                    <td>
                      {editingUnit && editingUnit.unit_id === unit.unit_id ? (
                        <div className="btn-group btn-group-sm">
                          <button onClick={() => handleUpdateUnit(unit.unit_id)} className="btn btn-success">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditingUnit(null)} className="btn btn-secondary">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button onClick={() => setEditingUnit(unit)} className="btn btn-outline-primary">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteUnit(unit.unit_id)} className="btn btn-outline-danger">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicles Management */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-0">
          <h6 className="mb-0 fw-bold">Vehicles Management</h6>
        </div>
        <div className="card-body">
          {/* Add New Vehicle */}
          <div className="row mb-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Vehicle Number"
                value={newVehicle.vehicle_no}
                onChange={(e) => setNewVehicle({...newVehicle, vehicle_no: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Vehicle Type"
                value={newVehicle.vehicle_type}
                onChange={(e) => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newVehicle.unit_id}
                onChange={(e) => setNewVehicle({...newVehicle, unit_id: e.target.value})}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button onClick={handleAddVehicle} className="btn btn-success">
                <Plus className="me-1" size={16} />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Vehicle No</th>
                  <th>Vehicle Type</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id}>
                    <td>
                      {editingVehicle && editingVehicle.vehicle_id === vehicle.vehicle_id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingVehicle.vehicle_no}
                          onChange={(e) => setEditingVehicle({...editingVehicle, vehicle_no: e.target.value})}
                        />
                      ) : (
                        vehicle.vehicle_no
                      )}
                    </td>
                    <td>
                      {editingVehicle && editingVehicle.vehicle_id === vehicle.vehicle_id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingVehicle.vehicle_type}
                          onChange={(e) => setEditingVehicle({...editingVehicle, vehicle_type: e.target.value})}
                        />
                      ) : (
                        vehicle.vehicle_type
                      )}
                    </td>
                    <td>
                      {editingVehicle && editingVehicle.vehicle_id === vehicle.vehicle_id ? (
                        <select
                          className="form-select form-select-sm"
                          value={editingVehicle.unit_id}
                          onChange={(e) => setEditingVehicle({...editingVehicle, unit_id: e.target.value})}
                        >
                          {units.map((unit) => (
                            <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                          ))}
                        </select>
                      ) : (
                        units.find(u => u.unit_id === vehicle.unit_id)?.unit_name || 'Unknown'
                      )}
                    </td>
                    <td>
                      {editingVehicle && editingVehicle.vehicle_id === vehicle.vehicle_id ? (
                        <div className="btn-group btn-group-sm">
                          <button onClick={() => handleUpdateVehicle(vehicle.vehicle_id)} className="btn btn-success">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditingVehicle(null)} className="btn btn-secondary">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button onClick={() => setEditingVehicle(vehicle)} className="btn btn-outline-primary">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteVehicle(vehicle.vehicle_id)} className="btn btn-outline-danger">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
