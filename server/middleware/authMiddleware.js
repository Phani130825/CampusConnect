const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    console.log('[AUTH] Checking authentication for:', req.method, req.path);
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    console.log('[AUTH] Token found:', !!token);

    if (!token) {
        console.log('[AUTH] No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[AUTH] Token decoded successfully, user:', decoded.userId, 'role:', decoded.role);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('[AUTH] Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
