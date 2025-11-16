const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// create event
router.post('/', async (req, res) => {
  try {
    const { title, start, end, ownerId } = req.body;
    if(!title || !start || !end || !ownerId) return res.status(400).json({ error: 'missing_fields' });
    const ev = await Event.create({ title, start, end, status: 'BUSY', ownerId });
    req.io.emit('eventsUpdated');
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// list events (all)
router.get('/', async (req, res) => {
  try {
    const ev = await Event.find({}).sort({ start: 1 }).lean();
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// toggle status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ev = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    req.io.emit('eventsUpdated');
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// delete
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    req.io.emit('eventsUpdated');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
