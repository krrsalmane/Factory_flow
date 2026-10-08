const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ api: 'ok', database: states[mongoose.connection.readyState] });
});

module.exports = app;