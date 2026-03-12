import React from "react";
import { Cpu, Send, Server, Shield, Smartphone, Globe, Database } from "lucide-react";

export default function Architecture() {
  return (
    <div className="p-5" style={{ animation: "fadeIn 0.5s ease-in-out", background: "#0b0e14", minHeight: "100vh", color: "#fff" }}>
      {/* TACTICAL HEADER */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-success">VMS TACTICAL ARCHITECTURE</h2>
        <p className="text-secondary">Distributed Command Node Infrastructure & Dual-IP TCP Telemetry Flow</p>
        <div className="mx-auto bg-success" style={{ width: '80px', height: '4px', borderRadius: '2px' }}></div>
      </div>

      <div className="row justify-content-center align-items-center g-4">
        
        {/* STEP 1: FIELD ASSET LOGIC */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 text-center bg-dark border-top border-success border-4 h-100">
            <div className="mb-3 text-success"><Smartphone size={40} /></div>
            <h6 className="fw-bold text-white">Dual-IP VT150L Tracker</h6>
            <p className="small text-secondary mb-3">Hardware-configured to multicast packets to redundant HQ and Station IPs.</p>
            <div className="bg-black p-2 rounded text-start">
                <div className="text-info font-monospace" style={{fontSize: '10px'}}>MAIN HQ: 164.221.6.66</div>
                <div className="text-warning font-monospace" style={{fontSize: '10px'}}>STATION: Local IP Node</div>
            </div>
          </div>
        </div>

        {/* TELEMETRY PACKET FLOW */}
        <div className="col-md-1 text-center d-none d-md-block">
          <div className="d-flex flex-column align-items-center">
            <Send className="text-success mb-2" size={24} />
            <div className="small text-secondary vertical-text font-monospace" style={{fontSize: '9px'}}>HEX TCP PACKETS</div>
          </div>
        </div>

        {/* STEP 2: PROCESSING ENGINE */}
        <div className="col-md-4">
          <div className="card border-0 shadow-lg p-4 text-center bg-black border border-secondary h-100">
            <div className="mb-3 text-info"><Server size={48} /></div>
            <h5 className="fw-bold text-white">Node.js Core Backend</h5>
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                <span className="badge bg-primary">TCP Listener</span>
                <span className="badge bg-dark border border-secondary">iStartek Parser</span>
                <span className="badge bg-success">MySQL DB</span>
            </div>
            <p className="small text-secondary">Decrypts raw telemetry data and updates localized databases for real-time visualization.</p>
          </div>
        </div>

        {/* DISTRIBUTION NODES ARROW */}
        <div className="col-md-1 text-center d-none d-md-block">
          <div className="d-flex flex-column align-items-center gap-3">
             <Send className="text-info" style={{ transform: 'rotate(-20deg)' }} size={20} />
             <Send className="text-primary" size={20} />
             <Send className="text-warning" style={{ transform: 'rotate(20deg)' }} size={20} />
          </div>
        </div>

        {/* STEP 3: COMMAND NODES */}
        <div className="col-md-3">
          <div className="d-flex flex-column gap-3">
            <div className="card border-0 bg-dark p-3 border-start border-info border-4">
              <div className="d-flex align-items-center gap-3">
                <Database className="text-info" size={24} />
                <div>
                  <h6 className="mb-0 fw-bold text-white">Main HQ Node</h6>
                  <small className="text-secondary font-monospace" style={{fontSize: '10px'}}>Primary IP: 164.221.6.66</small>
                </div>
              </div>
            </div>

            <div className="card border-0 bg-dark p-3 border-start border-warning border-4">
              <div className="d-flex align-items-center gap-3">
                <Globe className="text-warning" size={24} />
                <div>
                  <h6 className="mb-0 fw-bold text-white">Auxiliary Stations</h6>
                  <small className="text-secondary">Localized Tactical Oversight</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TECHNICAL COMMUNICATION LOGIC */}
      <div className="row justify-content-center mt-5">
        <div className="col-md-10">
          <div className="card border-0 bg-dark p-4 shadow-sm border border-secondary">
            <h6 className="fw-bold border-bottom border-secondary pb-2 mb-3 text-success">
               System Communication Protocol [TCP/IP Multi-Path Architecture]
            </h6>
            <div className="row g-4 small text-secondary">
              <div className="col-md-4">
                <strong className="text-white">1. Multi-Path Ingestion:</strong> 
                <p>
                Field assets transmit simultaneously to two distinct IP nodes, ensuring high availability of telemetry even during link failure.
             </p>
              </div>
              <div className="col-md-4">
                <strong className="text-white">2. Localized Persistence:</strong> 
                <p>
  Each command node maintains its own database, allowing for independent operation and rapid local access to tactical history.
                </p>

              </div>
              <div className="col-md-4">
                <strong className="text-white">3. Decoupled Dashboard:</strong> 
                <p>
                  Real-time data visualization is handled by a separate frontend, reducing load on command nodes and enhancing scalability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}