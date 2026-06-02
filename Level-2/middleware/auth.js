const jwt = require('jsonwebtoken');
const User = require('../../Level-3/models/User');

const COOKIE_NAME = 'event_auth';
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'event-management-local-secret';

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=');

    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join('='));
    }

    return cookies;
  }, {});
}

function createAuthToken(userId) {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '1d' });
}

function verifyAuthToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.userId;
  } catch (error) {
    return null;
  }
}

async function attachUser(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const userId = verifyAuthToken(cookies[COOKIE_NAME]);

  req.currentUser = null;
  res.locals.currentUser = null;

  if (userId) {
    req.currentUser = await User.findById(userId);
    res.locals.currentUser = req.currentUser;
  }

  next();
}

function setAuthCookie(res, userId) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(createAuthToken(userId))}; HttpOnly; Path=/; SameSite=Lax`
  );
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function requireLogin(req, res, next) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }

  if (req.currentUser.role !== 'admin') {
    return res.status(403).send('Only admins can manage events.');
  }

  return next();
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }

  if (req.currentUser.role !== 'user') {
    return res.status(403).send('Only users can register for events.');
  }

  return next();
}

module.exports = {
  attachUser,
  clearAuthCookie,
  requireAdmin,
  requireLogin,
  requireUser,
  setAuthCookie
};
