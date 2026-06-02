const express = require('express');
const Event = require('../../Level-3/models/Event');
const Registration = require('../../Level-3/models/Registration');
const { cachePage } = require('../middleware/cache');
const { requireAdmin, requireUser } = require('../middleware/auth');

const router = express.Router();

router.get('/events', cachePage(20), async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

router.post('/events', requireAdmin, async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

router.get('/events/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json(event);
});

router.put('/events/:id', requireAdmin, async (req, res) => {
  const { title, date, location, description, category, image } = req.body;
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { title, date, location, description, category, image },
    { new: true, runValidators: true }
  );

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json(event);
});

router.delete('/events/:id', requireAdmin, async (req, res) => {
  await Registration.deleteMany({ eventId: req.params.id });
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
});

router.post('/events/:id/register', requireUser, async (req, res) => {
  const registration = await Registration.create({
    eventId: req.params.id,
    userId: req.currentUser._id,
    name: req.currentUser.name,
    email: req.currentUser.email,
    phone: req.body.phone
  });

  res.status(201).json({ message: 'Registration successful', registration });
});

module.exports = router;
