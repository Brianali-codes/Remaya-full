import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBlog, faChartLine, faCog, faUsers, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import BlogFormModal from '../components/BlogFormModal';
import UserRegistrationForm from '../components/UserRegistrationForm';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';
import StudentManagement from '../components/StudentManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('blogs');
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
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
        headers: {
          ...supabaseHeaders,
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch blogs');
      setBlogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blogs?id=eq.${blogId}`,
        {
          method: 'DELETE',
          headers: {
            ...supabaseHeaders,
            'Authorization': `Bearer ${adminToken}`,
            'Prefer': 'return=minimal'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blog');
      }

      // Remove blog from state
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert(error.message || 'Failed to delete blog');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

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
          <div className="mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create New Blog
            </button>
          </div>
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
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </BlogCard>
              ))
            )}
          </BlogsList>
        </Tab>

        <Tab 
          eventKey="students" 
          title={
            <TabTitle>
              <FontAwesomeIcon icon={faUsers} />
              <span>Students</span>
            </TabTitle>
          }
        >
          <StudentManagement />
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
    </div>
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