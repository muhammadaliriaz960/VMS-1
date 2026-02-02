import React from "react";
import { Gauge, Download } from "lucide-react";
import { useTracking } from "../context/TrackingContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable directly

export default function MileageReport() {
  const { mileageLogs } = useTracking();

  const exportPDF = () => {
    try {
      console.log("Exporting PDF with data:", mileageLogs);
      
      const doc = new jsPDF();
      
      // 1. Add Header Content
      doc.setFontSize(18);
      doc.text("Mileage & Resource Report", 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total Assets Logged: ${mileageLogs.length}`, 14, 27);

      // 2. Prepare Table Columns and Rows
      const tableColumn = [
        "BA Number", 
        "Unit", 
        "Start Point", 
        "Last Point", 
        "Distance", 
        "Avg Speed"
      ];

      const tableRows = mileageLogs.map(item => [
        item.ba || "N/A",
        item.unit || "Tactical Unit",
        item.startLat ? `${item.startLat}, ${item.startLng}` : "No Signal",
        item.lastLat ? `${item.lastLat}, ${item.lastLng}` : "No Signal",
        `${item.total || "0.00"} km`,
        item.currentSpeed || "0 km/h"
      ]);

      // 3. Generate Table using the direct autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] }, // Dark header
        styles: { fontSize: 8 },
      });

      // 4. Save the file
      doc.save(`VMS_Report_${Date.now()}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert("Could not generate PDF. Check console for details.");
    }
  };

  return (
    <div className="p-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Mileage & Resource Report</h3>
          <p className="text-muted small">Live logs from tactical assets.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={exportPDF}
            className="btn btn-dark btn-sm d-flex align-items-center gap-2"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>
                <th className="ps-4">BA Number</th>
                <th>Assigned Unit</th>
                <th>Start Point</th>
                <th>Last Point</th>
                <th>Total Distance</th>
                <th>Avg Speed</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>
              {mileageLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No active mission data found.
                  </td>
                </tr>
              ) : (
                mileageLogs.map((item, i) => (
                  <tr key={i} style={{ fontSize: '14px' }}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        {/* <div className="bg-primary-subtle p-1 rounded">
                          <Gauge size={14} className="text-primary" />
                        </div> */}
                        <span className="fw-bold">{item.ba}</span>
                      </div>
                    </td>
                    <td>{item.unit}</td>
                    <td className="text-muted small">
                      {item.startLat ? `${item.startLat}, ${item.startLng}` : "N/A"}
                    </td>
                    <td className="text-muted small">
                      {item.lastLat ? `${item.lastLat}, ${item.lastLng}` : "N/A"}
                    </td>
                    <td className="fw-bold text-dark">{item.total} km</td>
                    <td>{item.currentSpeed}</td>
                    {/* <td>
                      <span className="badge bg-success-subtle text-success border">Live</span>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}