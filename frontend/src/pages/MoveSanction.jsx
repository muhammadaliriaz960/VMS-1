import React, { useState, useEffect } from "react";
import { Plus, Clock, MapPin, CheckCircle, Trash2, FileText, History, ShieldCheck, Search, Edit3, XCircle } from "lucide-react";
import { API_URL, WS_URL } from "../config";

export default function MoveSanction() {
    const [sanctions, setSanctions] = useState([]);
    const [units, setUnits] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [viewMode, setViewMode] = useState("ACTIVE"); 
    const [searchTerm, setSearchTerm] = useState("");
    
    // Track if we are editing an existing sanction
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        unit_id: "", 
        vehicle_id: "", 
        route_from: "", 
        route_to: "", 
        start_datetime: new Date().toISOString().slice(0, 16),
        end_datetime: "",
        driver_name: "",
        contact_no: "",
        purpose: ""
    });

    useEffect(() => {
        fetchSanctions();
        fetchUnits();
        
        // Listen for real-time sanction updates
        const handleSanctionUpdate = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "SANCTIONS_UPDATED") {
                console.log("Sanctions updated:", data.message);
                fetchSanctions(); // Refresh the sanctions list
            }
        };
        
        // Create WebSocket connection for real-time updates
        const ws = new WebSocket(WS_URL);
        ws.onmessage = handleSanctionUpdate;
        ws.onerror = (err) => console.log('WebSocket error:', err);
        ws.onclose = () => console.log('WebSocket disconnected');
        
        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (formData.unit_id) {
            fetch(`${API_URL}/api/vehicles/by-unit/${formData.unit_id}`)
                .then(res => res.json())
                .then(data => setAvailableVehicles(data))
                .catch(err => console.error("Vehicle fetch error:", err));
        }
    }, [formData.unit_id]);

    const fetchSanctions = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sanctions`);
            const data = await res.json();
            setSanctions(data);
        } catch (err) { console.error("Fetch error:", err); }
    };

    const fetchUnits = async () => {
        try {
            const res = await fetch(`${API_URL}/api/units_full`);
            const data = await res.json();
            setUnits(data);
        } catch (err) { console.error("Units error:", err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this movement sanction?")) return;
        try {
            const res = await fetch(`${API_URL}/api/sanctions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSanctions(sanctions.filter(s => s.sanction_id !== id));
            }
        } catch (err) { alert("Delete failed."); }
    };

    const handleEditInitiate = (sanction) => {
        setEditingId(sanction.sanction_id);
        setFormData({
            unit_id: sanction.unit_id,
            vehicle_id: sanction.vehicle_id,
            route_from: sanction.route_from,
            route_to: sanction.route_to,
            start_datetime: sanction.start_datetime.replace(' ', 'T').slice(0, 16),
            end_datetime: sanction.end_datetime.replace(' ', 'T').slice(0, 16),
            driver_name: sanction.driver_name || "",
            contact_no: sanction.contact_no || "",
            purpose: sanction.purpose || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            start_datetime: formData.start_datetime.replace('T', ' ') + ':00',
            end_datetime: formData.end_datetime.replace('T', ' ') + ':00'
        };

        // Debug: Log what we're sending
        console.log("Submitting sanction data:", submissionData);
        console.log("Driver name:", submissionData.driver_name);
        console.log("Contact no:", submissionData.contact_no);
        console.log("Purpose:", submissionData.purpose);

        const url = editingId 
            ? `${API_URL}/api/sanctions/${editingId}` 
            : `${API_URL}/api/sanctions`;
        
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            // Debug: Log response
            console.log("Response status:", res.status);
            console.log("Response ok:", res.ok);
            
            if (res.ok) {
                const result = await res.json();
                console.log("Response data:", result);
                alert(editingId ? "Sanction Updated!" : "Sanction Issued!");
                setEditingId(null);
                setFormData({ unit_id: "", vehicle_id: "", route_from: "", route_to: "", start_datetime: new Date().toISOString().slice(0, 16), end_datetime: "", driver_name: "", contact_no: "", purpose: "" });
                fetchSanctions();
            } else {
                const errorData = await res.json();
                console.error("Server error:", errorData);
                alert("Error: " + (errorData.error || "Unknown error"));
            }
        } catch (err) { 
            console.error("Fetch error:", err);
            alert("Server error."); 
        }
    };

    const now = new Date();
    const filteredSanctions = sanctions.filter(s => {
        const isExpired = new Date(s.end_datetime) < now;
        const matchesView = viewMode === "ACTIVE" ? !isExpired : isExpired;
        const matchesSearch = s.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesView && matchesSearch;
    });

    return (
        <div className="p-4 bg-light min-vh-100">
            {/* Header Section */}
            <div className="mb-4">
                <div>
                    <h3 className="fw-bold mb-1 text-dark">Move Sanction</h3>
                    <p className="text-muted small mb-0">Manage movement orders and vehicle sanctions</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="card shadow-sm border-0 mb-5 overflow-hidden">
                <div className={`card-header text-white py-3 ${editingId ? 'bg-black' : 'bg-black'}`}>
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                        {/* {editingId ? <Edit3 size={20} /> : <Plus size={20} />}  */}
                        {editingId ? `Editing Sanction for ${formData.vehicle_id}` : "Add New Movement Order"}
                    </h5>
                </div>
                <div className="card-body p-4 bg-white">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Unit</label>
                            <select className="form-select border-2" value={formData.unit_id} onChange={(e) => setFormData({...formData, unit_id: e.target.value})} required>
                                <option value="">Select Unit...</option>
                                {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Vehicle (BA Number)</label>
                            <select className="form-select border-2" value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} required disabled={!formData.unit_id}>
                                <option value="">Select Vehicle...</option>
                                {availableVehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_no}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Route From</label>
                            <input type="text" className="form-control border-2" value={formData.route_from} onChange={(e) => setFormData({...formData, route_from: e.target.value})} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Route To</label>
                            <input type="text" className="form-control border-2" value={formData.route_to} onChange={(e) => setFormData({...formData, route_to: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Expiry</label>
                            <input type="datetime-local" className="form-control border-2" value={formData.end_datetime} onChange={(e) => setFormData({...formData, end_datetime: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Driver Name</label>
                            <input type="text" className="form-control border-2" value={formData.driver_name} onChange={(e) => setFormData({...formData, driver_name: e.target.value})} placeholder="Enter driver name" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Contact No</label>
                            <input type="text" className="form-control border-2" value={formData.contact_no} onChange={(e) => setFormData({...formData, contact_no: e.target.value})} placeholder="Enter contact number" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Purpose of Move</label>
                            <input type="text" className="form-control border-2" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} placeholder="Enter purpose" />
                        </div>
                        <div className="col-md-12 d-flex align-items-end justify-content-end gap-2">
                            {editingId && (
                                <button type="button" className="btn btn-outline-danger px-4" onClick={() => {setEditingId(null); setFormData({unit_id: "", vehicle_id: "", route_from: "", route_to: "", start_datetime: new Date().toISOString().slice(0, 16), end_datetime: "", driver_name: "", contact_no: "", purpose: ""});}}>
                                    Cancel Edit
                                </button>
                            )}
                            <button type="submit" className={`btn px-5 fw-bold ${editingId ? 'btn-primary' : 'btn-success'}`}>
                                {editingId ? "Update Authorization" : "Add Movement"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* List Section Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="btn-group border ">
                    <button className={`btn btn-sm ${viewMode === "ACTIVE" ? "btn-success" : "btn btn-outline-secondary"}`} onClick={() => setViewMode("ACTIVE")}>Active</button>
                    <button className={`btn btn-sm ${viewMode === "EXPIRED" ? "btn-danger" : "btn btn-outline-secondary"}`} onClick={() => setViewMode("EXPIRED")}>History</button>
                </div>
                <div className="input-group w-25">
                    <span className="input-group-text bg-white"><Search size={14}/></span>
                    <input type="text" className="form-control form-control-sm" placeholder="Search BA No..." onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm border-0 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-dark text-white">
                        <tr>
                            <th className="ps-4">BA Number</th>
                            <th>Unit</th>
                            <th>Route</th>
                            <th>Driver</th>
                            <th>Contact No</th>
                            <th>Purpose</th>
                            <th>Validity</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSanctions.map((s) => (
                            <tr key={s.sanction_id}>
                                <td className="ps-4 fw-bold">{s.vehicle_no}</td>
                                <td>{s.unit_name}</td>
                                <td>{s.route_from} → {s.route_to}</td>
                                <td className="small">{s.driver_name || "-"}</td>
                                <td className="small">{s.contact_no || "-"}</td>
                                <td className="small">{s.purpose || "-"}</td>
                                <td className="small text-muted">{new Date(s.end_datetime).toLocaleString()}</td>
                                <td className="text-end pe-4">
                                    <div className="btn-group">
                                        <button className="btn btn-outline-primary mx-2 btn-sm" title="Edit" onClick={() => handleEditInitiate(s)}>
                                            <Edit3 size={14} />
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm" title="Revoke" onClick={() => handleDelete(s.sanction_id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}