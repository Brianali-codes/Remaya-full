import React, { useState, useEffect } from 'react';
import Logo from './assets/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons';
import MENU from './assets/menu.png'
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true); // Track visibility of navbar
  const [sidebar, setSidebar] = useState('sidebarOff')
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    // Check authentication status when component mounts
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const email = localStorage.getItem('userEmail');
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth tokens
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserEmail('');
    navigate('/signin');
  };

  const checkState = ()=>{
    if (sidebar === 'sidebarOff'){
      setSidebar('sidebarOn')
    }
    else{
      setSidebar('sidebarOff')
    }
  }


  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = () => {
      let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > lastScrollTop) {
        // Scrolling down, hide the navbar
        setShowNavbar(false);
      } else {
        // Scrolling up, show the navbar
        setShowNavbar(true);
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Ensure it doesn't go below 0
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className={`flex flex-row justify-between p-5 items-center custom-navbar ${showNavbar ? 'show-navbar' : 'hide-navbar'}`}>
        <div className="flex flex-row justify-center items-center gap-10">
          <img src={Logo} alt="Logo" className="w-14" id='logo'/>
          <div className="nav-links flex flex-row gap-2 justify-center items-center">
            <a href="#MAIN1">
              <button className="btn">Home</button>
            </a>
            <a href="#abd">
              <buttton className="btn">About us</buttton>
            </a>
            <a href="#projects">
              <button className="btn">Projects</button>
            </a>
            <a href="#mission">
              <button className="btn">Mission And Vision</button>
            </a>
            <a href="#contact">
              <button className="btn">Contact Us</button>
            </a>
            

            <DropdownButton id="dropdown-basic-button" title="More">
              <Dropdown.Item href="#gallery">Gallery</Dropdown.Item>
              <Dropdown.Item href="#Blog">Blog</Dropdown.Item>
              <Dropdown.Divider />
              {isAuthenticated ? (
                <Dropdown.Item><Link to="/user/dashboard">Dashboard</Link></Dropdown.Item>
              ) : (
                <>
                  <Dropdown.Item><Link to="/signin">Sign in</Link></Dropdown.Item>
                  <Dropdown.Item><Link to="/signup">Sign up</Link></Dropdown.Item>
                  <Dropdown.Item><Link to="/admin/signin">Admin Sign In</Link></Dropdown.Item>
                </>
              )}
            </DropdownButton>

          </div>
          
        </div>
        <div className="flex flex-row justify-center gap-5 items-center socials">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FontAwesomeIcon icon={faXTwitter} className="text-2xl text-black hover:cursor-pointer" />
            <a href="https://m.facebook.com/people/Remaya-ORG/100064591067526/" target='_blank'><FontAwesomeIcon icon={faFacebook} className="text-black text-2xl hover:cursor-pointer" /></a>
            <FontAwesomeIcon icon={faInstagram} className="text-2xl text-black hover:cursor-pointer" />
          </div>

          <Link to="/donate"><button className='support-btn2'>Donate | <FontAwesomeIcon icon={faArrowRight} id='sb2'/></button></Link>
          
          {isAuthenticated && (
            <div className="profile-dropdown">
              <DropdownButton
                id="profile-dropdown-button"
                title={
                  <div className="profile-icon">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} 
                      alt="profile" 
                      className="rounded-full w-8 h-8 object-cover border-2"
                    />
                  </div>
                }
                className="profile-dropdown-button"
              >
                <Dropdown.Item as={Link} to="/user/dashboard">Dashboard</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </DropdownButton>
            </div>
          )}
        </div>
        <img src={MENU} alt="" className='w-7' id='menu' onClick={checkState}/>
      </div>

      <style>{`
        .profile-dropdown {
          position: relative;
          margin-left: -0.5rem;
          background-color: black;
          border-radius:10px;
        }

        .profile-dropdown-button {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          display: flex;
          align-items: center;
        }

        .profile-dropdown-button::after {
          display: none !important;
        }

        .profile-icon {
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          
          align-items: center;
        }
        .profile-icon{
          
        }
        .profile-icon:hover {
          transform: scale(1.05);
        }

        /* Style the dropdown menu */
        .dropdown-menu {
          margin-top: 0.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .dropdown-item {
          padding: 0.5rem 1rem;
          color: #4a5568;
        }

        .dropdown-item:hover {
          background-color: #f7fafc;
          color:rgb(67, 67, 253);
        }

        .dropdown-divider {
          margin: 0.25rem 0;
        }

        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <div className={sidebar}>
          <motion.a
            href="#MAIN1"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 0 }} // No delay for the first button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>Home</button>
          </motion.a>

          <motion.a
            href="#abd"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 0.2 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>About Us</button>
          </motion.a>

          <motion.a
            href="#projects"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 0.4 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>Projects</button>
          </motion.a>

          <motion.a
            href="#mission"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 0.6 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>Mission and Vision</button>
          </motion.a>

          <motion.a
            href="#gallery"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 0.8 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>Gallery</button>
          </motion.a>

          <motion.a
            href="#Blog"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 1.0 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <button className="btn" onClick={checkState}>Blog</button>
          </motion.a>

          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 50 }}  // Start from below the screen
            whileInView={{ opacity: 1, y: 0 }} // Move to original position
            transition={{ duration: 1, delay: 1.2 }} // Small delay before this button
            viewport={{ once: true }} // Ensures it triggers only once when in view
            className="your-button-class"
          >
            <DropdownButton id="dropdown-basic-button" title="More">
              <Dropdown.Item href="#gallery">Gallery</Dropdown.Item>
              <Dropdown.Item href="#Blog">Blog</Dropdown.Item>
              <Dropdown.Divider />
              {isAuthenticated ? (
                <Dropdown.Item><Link to="/user/dashboard">Dashboard</Link></Dropdown.Item>
              ) : (
                <>
                  <Dropdown.Item><Link to="/signin">Sign in</Link></Dropdown.Item>
                  <Dropdown.Item><Link to="/signup">Sign up</Link></Dropdown.Item>
                  <Dropdown.Item><Link to="/admin/signin">Admin Sign In</Link></Dropdown.Item>
                </>
              )}
            </DropdownButton>
          </motion.a>
          
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              viewport={{ once: true }}
              className="flex flex-col w-full px-4 py-2 border-t border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} 
                  alt="profile" 
                  className="rounded-full w-6 h-6 object-cover border border-blue-500"
                />
                <span className="text-sm text-gray-700 truncate">{userEmail}</span>
              </div>
              <button 
                onClick={() => {
                  handleLogout();
                  checkState();
                }}
                className="text-red-600 text-sm hover:text-red-700 text-left"
              >
                Logout
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
            viewport={{ once: true }}
            className="your-button-class"
          >
            <Link to="/donate">
              <button className="support-btn2" onClick={checkState}>
                Donate | <FontAwesomeIcon icon={faArrowRight} id="sb2" />
              </button>
            </Link>
          </motion.div>
        </div>


    </>
  );
}
