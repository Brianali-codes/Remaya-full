import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBlog, faChartLine, faCog, faUsers, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import BlogFormModal from '../components/BlogFormModal';
import UserRegistrationForm from '../components/UserRegistrationForm';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    twitterHandle: '',
    linkedinHandle: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const isAdmin = localStorage.getItem("isAdmin");
    
    if (!adminToken || !isAdmin) {
      navigate("/admin/signin");
      return;
    }
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch('http://localhost:5000/api/blogs', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setBlogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="dashboard" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faChartLine} />
              <span>Dashboard</span>
            </TabTitle>
          }
        >
          <DashboardStats>
            <StatCard>
              <h3>Total Blogs</h3>
              <p>{blogs.length}</p>
            </StatCard>
            <StatCard>
              <h3>Total Users</h3>
              <p>0</p>
            </StatCard>
            <StatCard>
              <h3>Total Views</h3>
              <p>0</p>
            </StatCard>
          </DashboardStats>
        </Tab>

        <Tab 
          eventKey="blogs" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faBlog} />
              <span>Blogs</span>
            </TabTitle>
          }
        >
          <ActionButton onClick={() => setIsModalOpen(true)}>
            Create New Blog
          </ActionButton>
          <BlogsList>
            {loading ? (
              <div>Loading blogs...</div>
            ) : blogs.length === 0 ? (
              <div>No blogs found</div>
            ) : (
              blogs.map(blog => (
                <BlogCard key={blog.id}>
                  <h3>{blog.title}</h3>
                  <p>By: {blog.user_email || 'Anonymous'}</p>
                  <p>Created: {new Date(blog.created_at).toLocaleDateString()}</p>
                  {blog.image_url && (
                    <img 
                      src={blog.image_url} 
                      alt={blog.title} 
                      style={{ maxWidth: '200px' }} 
                    />
                  )}
                </BlogCard>
              ))
            )}
          </BlogsList>
        </Tab>

        <Tab 
          eventKey="users" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faUsers} />
              <span>Students</span>
            </TabTitle>
          }
        >
          <UserRegistrationForm />
        </Tab>

        <Tab 
          eventKey="security" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Security</span>
            </TabTitle>
          }
        >
          <h2>Security Settings</h2>
          {/* Security content */}
        </Tab>

        <Tab 
          eventKey="settings" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faCog} />
              <span>Settings</span>
            </TabTitle>
          }
        >
          <h2>Admin Settings</h2>
          {/* Settings content */}
        </Tab>
      </Tabs>

      <BlogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={fetchBlogs}
        formData={formData}
        setFormData={setFormData}
        isAdmin={true}
      />
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .nav-tabs {
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 2rem;
  }

  .nav-link {
    border: none;
    color: #4a5568;
    padding: 1rem 1.5rem;
    margin-right: 1rem;
    
    &:hover {
      border: none;
      color: #2d3748;
    }
    
    &.active {
      border: none;
      color: #3182ce;
      border-bottom: 2px solid #3182ce;
    }
  }
`;

const TabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    font-size: 1rem;
  }
`;

const DashboardStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    margin: 0;
    color: #4a5568;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    margin: 0.5rem 0 0;
    color: #2d3748;
  }
`;

const ActionButton = styled.button`
  background: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;

  &:hover {
    background: #3182ce;
  }
`;

const BlogsList = styled.div`
  margin-top: 2rem;
`;

const BlogCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default AdminDashboard; 