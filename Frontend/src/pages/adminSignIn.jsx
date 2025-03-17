import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';

const AdminSignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: supabaseHeaders,
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          gotrue_meta_security: { admin: true } // Add admin flag
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in as admin");
      }

      // Verify admin role in user metadata
      if (!data.user.app_metadata?.is_admin) {
        throw new Error("Unauthorized: Not an admin user");
      }

      localStorage.setItem("adminToken", data.access_token);
      localStorage.setItem("isAdmin", "true");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin sign-in error:", error);
      setErrorMessage("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen' id='admin-bg'>
      <div id='admin-bg1' className='flex flex-col justify-center items-center h-screen'>
        <StyledWrapper>
          <form className="modern-form" onSubmit={handleSubmit}>
            <div className="form-title">Admin Sign In</div>
            <div className="form-body">
              <div className="input-group">
                <div className="input-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                    <path strokeWidth="1.5" stroke="currentColor" d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" />
                  </svg>
                  <input 
                    required 
                    name="email" 
                    placeholder="Admin Email" 
                    className="form-input" 
                    type="email" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-wrapper">
                  <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                    <path strokeWidth="1.5" stroke="currentColor" d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z" />
                  </svg>
                  <input 
                    required 
                    name="password" 
                    placeholder="Admin Password" 
                    className="form-input" 
                    type="password" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Admin Login"}
            </button>
            <div className="form-footer">
              <Link to="/signin"><span>Back to User Login</span></Link>
            </div>
          </form>
        </StyledWrapper>
      </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  .modern-form {
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    --primary-light: rgba(59, 130, 246, 0.1);
    --success: #10b981;
    --text-main: #1e293b;
    --text-secondary: #64748b;
    --bg-input: #f8fafc;

    position: relative;
    width: 300px;
    padding: 24px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.05),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  .form-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 24px;
    text-align: center;
    letter-spacing: -0.01em;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-input {
    width: 100%;
    height: 40px;
    padding: 0 36px;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: var(--bg-input);
    color: var(--text-main);
    transition: all 0.2s ease;
  }

  .form-input::placeholder {
    color: var(--text-secondary);
  }

  .input-icon {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--text-secondary);
    pointer-events: none;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    padding: 4px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .eye-icon {
    width: 16px;
    height: 16px;
  }

  .submit-button {
    position: relative;
    width: 100%;
    height: 40px;
    margin-top: 8px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  .error-message {
    color: red;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .form-footer {
    text-align: center;
    margin-top: 1rem;
  }

  .form-footer a {
    color: var(--primary);
    text-decoration: none;
  }

  .form-footer a:hover {
    text-decoration: underline;
  }

  /* Add any additional styles as needed */
`;

export default AdminSignIn; 