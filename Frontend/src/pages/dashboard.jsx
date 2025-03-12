import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userStats, setUserStats] = useState({
    totalBlogs: 0,
    recentBlogs: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user email from localStorage or Supabase session
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // Fetch user's blog stats
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:5000/api/blogs/user/${userId}`);
        const blogs = await response.json();
        
        setUserStats({
          totalBlogs: blogs.length,
          recentBlogs: blogs.slice(0, 3) // Get 3 most recent blogs
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/signin');
  };

  return (
    <DashboardContainer>
      <NavBar>
        <NavSection>
          <BackButton onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </BackButton>
          <h2>Remaya Blog</h2>
          <NavLinks>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/blog">Public Blog</Link>
          </NavLinks>
        </NavSection>
        <NavSection>
          <UserInfo>
            <span>Welcome, {userEmail}</span>
            <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
          </UserInfo>
        </NavSection>
      </NavBar>

      <MainContent>
        <DashboardHeader>
          <WelcomeSection>
            <h1>Your Dashboard</h1>
            <p>Manage your blogs and content</p>
          </WelcomeSection>
          <StatsSection>
            <StatCard>
              <h3>Total Blogs</h3>
              <p>{userStats.totalBlogs}</p>
            </StatCard>
          </StatsSection>
        </DashboardHeader>

        <UserDashboard />
      </MainContent>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  h2 {
    color: #1a365d;
    margin: 0;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    color: #4a5568;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #2d3748;
      background-color: #f7fafc;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    color: #4a5568;
    font-weight: 500;
  }
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #dc2626;
  }
`;

const MainContent = styled.main`
  padding: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const WelcomeSection = styled.div`
  h1 {
    color: #1a365d;
    margin-bottom: 0.5rem;
  }

  p {
    color: #4a5568;
  }
`;

const StatsSection = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-width: 150px;

  h3 {
    color: #4a5568;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #1a365d;
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export default Dashboard; 