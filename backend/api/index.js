const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('EquipSense API is running...');
});

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/assets', require('../routes/assetRoutes'));
app.use('/api/issues', require('../routes/issueRoutes'));
app.use('/api/maintenance', require('../routes/maintenanceRoutes'));
app.use('/api/ai', require('../routes/aiRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;