const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes (Placeholders for now)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/solutions', require('./routes/solutionRoutes'));

app.get('/', (req, res) => {
    res.send('CAMPUS CONNECT API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
