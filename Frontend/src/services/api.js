import { API_URL, SUPABASE_URL, supabaseHeaders } from '../config/config';

export const updateProfile = async (profileData) => {
  const userId = localStorage.getItem('userId');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: supabaseHeaders,
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
  const userId = localStorage.getItem('userId');
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
    {
      headers: supabaseHeaders
    }
  );
  const data = await response.json();
  return data[0];
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

export const deleteBlog = async (blogId) => {
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

  if (response.status !== 204) {
    throw new Error('Failed to delete blog');
  }

  return true;
}; 