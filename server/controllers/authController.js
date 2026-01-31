const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            profile
        });

        await user.save();

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        console.log('[LOGIN] Login attempt with body:', { email: req.body.email, hasPassword: !!req.body.password });

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('[LOGIN] Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        console.log('[LOGIN] User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('[LOGIN] User not found for email:', email);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('[LOGIN] Password match:', isMatch);

        if (!isMatch) {
            console.log('[LOGIN] Password mismatch for user:', email);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('[LOGIN] Token generated successfully for user:', user.email);

        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('[LOGIN] ERROR:', err);
        console.error('[LOGIN] ERROR Stack:', err.stack);
        res.status(500).send('Server Error');
    }
};

exports.getInvestors = async (req, res) => {
    try {
        const investors = await User.find({ role: 'investor' }).select('name profile');
        res.json(investors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

exports.updateProfile = async (req, res) => {
    try {
        const { skills, bio } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (skills) user.profile.skills = skills.split(',').map(s => s.trim());
        if (bio) user.profile.bio = bio;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
