const express = require('express');
const Event = require('../../Level-3/models/Event');
const Registration = require('../../Level-3/models/Registration');
const { requireAdmin, requireUser } = require('../middleware/auth');

const router = express.Router();

function hasEventFields(body) {
  return body.title && body.date && body.location && body.description;
}

router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.render('index', { events });
});

router.get('/events', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.render('events', { events });
});

router.get('/add-event', requireAdmin, (req, res) => {
  res.render('add-event');
});

router.post('/add-event', requireAdmin, async (req, res) => {
  if (!hasEventFields(req.body)) {
    return res.status(400).send('Title, date, location, and description are required.');
  }

  await Event.create(req.body);
  res.redirect('/events');
});

router.get('/edit-event/:id', requireAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.render('edit-event', { event });
});

router.post('/edit-event/:id', requireAdmin, async (req, res) => {
  const { title, date, location, description } = req.body;

  if (!hasEventFields(req.body)) {
    return res.status(400).send('Title, date, location, and description are required.');
  }

  await Event.findByIdAndUpdate(
    req.params.id,
    { title, date, location, description },
    { runValidators: true }
  );

  res.redirect('/events');
});

router.post('/delete-event/:id', requireAdmin, async (req, res) => {
  await Registration.deleteMany({ eventId: req.params.id });
  await Event.findByIdAndDelete(req.params.id);
  res.redirect('/events');
});

router.get('/register/:id', requireUser, async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.render('register', { event, success: false, error: null });
});

router.post('/register/:id', requireUser, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!req.body.phone) {
    return res.render('register', { event, success: false, error: 'Phone is required.' });
  }

  await Registration.create({
    eventId: req.params.id,
    userId: req.currentUser._id,
    name: req.currentUser.name,
    email: req.currentUser.email,
    phone: req.body.phone
  });

  res.render('register', { event, success: true, error: null });
});

module.exports = router;
