import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const isAdmin = localStorage.getItem('isAdmin');
  
  if (!adminToken || !isAdmin) {
    return <Navigate to="/admin/signin" replace />;
  }

  return children;
};

export default AdminProtectedRoute; 