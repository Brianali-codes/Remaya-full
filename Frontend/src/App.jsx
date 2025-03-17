import './App.css';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page from './pages';
import Location from './location';
import Projects from './projects';
import Mission from './mission';
import Quote from './quote';
import Contacts from './contacts';
import Donate from './pages/donate'; // Import the Donate page
import Support from './pages/support'; // Import the Support page
import DonateForm from './pages/donateform';
import CarouselGallery from './gallery';
import Menu2 from './menu2';
import Scroller from './scroller';
import LearnMore from './pages/learnMore';
import Blog from './blog';
import ScrollToTop from './scrollToTop';
import SignUp from './pages/signup';
import SignIn from './pages/signin';
import Dashboard from './pages/dashboard';
import AdminDashboard from './pages/adminDashboard';
import AdminSignIn from './pages/adminSignIn'; // Import the Admin Sign In page
import ProtectedRoute from './components/ProtectedRoute';
import BlogPage from './pages/BlogPage';
import UserDashboard from './pages/UserDashboard';
import BlogDetail from './pages/BlogDetail';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <Page />
            <Location />
            <Projects />
            <CarouselGallery/>
            <Quote />
            <Scroller/>
            <Mission />
            <Blog/>
            <Menu2/>
            <Contacts />
          </>
        } />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/support" element={<Support />} />
        <Route path="/donateform" element={<DonateForm/>} />
        <Route path="/learnMore" element={<LearnMore/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/signin" element={<SignIn />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />

        {/* User Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />

        <Route path="/blog/:id" element={<BlogDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
