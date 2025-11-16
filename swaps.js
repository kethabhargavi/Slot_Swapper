const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  myEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },   // offered by requester
  theirEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // requested target
  status: { type: String, enum: ['PENDING','ACCEPTED','REJECTED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Swap', swapSchema);
