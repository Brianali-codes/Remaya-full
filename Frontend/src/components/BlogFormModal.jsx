import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import RichTextEditor from './RichTextEditor';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';
import { uploadBlogImage } from '../services/api';

const BlogFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isAdmin }) => {
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
    try {
      const imageUrl = await uploadBlogImage(file);
      
      setLocalFormData(prev => ({
        ...prev,
        imageUrl,
        previewUrl: URL.createObjectURL(file)
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
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const adminToken = localStorage.getItem('adminToken');

      const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: localFormData.title,
          content: localFormData.content,
          image_url: localFormData.imageUrl || null,
          twitter_handle: localFormData.twitterHandle || null,
          linkedin_handle: localFormData.linkedinHandle || null,
          user_id: userId,
          user_email: userEmail,
          is_admin_post: isAdmin || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog');
      }

      onSubmit();
      onClose();
      setLocalFormData({
        title: '',
        content: '',
        imageUrl: '',
        twitterHandle: '',
        linkedinHandle: ''
      });
    } catch (error) {
      console.error('Error creating blog:', error);
      alert(error.message);
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-8 w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Blog</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Create New Blog Post</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={localFormData.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="h-96">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={localFormData.content}
              onChange={(content) => handleChange({ target: { name: 'content', value: content }})}
              className="h-full"
            />
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