import React from "react";
import { Bold, Code, ShieldCheck, UserCheck, Cpu } from "lucide-react";

import divLogo from "../assets/images/divlogo.png";
import signalsLogo from "../assets/images/UnitLogo3.png";

// Import all images
import teamPhoto from "../assets/images/w1.jpg";
import teamPhoto1 from "../assets/images/w11.jpeg";
import teamPhoto2 from "../assets/images/w12.jpeg";
import teamPhoto5 from "../assets/images/w5.jpeg";
import teamPhoto6 from "../assets/images/w7.jpeg";
import teamPhoto7 from "../assets/images/w2.jpg";
import teamPhoto8 from "../assets/images/w9.jpeg";
import coImage from "../assets/images/CO.jpeg"
import gocImage from "../assets/images/goc.jpg"

export default function TeamPage() {
  const images = [teamPhoto8, teamPhoto7, teamPhoto6, teamPhoto5, teamPhoto, teamPhoto1, teamPhoto2];

  return (
    <div className="p-4" style={{ animation: "fadeIn 0.6s ease-out", background: "#f8f9fa", minHeight: "100vh" }}>
      <style>
        {`
          @keyframes glow {
            from {
              box-shadow: 0 0 15px rgba(245, 245, 245, 0.4), 0 0 30px rgba(245, 245, 245, 0.2);
            }
            to {
              box-shadow: 0 0 20px rgba(245, 245, 245, 0.6), 0 0 40px rgba(245, 245, 245, 0.3);
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div className="row justify-content-center mb-4 px-5">
        <div className="col-3 text-start">
          <img src={divLogo} alt="34 DIV HQ" style={{ height: "60px", objectFit: "contain" }} />
        </div>
        <div className="col-6 text-center">
          <h2 className="fw-bold mb-0 text-dark text-uppercase" style={{ letterSpacing: '-1px' }}>34 Div R&D Cell</h2>
        </div>
        <div className="col-3 text-end">
          <img src={signalsLogo} alt="41 Signals" style={{ height: "60px", objectFit: "contain" }} />
        </div>
      </div>

      {/* CO AND GOC CARDS - Side by Side */}
      <div className="row justify-content-center mb-4 px-4">
        {/* GOC Card */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm overflow-hidden h-100 text-center" style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)' }}>
            {/* GOC PIC at top */}
            <div className="pt-4">
              <img 
                src={gocImage} 
                alt="GOC 34 Div" 
                style={{ 
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                  border: '3px solid #fff'
                }} 
                className="img-fluid"
              />
            </div>
            {/* GOC Name and Title */}
            <div className="mt-3">
              <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '1rem' }}>
                Maj Gen Amjad Aziz Moghal
              </h5>
              <p className="mb-0 small text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                General Officer Commanding 34 Div
              </p>
            </div>
            {/* Statement below */}
            <div className="px-3 pb-3 mt-2">
              <p className="text-dark mb-0 fw-medium" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                The proj was initiated on the dir of Maj Gen Amjad Aziz Moghal, GOC 34 Div. His keen interest in technological innovation and modernization has significantly contributed towards the dev of this sys aimed at enhancing realtime situational awareness, op coord and effective monitoring of veh assets.
              </p>
            </div>
          </div>
        </div>

        {/* CO Card */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm overflow-hidden h-100 text-center" style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)' }}>
            {/* CO PIC at top */}
            <div className="pt-4">
              <img 
                className="rounded-circle"
                src={coImage}
                alt="Lt Col Karrar Hussain" 
                style={{  
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                  border: '3px solid #fff'
                }} 
              />
            </div>
            {/* CO Name and Title */}
            <div className="mt-3">
              <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '1rem' }}>
                Lt Col Karrar Hussain
              </h5>
              <p className="mb-0 small text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                CO 41 Signals Bn
              </p>
            </div>
            {/* Statement below */}
            <div className="px-3 pb-3 mt-2">
              <p className="text-dark mb-0 fw-medium" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                On the dir of Maj Gen Amjad Aziz Moghal (GOC 34 Div), Lt Col Karrar Hussain designed the architecture for an IP-based, 4G-enabled Veh Mgmt Sys (VMS).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="row justify-content-center mb-4 px-4">
        <div className="col-12">
          <div id="rdTeamCarousel" className="carousel slide shadow rounded-4 overflow-hidden border border-4 border-white" data-bs-ride="carousel">
            {/* Indicators */}
            <div className="carousel-indicators">
              {images.map((_, index) => (
                <button 
                  key={index}
                  type="button" 
                  data-bs-target="#rdTeamCarousel" 
                  data-bs-slide-to={index} 
                  className={index === 0 ? "active" : ""}
                ></button>
              ))}
            </div>
            {/* Carousel Items */}
            <div className="carousel-inner" style={{ height: '350px' }}>
              {images.map((img, index) => (
                <div key={index} className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} data-bs-interval="3000">
                  <img src={img} className="d-block w-100 h-100" style={{ objectFit: 'cover' }} alt={`Slide ${index}`} />
                </div>
              ))}
            </div>
            {/* Controls */}
            <button className="carousel-control-prev" type="button" data-bs-target="#rdTeamCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon shadow-sm"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#rdTeamCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon shadow-sm"></span>
            </button>
            {/* Bottom Label */}
            <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-75 text-white text-center" style={{ zIndex: 10 }}>
              <span className="fw-bold small px-3 tracking-widest">41 SIGs R&D CELL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Team */}
      <div className="row g-2 justify-content-center px-4">
        {[
          { name: "Maj Mehr", icon: <UserCheck size={20} /> },
          { name: "Capt Arslan", icon: <Code size={20} /> },
          { name: "Capt Javeria", icon: <ShieldCheck size={20} /> },
          { name: "Nk Ali Riaz", icon: <Cpu size={20} /> }   
        ].map((member, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-2 text-center bg-white">
              <div className="text-primary mb-1">{member.icon}</div>
              <h6 className="fw-semibold mb-0 small text-dark">
                {member.name}
              </h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}