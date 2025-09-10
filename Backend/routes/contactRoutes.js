const express = require('express');
const {
  submitContactForm,
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission
} = require('../controllers/contactController');

const router = express.Router();

// Public route for submitting contact form
router.post('/', submitContactForm);

// Protected routes (using API key)
router.get('/', getContactSubmissions);
router.put('/:id', updateContactStatus);
router.delete('/:id', deleteContactSubmission);

// Catch-all for any undefined contact routes
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Contact API endpoint not found'
  });
});

module.exports = router;