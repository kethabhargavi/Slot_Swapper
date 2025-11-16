const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ error: 'email_exists' });
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, passwordHash: hash });
    // return safe user
    res.json({ user: { id: u._id, name: u.name, email: u.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// login (simple)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const u = await User.findOne({ email });
    if(!u) return res.status(400).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if(!ok) return res.status(400).json({ error: 'invalid_credentials' });
    res.json({ user: { id: u._id, name: u.name, email: u.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
