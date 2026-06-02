const express = require('express');
const User = require('../../Level-3/models/User');
const { clearAuthCookie, setAuthCookie } = require('../middleware/auth');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', { error: 'All fields are required.' });
  }

  if (!isValidEmail(email)) {
    return res.render('signup', { error: 'Enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters long.' });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.render('signup', { error: 'Email is already registered.' });
  }

  const userCount = await User.countDocuments();
  const user = new User({
    name,
    email,
    role: userCount === 0 ? 'admin' : 'user'
  });

  user.setPassword(password);
  await user.save();
  setAuthCookie(res, user._id);

  return res.redirect('/events');
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || !isValidEmail(email)) {
    return res.render('login', { error: 'Enter a valid email and password.' });
  }

  const user = await User.findOne({ email });

  if (!user || !user.validatePassword(password)) {
    return res.render('login', { error: 'Invalid email or password.' });
  }

  setAuthCookie(res, user._id);
  return res.redirect('/events');
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/');
});

module.exports = router;
