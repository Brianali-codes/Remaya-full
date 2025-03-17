import React, { useState, useEffect } from 'react';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    amountAllocated: '',
    profileImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        headers: {
          ...supabaseHeaders,
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []); // Ensure students is always an array
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message);
      setStudents([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const adminToken = localStorage.getItem('adminToken');
      const studentId = generateStudentId();

      // Create student record
      const response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          school: formData.school,
          student_id: studentId,
          amount_allocated: formData.amountAllocated,
          profile_image: null // We'll handle image upload separately
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create student');
      }

      // Reset form and refresh list
      setFormData({
        fullName: '',
        school: '',
        amountAllocated: '',
        profileImage: null
      });
      fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/students?id=eq.${studentId}`,
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
        throw new Error('Failed to delete student');
      }

      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message);
    }
  };

  const generateStudentId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Student Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Student Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="School"
            value={formData.school}
            onChange={(e) => setFormData({...formData, school: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Amount Allocated"
            value={formData.amountAllocated}
            onChange={(e) => setFormData({...formData, amountAllocated: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="file"
            onChange={(e) => setFormData({...formData, profileImage: e.target.files[0]})}
            className="p-2 border rounded"
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Adding...' : 'Add Student'}
        </button>
      </form>

      {/* Students List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">ID</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">School</th>
              <th className="px-6 py-3 border-b">Amount</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 border-b">{student.student_id}</td>
                  <td className="px-6 py-4 border-b">{student.full_name}</td>
                  <td className="px-6 py-4 border-b">{student.school}</td>
                  <td className="px-6 py-4 border-b">${student.amount_allocated}</td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  {loading ? 'Loading students...' : 'No students found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement; 