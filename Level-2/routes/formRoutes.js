const express = require('express');
const { addContact } = require('../storage/tempStore');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/contact', (req, res) => {
  res.render('contact', { error: null, success: false });
});

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render('contact', { error: 'All fields are required.', success: false });
  }

  if (!isValidEmail(email)) {
    return res.render('contact', { error: 'Enter a valid email address.', success: false });
  }

  addContact({ name, email, message });
  return res.render('contact', { error: null, success: true });
});

module.exports = router;
