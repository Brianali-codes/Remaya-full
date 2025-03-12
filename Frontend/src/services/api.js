export const updateProfile = async (profileData) => {
  const response = await fetch('http://localhost:5000/api/users/profile', {
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
  const response = await fetch('http://localhost:5000/api/users/password', {
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
  const response = await fetch('http://localhost:5000/api/users/profile-image', {
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
  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
}; 