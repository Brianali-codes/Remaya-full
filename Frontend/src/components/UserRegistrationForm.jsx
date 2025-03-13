import React, { useState } from 'react';
import styled from 'styled-components';

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    profileImage: null,
    amountAllocated: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');

  // Generate random 6-character ID
  const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentId = generateId();
    
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('school', formData.school);
    formDataToSend.append('studentId', studentId);
    formDataToSend.append('amountAllocated', formData.amountAllocated);
    formDataToSend.append('profileImage', formData.profileImage);

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to register student');
      
      // Reset form
      setFormData({
        fullName: '',
        school: '',
        profileImage: null,
        amountAllocated: ''
      });
      setPreviewUrl('');
      alert('Student registered successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to register student');
    }
  };

  return (
    <FormContainer>
      <h2>Register New Student</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Full Name:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>School:</label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => setFormData({...formData, school: e.target.value})}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Amount Allocated (KES):</label>
          <input
            type="number"
            value={formData.amountAllocated}
            onChange={(e) => setFormData({...formData, amountAllocated: e.target.value})}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Profile Picture:</label>
          <ImageUploadContainer>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {previewUrl && (
              <PreviewImage src={previewUrl} alt="Preview" />
            )}
          </ImageUploadContainer>
        </FormGroup>

        <SubmitButton type="submit">Register Student</SubmitButton>
      </form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h2 {
    margin-bottom: 2rem;
    color: #2d3748;
  }
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
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66,153,225,0.1);
    }
  }
`;

const ImageUploadContainer = styled.div`
  margin-top: 0.5rem;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  margin-top: 1rem;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  background: #4299e1;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #3182ce;
  }
`;

export default UserRegistrationForm; 