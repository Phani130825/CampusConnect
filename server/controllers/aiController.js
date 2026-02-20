const { analyzeSolutionViability, calculateSkillMatch, generateRecommendations } = require('../services/recommendationService');
const User = require('../models/User');

/**
 * Analyze solution viability against a problem using AI embeddings
 */
exports.analyzeSolution = async (req, res) => {
    try {
        const { description, problemId } = req.body;

        if (!description || !problemId) {
            return res.status(400).json({ 
                message: "Solution description and problem ID are required" 
            });
        }

        const analysis = await analyzeSolutionViability(description, problemId);
        res.json(analysis);

    } catch (err) {
        res.status(500).json({ 
            message: 'AI Analysis Failed', 
            error: err.message 
        });
    }
};

/**
 * Match student skills against problem requirements
 */
exports.matchSkills = async (req, res) => {
    try {
        const { studentSkills, problemSkills } = req.body;

        if (!Array.isArray(studentSkills) || !Array.isArray(problemSkills)) {
            return res.status(400).json({ message: "Invalid skill data format" });
        }

        const matchResult = calculateSkillMatch(studentSkills, problemSkills);
        res.json(matchResult);

    } catch (err) {
        res.status(500).json({ 
            message: 'Skill Matching Failed', 
            error: err.message 
        });
    }
};

/**
 * Generate personalized problem recommendations for students
 */
exports.recommendProblems = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const student = await User.findById(req.user.userId);
        
        if (!student) {
            return res.json([]);
        }

        const recommendations = await generateRecommendations(student);
        res.json(recommendations);

    } catch (err) {
        res.status(500).json({
            message: 'Recommendation Failed',
            error: err.message
        });
    }
};
