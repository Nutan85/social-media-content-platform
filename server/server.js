require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Social Media Content Platform API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
