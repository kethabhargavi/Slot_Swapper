require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const swapsRoutes = require('./routes/swaps');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// attach io to req so routes can emit
app.use((req, res, next) => { req.io = io; next(); });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/swaps', swapsRoutes);

// optional: serve client static files if you will host client from server
// app.use(express.static(path.join(__dirname, '..', 'client')));

// Mongo connect
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slotswapper';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo connected'))
  .catch(err=> console.error('Mongo err', err));

// Socket.IO events
io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('join', (room) => {
    if(room) socket.join(room);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// start
const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log('Server listening on', PORT));
