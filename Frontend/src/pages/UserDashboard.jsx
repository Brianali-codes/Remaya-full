import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import RichTextEditor from '../components/RichTextEditor';
import { useNavigate } from 'react-router-dom';
import { faArrowLeft, faUser, faBlog, faLock, faCog, faEdit, faTrash, faCamera } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tab, Tabs } from 'react-bootstrap';
import { updateProfileImage, updateProfile } from '../services/api';
import BlogFormModal from '../components/BlogFormModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';

const ProfileImageContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 3px solid #4299e1;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultProfileIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #718096;
`;

const UploadOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;

  .upload-label {
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    
    &:hover {
      text-decoration: underline;
    }
  }

  ${ProfileImageContainer}:hover & {
    opacity: 1;
  }
`;

const ProfileImageSection = styled.div`
  margin-bottom: 2rem;
`;

const UserDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: '',
    bio: '',
    email: localStorage.getItem('userEmail'),
    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${localStorage.getItem('userEmail')}`
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    bio: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    twitterHandle: '',
    linkedinHandle: ''
  });
  const [loadedImages, setLoadedImages] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/signin');
      return;
    }
    
    fetchUserBlogs();
    fetchUserProfile();
  }, [navigate]);

  // Fetch user's blogs
  const fetchUserBlogs = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs?user_id=eq.${userId}`, {
        headers: supabaseHeaders
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, 
        {
          headers: supabaseHeaders
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data[0]; // Supabase returns an array, we want the first item
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  // Handle content changes without creating a blog
  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');

      const blogData = {
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl,
        twitterHandle: formData.twitterHandle,
        linkedinHandle: formData.linkedinHandle,
        userId,
        userEmail
      };

      console.log('Submitting blog with data:', blogData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          ...blogData,
          user_id: localStorage.getItem('userId')
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        twitterHandle: '',
        linkedinHandle: ''
      });
      setIsEditing(false);
      fetchUserBlogs();
    } catch (error) {
      setError(error.message);
    }
  };

  // Update blog
  const handleUpdate = async (blogId) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://shxplstyxjippikogpwc.supabase.co/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingBlog),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setEditingBlog(null);
      setIsEditing(false);
      fetchUserBlogs();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blogs?id=eq.${blogId}`,
        {
          method: 'DELETE',
          headers: {
            ...supabaseHeaders,
            'Prefer': 'return=minimal'
          }
        }
      );

      if (response.status === 204) { // Supabase returns 204 for successful delete
        // Remove the deleted blog from state
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        alert('Blog deleted successfully');
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://shxplstyxjippikogpwc.supabase.co/api/users/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setProfileImage(data.imageUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.message === 'Password updated successfully') {
        // Clear form and show success message
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setError('');
        alert('Password updated successfully!');
      } else {
        setError(response.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://shxplstyxjippikogpwc.supabase.co/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: userProfile.name,
          bio: userProfile.bio
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleImageLoad = (blogId) => {
    setLoadedImages(prev => ({
      ...prev,
      [blogId]: true
    }));
  };

  const DashboardContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  `;

  const DashboardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a365d;
      margin: 0;
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

  const NewBlogButton = styled.button`
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }
  `;

  const DashboardTabs = styled.div`
    .nav-tabs {
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 2rem;
    }

    .nav-link {
      color: #4a5568;
      border: none;
      padding: 1rem 1.5rem;
      
      &:hover {
        border-color: transparent;
        color: #2d3748;
      }
      
      &.active {
        color: #3b82f6;
        border-bottom: 2px solid #3b82f6;
      }
    }
  `;

  const TabTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `;

  const ProfileSection = styled.div`
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `;

  const ProfileHeader = styled.div`
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
  `;

  const ProfileInfo = styled.div`
    flex: 1;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      color: #4a5568;
      margin-bottom: 0.5rem;
    }
  `;

  const SecuritySection = styled.div`
    max-width: 500px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `;

  const FormGroup = styled.div`
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  `;

  const SaveButton = styled.button`
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }
  `;

  const FileInputLabel = styled.label`
    cursor: pointer;
    display: inline-block;
  `;

  const FileInput = styled.input`
    display: none;
  `;

  const UploadButton = styled.button`
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    &:disabled {
      background: #93c5fd;
      cursor: not-allowed;
      transform: none;
    }
  `;

  const Label = styled.label`
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
  `;

  const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `;

  const TextArea = styled.textarea`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    resize: vertical;
    min-height: 100px;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `;

  const ProfileForm = styled.form`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `;

  const BlogGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
  `;

  const BlogCard = styled.div`
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15);
    }
  `;

  const BlogImage = styled.div`
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
    background-color: #f3f4f6;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }
  `;

  const BlogContent = styled.div`
    padding: 1.5rem;
  `;

  const BlogTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a365d;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;

  const BlogDate = styled.p`
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 1rem;
  `;

  const BlogExcerpt = styled.p`
    color: #4a5568;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;

  const CardButton = styled.button`
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #2563eb;
    }
  `;

  const AuthorSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  `;

  const AuthorInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `;

  const AuthorName = styled.span`
    font-weight: 500;
    color: #1a365d;
  `;

  const SocialLinks = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-left: auto;

    a {
      color: #64748b;
      transition: color 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }
  `;

  const BlogsSection = styled.div`
    padding: 2rem;
  `;

  const ErrorMessage = styled.p`
    color: #ef4444;
    margin-top: 0.5rem;
  `;

  const renderBlogList = () => {
    return blogs.map(blog => (
      <div key={blog.id}>
        <h3>{blog.title}</h3>
        <p>By: {blog.profiles?.email || 'Unknown Author'}</p>
        {/* rest of your blog display code */}
      </div>
    ));
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </BackButton>
          <h1>Dashboard</h1>
        </div>
      </DashboardHeader>

      <DashboardTabs>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="profile" title={
            <TabTitle>
              <FontAwesomeIcon icon={faUser} /> Profile
            </TabTitle>
          }>
            <ProfileSection>
              <ProfileHeader>
                <ProfileImageContainer>
                  {(profileImage || previewUrl) ? (
                    <ProfileImage src={previewUrl || profileImage} alt="Profile" />
                  ) : (
                    <DefaultProfileIcon>
                      <FontAwesomeIcon icon={faCamera} size="2x" />
                    </DefaultProfileIcon>
                  )}
                  <UploadOverlay>
                    <label htmlFor="profile-upload" className="upload-label">
                      {uploading ? 'Uploading...' : 'Change Photo'}
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                    </label>
                  </UploadOverlay>
                </ProfileImageContainer>
                
                {isEditingProfile ? (
                  <ProfileForm onSubmit={handleProfileSubmit}>
                    <FormGroup>
                      <Label>Name</Label>
                      <Input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Enter your name"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Bio</Label>
                      <TextArea
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile(prev => ({
                          ...prev,
                          bio: e.target.value
                        }))}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </FormGroup>
                    <ButtonGroup>
                      <SaveButton type="submit">Save Changes</SaveButton>
                      <CancelButton type="button" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </CancelButton>
                    </ButtonGroup>
                  </ProfileForm>
                ) : (
                  <ProfileInfo>
                    <h2>{userProfile.name || 'Your Name'}</h2>
                    <p>{userProfile.email}</p>
                    <p className="text-gray-600">{userProfile.bio || 'No bio added yet'}</p>
                    <EditProfileButton onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </EditProfileButton>
                  </ProfileInfo>
                )}
              </ProfileHeader>
            </ProfileSection>
          </Tab>

          <Tab eventKey="blogs" title={
            <TabTitle>
              <FontAwesomeIcon icon={faBlog} /> My Blogs
            </TabTitle>
          }>
            <BlogsSection>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Blogs</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create New Blog
                </button>
              </div>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <BlogGrid>
                {blogs.map((blog) => (
                  <BlogCard key={blog.id}>
                    <BlogImage>
                      {!loadedImages[blog.id] && <Skeleton height={200} />}
                      <img 
                        src={blog.image_url || 'https://via.placeholder.com/400x200'} 
                        alt={blog.title}
                        onLoad={() => handleImageLoad(blog.id)}
                        style={{ 
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          display: loadedImages[blog.id] ? 'block' : 'none'
                        }}
                      />
                    </BlogImage>
                    <BlogContent>
                      {loading ? (
                        <>
                          <Skeleton height={24} width="80%" style={{ marginBottom: '0.5rem' }} />
                          <Skeleton height={20} width="60%" style={{ marginBottom: '1rem' }} />
                          <Skeleton height={60} style={{ marginBottom: '1rem' }} />
                        </>
                      ) : (
                        <>
                          <BlogTitle>{blog.title}</BlogTitle>
                          <AuthorSection>
                            <AuthorInfo>
                              <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user_email}`}
                                alt="Author"
                                className="w-6 h-6 rounded-full"
                              />
                              <AuthorName>
                                {blog.user_email ? blog.user_email.split('@')[0] : 'Anonymous'}
                              </AuthorName>
                            </AuthorInfo>
                            <SocialLinks>
                              {blog.twitter_handle && (
                                <a 
                                  href={`https://twitter.com/${blog.twitter_handle}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <FontAwesomeIcon icon={faTwitter} />
                                </a>
                              )}
                              {blog.linkedin_handle && (
                                <a 
                                  href={`https://linkedin.com/in/${blog.linkedin_handle}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <FontAwesomeIcon icon={faLinkedin} />
                                </a>
                              )}
                            </SocialLinks>
                          </AuthorSection>
                          <BlogDate>
                            {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
                          </BlogDate>
                          <BlogExcerpt>
                            {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </BlogExcerpt>
                          <div className="flex justify-between items-center">
                            <CardButton onClick={() => navigate(`/blog/${blog.id}`)}>
                              Read More
                            </CardButton>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(blog)}
                                className="text-blue-500 hover:text-blue-600"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </BlogContent>
                  </BlogCard>
                ))}
              </BlogGrid>

              {blogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No blogs found. Create your first blog!</p>
                </div>
              )}
            </BlogsSection>
          </Tab>

          <Tab eventKey="security" title={
            <TabTitle>
              <FontAwesomeIcon icon={faLock} /> Security
            </TabTitle>
          }>
            <SecuritySection>
              <h2>Change Password</h2>
              <PasswordForm onSubmit={handlePasswordChange}>
                <FormGroup>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <label>New Password</label>
                  <input 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <label>Confirm New Password</label>
                  <input 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                  />
                </FormGroup>
                <SaveButton type="submit">Update Password</SaveButton>
              </PasswordForm>
            </SecuritySection>
          </Tab>
        </Tabs>
      </DashboardTabs>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationDialog>
          <div className="dialog-content">
            <h3>Create Blog</h3>
            <p>Are you sure you want to create this blog?</p>
            <ButtonGroup>
              <ConfirmButton onClick={handleSubmit}>
                Yes, Create Blog
              </ConfirmButton>
              <CancelButton 
                type="button" 
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </CancelButton>
            </ButtonGroup>
          </div>
        </ConfirmationDialog>
      )}

      {/* Add the modal */}
      <BlogFormModal 
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setFormData({
            title: '',
            content: '',
            imageUrl: '',
            twitterHandle: '',
            linkedinHandle: ''
          });
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    </DashboardContainer>
  );
};

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
`;

const SubmitButton = styled(Button)`
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
`;

const CancelButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  margin-top: 0.5rem;
`;

const ConfirmationDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .dialog-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    text-align: center;

    h3 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: #1a365d;
    }

    p {
      margin-bottom: 1.5rem;
      color: #4a5568;
    }
  }
`;

const ConfirmButton = styled(Button)`
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
`;

const EditProfileButton = styled.button`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
`;

const PasswordForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default UserDashboard; 