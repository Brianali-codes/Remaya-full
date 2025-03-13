require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js'); // Import Supabase client
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' // Allow frontend development server
}));

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.SUPABASE_ANON_KEY);

console.log("Environment variables loaded:");
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("ADMIN_PASSWORD is set:", !!process.env.ADMIN_PASSWORD);

console.log("Environment variables after loading:");
console.log({
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  JWT_SECRET: process.env.JWT_SECRET,
  HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'remaya_secret_key_2024', (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ message: 'Token has expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      };
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Configure multer for profile images
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create user in Supabase Auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Sign Up Error:", signUpError);
      return res.status(400).json({ message: signUpError.message });
    }

    // Create a profile for the user immediately after signup
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: user.id,
          email: user.email,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

    if (profileError) {
      console.error("Profile Creation Error:", profileError);
      // Don't return error - user is still created
    }

    res.json({ 
      message: "Signup successful",
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data.session) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email,
        role: 'user'
      },
      process.env.JWT_SECRET || 'remaya_secret_key_2024', // Fallback secret
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful", 
      token: token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Route to Post Announcements/Blogs
app.post("/api/admin/announcements", async (req, res) => {
  try {
    const { title, content } = req.body;

    // Insert the announcement/blog into the database
    const { data, error } = await supabase
      .from('announcements') // Assuming you have an 'announcements' table
      .insert([{ title, content }]);

    if (error) {
      console.error("Error inserting announcement:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Announcement/Blog posted successfully!", data });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Check User Route
app.post("/api/check-user", async (req, res) => {
  const { email } = req.body;

  const { data: existingUser, error } = await supabase
    .from('remaya') // This might be the issue
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error checking user existence:", error);
    return res.status(400).json({ message: "Error checking user existence." });
  }

  if (existingUser) {
    return res.status(200).json({ exists: true }); // User exists
  }

  return res.status(404).json({ exists: false }); // User does not exist
});

// Admin Sign-in Route
app.post("/api/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: 'admin',
        email: process.env.ADMIN_EMAIL,
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'remaya_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      email: process.env.ADMIN_EMAIL,
      isAdmin: true
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(500).json({ message: 'Error during admin sign in' });
  }
});

// Create Blog Post Route
app.post("/api/blogs", authenticateToken, async (req, res) => {
  try {
    const { title, content, imageUrl, twitterHandle, linkedinHandle, is_admin_post } = req.body;
    
    // Check if user is admin when trying to create admin post
    if (is_admin_post && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can create admin posts' });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content,
          image_url: imageUrl,
          user_id: userId,
          user_email: userEmail,
          twitter_handle: twitterHandle,
          linkedin_handle: linkedinHandle,
          is_admin_post: is_admin_post || false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog' });
  }
});

// Get all blogs route
app.get("/api/blogs", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// Get user's blogs route
app.get("/api/blogs/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    // For admin users, they might have a non-UUID id
    if (req.user.isAdmin) {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_admin_post', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    // For regular users
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Failed to fetch user blogs' });
  }
});

// Get public blogs
app.get("/api/blogs/public", async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select(`
        id,
        title,
        content,
        image_url,
        user_id,
        user_email,
        twitter_handle,
        linkedin_handle,
        created_at,
        updated_at,
        is_admin_post
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }

    res.json(blogs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Get Single Blog Route
app.get("/api/blogs/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .single();

    if (error) {
      console.error("Error fetching blog:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json(blog);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Blog Route
app.put("/api/blogs/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content } = req.body;

    const { data: blog, error } = await supabase
      .from('blogs')
      .update({ 
        title, 
        content,
        updated_at: new Date()
      })
      .eq('id', blogId)
      .select()
      .single();

    if (error) {
      console.error("Error updating blog:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Blog updated successfully!", blog });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Blog Route
app.delete("/api/blogs/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (error) {
      console.error("Error deleting blog:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Blog deleted successfully!" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this route to check if admin exists
app.get("/api/admin/check", async (req, res) => {
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(
      process.env.ADMIN_EMAIL
    );
    
    if (error) {
      console.error("Error checking admin:", error);
      return res.status(400).json({ exists: false, error: error.message });
    }
    
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Image upload endpoint
app.post("/api/upload", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Your image upload logic here
    // ... upload to cloud storage or save locally ...

    res.json({ url: req.file.path }); // or whatever URL you're returning
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        name,
        bio,
        updated_at: new Date()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({ 
      message: 'Profile updated successfully',
      data: { name, bio }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore not found error
      throw error;
    }

    res.json(data || { id: userId });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Profile image upload route
app.post('/api/users/profile-image', authenticateToken, profileUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const userId = req.user.id;

    // Update user's profile image in database
    const { error } = await supabase
      .from('profiles')
      .update({ profile_image: imageUrl })
      .eq('id', userId);

    if (error) throw error;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

// For password updates, we'll use Supabase's built-in functionality
app.put('/api/users/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Student registration route
app.post("/api/students", authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { fullName, school, studentId, amountAllocated } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          full_name: fullName,
          school,
          student_id: studentId,
          amount_allocated: amountAllocated,
          profile_image: profileImage,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Failed to register student' });
  }
});

// Create profiles directory if it doesn't exist
const profilesDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
