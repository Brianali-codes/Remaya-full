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

export const uploadProfileImage = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/profile-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Content-Type': file.type,
        },
        body: file
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return `${SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const uploadBlogImage = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Content-Type': file.type,
        },
        body: file
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}`;
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
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