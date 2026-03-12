import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import divLogo from '../assets/images/divlogo.png';
import { API_URL } from '../config';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log(`Attempting login at: ${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}. (Server: ${API_URL})`);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{
           background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
           position: 'relative',
           overflow: 'hidden'
         }}>
      
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Animated grid pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-9">
            <div className="card shadow-2xl border-0 position-relative" 
                 style={{
                   background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
                   backdropFilter: "blur(20px)",
                   borderRadius: "24px",
                   border: "1px solid rgba(255, 255, 255, 0.1)",
                   boxShadow: "0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                   overflow: "hidden",
                   transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                 }}>
              
              {/* Animated gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                backgroundSize: '300% 100%',
                animation: 'gradientShift 3s ease-in-out infinite'
              }}></div>
              
              {/* Corner accent */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>
              
              <div className="card-body p-5" style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo and Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img 
                      src={divLogo} 
                      alt="Division Logo" 
                      style={{
                        height: "80px",
                        filter: "drop-shadow(0 4px 20px rgba(59, 130, 246, 0.3))"
                      }}
                    />
                  </div>
                  <h2 className="text-white fw-bold mb-2">VMS</h2>
                  <p className="text-white-50 mb-0">Vehicle Monitoring System</p>
                  
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4" 
                         style={{
                           backgroundColor: "rgba(239, 68, 68, 0.1)",
                           border: "1px solid rgba(239, 68, 68, 0.3)",
                           borderRadius: "10px"
                         }}>
                      <AlertCircle size={18} className="me-2" />
                      <small className="mb-0">{error}</small>
                    </div>
                  )}

                  {/* Username Field */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small text-uppercase mb-2 fw-semibold">
                      Username
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" 
                            style={{
                              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))",
                              border: "1px solid rgba(71, 85, 105, 0.6)",
                              borderRight: "none",
                              borderRadius: "12px 0 0 12px"
                            }}>
                        <User size={18} className="text-info" />
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your username"
                        style={{
                          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))",
                          border: "1px solid rgba(71, 85, 105, 0.6)",
                          color: "#ffffff",
                          fontSize: "15px",
                          borderRadius: "0 12px 12px 0",
                          transition: "all 0.3s ease"
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="form-label text-white-50 small text-uppercase mb-2 fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" 
                            style={{
                              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))",
                              border: "1px solid rgba(71, 85, 105, 0.6)",
                              borderRight: "none",
                              borderRadius: "12px 0 0 12px"
                            }}>
                        <Lock size={18} className="text-info" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your password"
                        style={{
                          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))",
                          border: "1px solid rgba(71, 85, 105, 0.6)",
                          color: "#ffffff",
                          fontSize: "15px",
                          borderRadius: "0 12px 12px 0",
                          transition: "all 0.3s ease"
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))",
                          border: "1px solid rgba(71, 85, 105, 0.6)",
                          borderLeft: "none",
                          cursor: "pointer",
                          borderRadius: "0 12px 12px 0",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {showPassword ? 
                          <EyeOff size={18} className="text-info" /> : 
                          <Eye size={18} className="text-info" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        style={{
                          backgroundColor: "rgba(30, 41, 59, 0.8)",
                          border: "1px solid rgba(71, 85, 105, 0.5)"
                        }}
                      />
                      <label className="form-check-label text-muted small" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-decoration-none" 
                       style={{ color: "#3b82f6", fontSize: "14px" }}>
                      Forgot password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-semibold mb-3 position-relative overflow-hidden"
                    style={{
                      background: isLoading 
                        ? "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)"
                        : "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      minHeight: "52px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
                      position: "relative"
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        {/* Enhanced spinner */}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '10px'
                        }}></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <Shield size={18} className="me-2" />
                        <span>Sign In</span>
                      </div>
                    )}
                    
                    {/* Button shimmer effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transition: 'left 0.5s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.left = '100%';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.left = '-100%';
                    }}
                    ></div>
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted" style={{ opacity: 0.7 }}>
                © 2026 34 Division Vehicle Monitoring System 
              </small>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        .card {
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4) !important;
          transform: translateY(0);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5) !important;
        }
        
        .form-control:focus, .input-group-text:focus {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95)) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25) !important;
          color: #ffffff !important;
          outline: none;
        }
        
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4) !important;
        }
        
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3) !important;
        }
        
        .btn-primary:disabled {
          cursor: not-allowed;
          opacity: 0.9;
          transform: none !important;
        }
        
        .input-group-text:hover {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95)) !important;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        /* Enhanced checkbox styling */
        .form-check-input:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .form-check-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
        
        /* Link hover effects */
        a:hover {
          color: #60a5fa !important;
          text-decoration: underline !important;
        }
        `}
      </style>
    </div>
  );
}
