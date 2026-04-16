// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./database');

// Importa le rotte
const recipesRoutes = require('./routes/recipes');
const restaurantsRoutes = require('./routes/restaurants');
const guidelinesRoutes = require('./routes/guidelines');
const marketplaceRoutes = require('./routes/marketplace');
const aiRoutes = require('./routes/aiService');
const voiceCommandRoutes = require('./routes/voiceCommand');
const blogRoutes = require('./routes/blog');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api/recipes', recipesRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/guidelines', guidelinesRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/voice', voiceCommandRoutes);
app.use('/api/blog', blogRoutes);

// Auth routes (signup/login via Supabase)
const { router: authRoutes } = require('./index');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Vireo – Smart Living, Green Future');
});

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);
  
  socket.on('new_reservation', async (data) => {
    io.emit('reservation_update', { restaurant_id: data.restaurant_id, status: 'new reservation' });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
