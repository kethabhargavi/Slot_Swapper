const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  status: { type: String, default: 'BUSY' }, // BUSY | SWAPPABLE | SWAP_PENDING
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
