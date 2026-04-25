const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { startKeepAlive } = require('./utils/keepAlive');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
    'http://localhost:5173',           // Local development
    'http://localhost:3000',           // Alternative local port
    'https://connectentrepreneur.vercel.app', // Production frontend
    process.env.CLIENT_URL             // From environment variable (if set)
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Middleware
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));
}

// Routes (Placeholders for now)
const problemRoutes = require('./routes/problemRoutes');
console.log('Problem Routes Type:', typeof problemRoutes);
console.log('Problem Routes Stack:', problemRoutes.stack ? problemRoutes.stack.length : 'Not a router');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', require('./routes/solutionRoutes'));

console.log('Loading AI Routes...');
const aiRoutes = require('./routes/aiRoutes');
console.log('AI Routes loaded, type:', typeof aiRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/test', (req, res) => res.send('API Test Working'));
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date() }));

app.get('/', (req, res) => {
    res.send('CAMPUS CONNECT API is running...');
});

// 404 Handler
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route not found: ${req.url}` });
});

if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Routes loaded and server ready.');
        console.log('AI Controller configured with new HF Router API.');
        
        // Start keep-alive service in production to prevent Render spin-down
        if (process.env.NODE_ENV === 'production') {
            console.log('[Keep-Alive] Starting keep-alive service for 24/7 uptime...');
            startKeepAlive(`http://localhost:${PORT}/health`);
        }
    });
}

module.exports = app;