const express = require('express');
const Event = require('../../Level-3/models/Event');
const Registration = require('../../Level-3/models/Registration');
const User = require('../../Level-3/models/User');
const { requireAdmin } = require('../../Level-2/middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAdmin, async (req, res) => {
  const [eventCount, registrationCount, userCount, recentEvents] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments(),
    User.countDocuments(),
    Event.find().sort({ createdAt: -1 }).limit(5)
  ]);

  res.render('dashboard', {
    eventCount,
    registrationCount,
    userCount,
    recentEvents
  });
});

module.exports = router;
