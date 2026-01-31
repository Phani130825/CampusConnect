const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    requiredSkills: [String],
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Problem', problemSchema);
