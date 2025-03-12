import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import RichTextEditor from './RichTextEditor';

const BlogFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isAdmin, adminToken }) => {
  if (!isOpen) return null;

  // Local state to handle input changes
  const [localFormData, setLocalFormData] = useState({
    title: formData.title || '',
    imageUrl: formData.imageUrl || '',
    previewUrl: '',
    twitterHandle: formData.twitterHandle || '',
    linkedinHandle: formData.linkedinHandle || '',
    content: formData.content || ''
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.imageUrl; // Match backend response

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setLocalFormData(prev => ({
        ...prev,
        imageUrl: imageUrl,
        previewUrl: previewUrl // Add preview URL
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!localFormData.title || !localFormData.content) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const token = isAdmin ? adminToken : localStorage.getItem('token');

      if (!token) {
        alert(`Please sign in to create a blog`);
        return;
      }

      console.log('Creating blog with token:', token); // Debug log

      const response = await fetch('http://localhost:5000/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...localFormData,
          imageUrl: localFormData.imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      const data = await response.json();

      // Reset form and close modal
      setLocalFormData({
        title: '',
        content: '',
        imageUrl: '',
        previewUrl: '',
        twitterHandle: '',
        linkedinHandle: ''
      });
      onClose();
      if (typeof onSubmit === 'function') {
        onSubmit();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      if (error.message.includes('expired')) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please sign in again.');
        window.location.href = '/signin';
      } else {
        alert(error.message || 'Failed to create blog. Please try again.');
      }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Blog</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={localFormData.title}
              onChange={handleChange}
              placeholder="Enter your blog title"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              {(localFormData.imageUrl || localFormData.previewUrl) && (
                <div className="relative">
                  <img
                    src={localFormData.previewUrl || localFormData.imageUrl}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setLocalFormData(prev => ({ ...prev, imageUrl: '', previewUrl: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Handle
              </label>
              <input
                id="twitterHandle"
                type="text"
                name="twitterHandle"
                value={localFormData.twitterHandle}
                onChange={handleChange}
                placeholder="@username"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="linkedinHandle" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Handle
              </label>
              <input
                id="linkedinHandle"
                type="text"
                name="linkedinHandle"
                value={localFormData.linkedinHandle}
                onChange={handleChange}
                placeholder="username"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={localFormData.content}
              onChange={(content) => handleChange({ target: { name: 'content', value: content }})}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogFormModal; 