import React, { useState, useEffect } from "react";
import { Plus, Clock, MapPin, CheckCircle, Trash2, FileText, History, ShieldCheck, Search, Edit3, XCircle } from "lucide-react";

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
        end_datetime: ""
    });

    useEffect(() => {
        fetchSanctions();
        fetchUnits();
    }, []);

    useEffect(() => {
        if (formData.unit_id) {
            fetch(`http://localhost:5000/api/vehicles/by-unit/${formData.unit_id}`)
                .then(res => res.json())
                .then(data => setAvailableVehicles(data))
                .catch(err => console.error("Vehicle fetch error:", err));
        }
    }, [formData.unit_id]);

    const fetchSanctions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/sanctions');
            const data = await res.json();
            setSanctions(data);
        } catch (err) { console.error("Fetch error:", err); }
    };

    const fetchUnits = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/units_full');
            const data = await res.json();
            setUnits(data);
        } catch (err) { console.error("Units error:", err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this movement sanction?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/sanctions/${id}`, { method: 'DELETE' });
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
            end_datetime: sanction.end_datetime.replace(' ', 'T').slice(0, 16)
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

        const url = editingId 
            ? `http://localhost:5000/api/sanctions/${editingId}` 
            : 'http://localhost:5000/api/sanctions';
        
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                alert(editingId ? "Sanction Updated!" : "Sanction Issued!");
                setEditingId(null);
                setFormData({ unit_id: "", vehicle_id: "", route_from: "", route_to: "", start_datetime: new Date().toISOString().slice(0, 16), end_datetime: "" });
                fetchSanctions();
            }
        } catch (err) { alert("Server error."); }
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
                        <div className="col-md-8 d-flex align-items-end justify-content-end gap-2">
                            {editingId && (
                                <button type="button" className="btn btn-outline-danger px-4" onClick={() => {setEditingId(null); setFormData({unit_id: "", vehicle_id: "", route_from: "", route_to: "", start_datetime: new Date().toISOString().slice(0, 16), end_datetime: ""});}}>
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
                                <td className="small text-muted">{new Date(s.end_datetime).toLocaleString()}</td>
                                <td className="text-end pe-4">
                                    <div className="btn-group ">
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