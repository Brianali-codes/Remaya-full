import { API_URL, SUPABASE_URL, supabaseHeaders } from '../config/config';

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

export const updatePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/api/users/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(passwordData)
  });
  return response.json();
};

export const updateProfileImage = async (imageUrl) => {
  const response = await fetch(`${API_URL}/api/users/profile-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ imageUrl })
  });
  return response.json();
};

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_URL}/api/users/profile`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};

export const fetchBlogs = async () => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
    headers: supabaseHeaders
  });
  return response.json();
};

export const createBlog = async (blogData) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: JSON.stringify(blogData)
  });
  return response.json();
}; 