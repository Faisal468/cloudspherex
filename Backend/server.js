const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS with specific options
app.use(cors({
  origin: ['https://cloudspherex.org', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'x-api-key']
}));

// Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Debug middleware to log request bodies
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/api/contact')) {
    console.log('Contact form request received:');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
  }
  next();
});

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

// Basic route
app.get("/api", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Admin dashboard route
app.get("/admin*", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Note: useNewUrlParser and useUnifiedTopology are no longer needed in newer mongoose versions
      // They're automatically set to true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Error handling middleware (should be after routes)
app.use(errorHandler);

// Catch-all route handler for API routes that don't exist
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API endpoint not found' 
  });
});

// Catch-all route handler for any other routes - serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to database before starting server
connectDB().then(() => {
  // Start Server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Admin dashboard available at: http://localhost:${PORT}/admin`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});