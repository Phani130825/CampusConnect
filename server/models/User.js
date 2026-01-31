const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'entrepreneur', 'investor'],
    required: true,
  },
  profile: {
    // Common fields
    bio: String,
    contactNumber: String,
    
    // Student specific
    skills: [String],
    university: String,
    resumeLink: String,
    
    // Entrepreneur specific
    companyName: String,
    industry: String,
    
    // Investor specific
    investmentFocus: [String], // Domains they invest in
    portfolio: String, // Link to portfolio
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
