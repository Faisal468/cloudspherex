// Base API URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api' // In production, use relative path
  : 'http://localhost:5000/api'; // In development, use full URL

import { API_ENDPOINTS } from '../config/api';

export const API_ENDPOINTS = {
  CONTACT: `${API_BASE_URL}/contact`,
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
};

// Update this line to match your actual ADMIN_API_KEY value
localStorage.setItem('adminApiKey', 'caaa8189011276110d2d14fe9400004706b8dc92140500db0eacac04bb81a53c');

// Add this after your MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB is connected');
  
  // Test query
  mongoose.connection.db.admin().ping((err, result) => {
    if (err) {
      console.error('MongoDB ping failed:', err);
    } else {
      console.log('MongoDB ping successful:', result);
    }
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Update your CORS configuration
app.use(cors({
  origin: ['https://cloudspherex.org', 'http://localhost:3000'], // Add your domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'x-api-key']
}));

const response = await axios.get(API_ENDPOINTS.CONTACT, {
  // Your existing code here
});
