import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the dashboard after a short delay
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigate]);

  return (
    <div className="confirmation">
      <h1>Email Confirmed!</h1>
      <p>Your email has been successfully confirmed. You will be redirected to your dashboard shortly.</p>
    </div>
  );
};

export default Confirmation; 