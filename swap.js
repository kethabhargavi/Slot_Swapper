const express = require('express');
const Swap = require('../models/Swap');
const Event = require('../models/Event');
const router = express.Router();

// create swap request
router.post('/', async (req, res) => {
  try {
    const { requesterId, myEventId, theirEventId } = req.body;
    if(!requesterId || !myEventId || !theirEventId) return res.status(400).json({ error: 'missing_fields' });

    const s = await Swap.create({ requesterId, myEventId, theirEventId });
    await Event.findByIdAndUpdate(myEventId, { status: 'SWAP_PENDING' });
    await Event.findByIdAndUpdate(theirEventId, { status: 'SWAP_PENDING' });

    req.io.emit('swapsUpdated');
    req.io.emit('eventsUpdated');
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// respond to swap (accept/reject)
router.post('/:id/respond', async (req, res) => {
  try {
    const { accept } = req.body;
    const s = await Swap.findById(req.params.id).lean();
    if(!s) return res.status(404).json({ error: 'not_found' });

    if(accept) {
      const myEv = await Event.findById(s.myEventId);
      const theirEv = await Event.findById(s.theirEventId);
      const a = myEv.ownerId;
      myEv.ownerId = theirEv.ownerId;
      theirEv.ownerId = a;
      myEv.status = 'BUSY';
      theirEv.status = 'BUSY';
      await myEv.save();
      await theirEv.save();
      await Swap.findByIdAndUpdate(s._id, { status: 'ACCEPTED' });
    } else {
      await Event.findByIdAndUpdate(s.myEventId, { status: 'SWAPPABLE' });
      await Event.findByIdAndUpdate(s.theirEventId, { status: 'SWAPPABLE' });
      await Swap.findByIdAndUpdate(s._id, { status: 'REJECTED' });
    }

    req.io.emit('swapsUpdated');
    req.io.emit('eventsUpdated');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// list swaps
router.get('/', async (req, res) => {
  try {
    const all = await Swap.find({}).lean();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
