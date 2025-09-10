const Contact = require('../models/Contact');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res, next) => {
  try {
    // Debug logging
    console.log("Contact form submission handler started");
    
    // CRITICAL: Initialize body as an empty object if undefined
    // This is the key fix for the "Cannot destructure property" error
    if (!req.body) {
      console.log("req.body is undefined, initializing as empty object");
      req.body = {};
    }
    
    console.log("Request body:", req.body);
    
    // Extract values without destructuring to avoid the error
    const fullName = req.body.fullName || '';
    const email = req.body.email || '';
    const company = req.body.company || '';
    const serviceInterested = req.body.serviceInterested || '';
    const projectDetails = req.body.projectDetails || '';
    
    console.log("Extracted form data:", { 
      fullName, email, company, serviceInterested, projectDetails 
    });

    // Validate required fields
    if (!fullName || !email || !projectDetails) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and project details'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Create contact submission
    const contact = await Contact.create({
      fullName,
      email,
      company,
      serviceInterested,
      projectDetails
    });

    console.log("Contact created successfully:", contact._id);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: `Validation error: ${errors.join(', ')}`
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A submission with this email already exists'
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      error: 'There was an error submitting your message. Please try again.'
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (via API key)
exports.getContactSubmissions = async (req, res, next) => {
  try {
    // Check for API key in header
    const apiKey = req.header('x-api-key');
    
    // Verify API key matches the one in environment variables
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // Get all contact submissions, sorted by newest first
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching contact submissions:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving contact submissions'
    });
  }
};

// @desc    Update contact submission status
// @route   PUT /api/contact/:id
// @access  Private (via API key)
exports.updateContactStatus = async (req, res, next) => {
  try {
    // Check for API key in header
    const apiKey = req.header('x-api-key');
    
    // Verify API key matches the one in environment variables
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // Safely handle req.body
    if (!req.body) req.body = {};
    const status = req.body.status;

    // Validate status
    if (!status || !['new', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (new, in-progress, completed)'
      });
    }

    // Find and update the contact
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    console.error('Error updating contact status:', err);
    res.status(500).json({
      success: false,
      error: 'Error updating contact status'
    });
  }
};

// @desc    Delete a contact submission
// @route   DELETE /api/contact/:id
// @access  Private (via API key)
exports.deleteContactSubmission = async (req, res, next) => {
  try {
    // Check for API key in header
    const apiKey = req.header('x-api-key');
    
    // Verify API key matches the one in environment variables
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting contact submission:', err);
    res.status(500).json({
      success: false,
      error: 'Error deleting contact submission'
    });
  }
};