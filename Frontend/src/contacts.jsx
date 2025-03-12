import { useState } from "react";
import { Link } from 'react-router-dom';

function Snackbar({ message, type, show }) {
  return (
    <div className={`desc snackbar ${type} ${show ? "show" : "hide"}`}>
      {message}
    </div>
  );
}

export default function Contacts() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", type: "", show: false });

  const handleSubscribe = async () => {
    if (!email) {
      showSnackbar("Please enter a valid email address.", "error");
      return;
    }

    const data = { email };

    try {
      setIsLoading(true);
      const response = await fetch("https://remaya-backend.onrender.com/api/save-newsLetter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setIsLoading(false);
      showSnackbar(result.message || "Successfully subscribed!", "success");
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);

      const errorMessage = error.name === "TypeError" && error.message.includes("Failed to fetch")
        ? "Network error. Please check your internet connection or try again later."
        : "An error occurred, or email already exists. Please try again.";
      
      setTimeout(() => {
        showSnackbar(errorMessage, "error");
      }, 300);
    }
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type, show: true });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  return (
    <>
      <div className="contacts p-5" id="contact">
        <div>
          <p className="desc font-bold text-center">Remaya Organization</p>
          <p className="desc font-bold text-center">+254-774-545-775</p>
          <br />
          <p className="desc font-bold text-center">PO BOX : 8545-00200</p>
          <p className="desc font-bold text-center">Nairobi, Kenya</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="desc font-bold text-lg text-center">Subscribe to our Newsletter</p>
          <p className="desc text-center">
            Be the first to hear important updates, see brand new resources, and find new ways to connect from the team at Remaya organization.
          </p>
          <input
            type="email"
            placeholder="Your Email Address..."
            className="desc text-center"
            id="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <button
            className="desc subscribe-button flex items-center justify-center"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loader mr-2"></span>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <Link to="/"><button className="btn">Home</button></Link>
          <Link to="/blog"><button className="btn">Blog</button></Link>
          {localStorage.getItem('token') ? (
            <Link to="/dashboard"><button className="btn">My Account</button></Link>
          ) : (
            <>
              <Link to="/signin"><button className="btn">Sign In</button></Link>
              <Link to="/signup"><button className="btn">Sign Up</button></Link>
            </>
          )}
          {localStorage.getItem('adminToken') && (
            <Link to="/admin/dashboard"><button className="btn">Admin Panel</button></Link>
          )}
          <Link to="/donate"><button className="btn">Donate</button></Link>
        </div>

        {snackbar.message && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            show={snackbar.show}
          />
        )}
      </div>

      <style>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .snackbar {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          padding: 10px 20px;
          border-radius: 5px;
          color: #fff;
          font-size: 14px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .snackbar.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .snackbar.hide {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }

        .snackbar.success {
          background-color: #4caf50;
        }

        .snackbar.error {
          background-color: #f44336;
        }

        .close-btn {
          background: none;
          color: white;
          border: none;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
        }
      `}</style>
      <p className="desc text-center m-0 font-bold" id="foot">All rights reserved | Remaya.org | &#169; 2025</p>
    </>
  );
}
