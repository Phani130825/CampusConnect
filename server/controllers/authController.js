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
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
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
