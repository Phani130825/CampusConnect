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

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes (Placeholders for now)
const problemRoutes = require('./routes/problemRoutes');
console.log('Problem Routes Type:', typeof problemRoutes);
console.log('Problem Routes Stack:', problemRoutes.stack ? problemRoutes.stack.length : 'Not a router');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', require('./routes/solutionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/api/test', (req, res) => res.send('API Test Working'));

app.get('/', (req, res) => {
    res.send('CAMPUS CONNECT API is running...');
});

// 404 Handler
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route not found: ${req.url}` });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});