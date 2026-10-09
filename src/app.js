const express = require('express');
const mongoose = require('mongoose');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');






const app = express();
app.use(express.json());





app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ api: 'ok', database: states[mongoose.connection.readyState] });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/installation', require('./routes/installation.routes'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((req, res) => res.status(404).json({ status: 404, error: 'Route not found' }));
app.use(errorHandler); 


module.exports = app;
