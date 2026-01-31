const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    documentLink: String, // PDF or Doc link
    prototypeLink: String, // Github or deployed link

    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'forwarded'],
        default: 'pending',
    },

    entrepreneurFeedback: String,

    // Forwarding details
    forwardedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Investor
    }],
    recommendationNote: String,

    // Investor actions (simplified for now, could be a separate collection if complex)
    investorInterests: [{
        investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['interested', 'passed', 'scheduled_meeting'] },
        feedback: String,
        date: { type: Date, default: Date.now }
    }],

    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Solution', solutionSchema);
