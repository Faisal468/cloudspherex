const express = require('express');
const router = express.Router();
const { 
  submitContactForm, 
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission
} = require('../controllers/contactController');

// Apply the special middleware only to the contact form submission route
router.post('/', submitContactForm);

// Other routes
router.get('/', getContactSubmissions);
router.put('/:id', updateContactStatus);
router.delete('/:id', deleteContactSubmission);

module.exports = router;