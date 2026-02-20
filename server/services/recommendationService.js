const { calculateSemanticSimilarity, getEmbeddings, cosineSimilarity } = require('./embeddingService');
const Problem = require('../models/Problem');

/**
 * Normalize skill strings for better matching
 * @param {string} skill - Skill to normalize
 * @returns {string} - Normalized skill
 */
const normalizeSkill = (skill) => {
    return String(skill).toLowerCase().replace(/[\s-_]/g, '');
};

/**
 * Calculate skill match percentage between two skill sets
 * @param {string[]} studentSkills - Student's skills
 * @param {string[]} requiredSkills - Required skills for a problem
 * @returns {Object} - Match result with percentage and matching skills
 */
const calculateSkillMatch = (studentSkills, requiredSkills) => {
    if (!Array.isArray(studentSkills) || !Array.isArray(requiredSkills)) {
        return { matchPercentage: 0, matchingSkills: [], feedback: "Invalid skill data" };
    }

    if (requiredSkills.length === 0) {
        return { matchPercentage: 100, matchingSkills: [], feedback: "No specific skills required" };
    }

    const normalizedStudentSkills = studentSkills.map(normalizeSkill);
    const normalizedRequiredSkills = requiredSkills.map(normalizeSkill);

    const matchingSkills = studentSkills.filter((skill, idx) =>
        normalizedRequiredSkills.some(normReq =>
            normalizedStudentSkills[idx] === normReq ||
            normalizedStudentSkills[idx].includes(normReq) ||
            normReq.includes(normalizedStudentSkills[idx])
        )
    );

    const matchPercentage = Math.round((matchingSkills.length / requiredSkills.length) * 100);

    let feedback = "Low match.";
    if (matchPercentage > 75) feedback = "Excellent match! You have most required skills.";
    else if (matchPercentage > 50) feedback = "Good match. You have the core skills.";
    else if (matchPercentage > 25) feedback = "Partial match. You might need to upskill.";

    return { matchPercentage, matchingSkills, feedback };
};

/**
 * Analyze solution viability using semantic embeddings
 * @param {string} solutionDescription - Solution description
 * @param {string} problemId - Problem ID
 * @returns {Promise<Object>} - Analysis result with viability score
 */
const analyzeSolutionViability = async (solutionDescription, problemId) => {
    if (!problemId) {
        throw new Error("Problem ID is required for comparison");
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new Error("Problem not found");
    }

    // Combine problem information into a comprehensive text
    const problemText = `${problem.title}. ${problem.description}. Required skills: ${problem.requiredSkills.join(', ')}`;

    try {
        // Calculate semantic similarity using embeddings
        const similarity = await calculateSemanticSimilarity(solutionDescription, problemText);
        
        // Convert similarity (0-1) to percentage score
        // Handle NaN, null, undefined cases
        const viabilityScore = (similarity == null || isNaN(similarity)) ? 0 : Math.round(similarity * 100);

        // Determine sentiment and feedback based on score
        let sentiment, feedback, keyStrengths;

        if (viabilityScore > 75) {
            sentiment = "High Fit";
            feedback = "The solution demonstrates strong alignment with the problem requirements. Semantic analysis shows high contextual relevance.";
            keyStrengths = ["Strong semantic alignment", "Relevant technical context", "Clear problem understanding"];
        } else if (viabilityScore > 50) {
            sentiment = "Moderate Fit";
            feedback = "The solution shows reasonable alignment with the problem space. Consider expanding on specific technical approaches.";
            keyStrengths = ["Moderate contextual match", "Some relevant concepts", "Room for elaboration"];
        } else if (viabilityScore > 25) {
            sentiment = "Weak Fit";
            feedback = "The solution has limited alignment with the problem requirements. Consider addressing specific technical needs more directly.";
            keyStrengths = ["Basic concept overlap", "Needs technical depth", "Unclear relevance"];
        } else {
            sentiment = "Poor Fit";
            feedback = "The solution appears disconnected from the problem requirements. Review the problem statement and provide a more targeted approach.";
            keyStrengths = ["Minimal alignment", "Requires significant refinement", "Missing key concepts"];
        }

        return {
            viabilityScore,
            sentiment,
            analysisSummary: `Semantic Compatibility: ${viabilityScore}%. ${feedback}`,
            keyStrengths,
            method: "AI Embeddings (all-MiniLM-L6-v2)"
        };

    } catch (embeddingError) {
        console.warn("Embedding API failed, falling back to keyword matching:", embeddingError.message);
        
        // Fallback to keyword-based analysis if embedding fails
        return analyzeSolutionFallback(solutionDescription, problem);
    }
};

/**
 * Fallback keyword-based analysis when embeddings are unavailable
 * @param {string} description - Solution description
 * @param {Object} problem - Problem object
 * @returns {Object} - Analysis result
 */
const analyzeSolutionFallback = (description, problem) => {
    const solutionWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const problemWords = [
        ...problem.title.toLowerCase().split(/\s+/),
        ...problem.description.toLowerCase().split(/\s+/),
        ...problem.requiredSkills.map(s => s.toLowerCase())
    ].filter(w => w.length > 3);

    const matchingWords = solutionWords.filter(word =>
        problemWords.some(pw => pw.includes(word) || word.includes(pw))
    );

    const uniqueProblemWords = [...new Set(problemWords)];
    const overlapRatio = uniqueProblemWords.length > 0
        ? matchingWords.length / uniqueProblemWords.length
        : 0;

    const score = Math.min(Math.round(overlapRatio * 100), 100);

    let sentiment = "Neutral";
    let feedback = "relevance is moderate.";

    if (score > 75) {
        sentiment = "High Fit";
        feedback = "The solution appears strongly aligned with the problem requirements.";
    } else if (score > 50) {
        sentiment = "Moderate Fit";
        feedback = "The solution has some overlap with the problem space.";
    } else {
        sentiment = "Low Fit";
        feedback = "The solution description may need more specific details related to the problem.";
    }

    return {
        viabilityScore: score,
        sentiment,
        analysisSummary: `Keyword Compatibility: ${score}%. ${feedback}`,
        keyStrengths: matchingWords.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1)),
        method: "Fallback Keyword Matching"
    };
};

/**
 * Generate problem recommendations for a student using hybrid approach
 * @param {Object} student - Student user object
 * @returns {Promise<Array>} - Array of recommended problems with scores
 */
const generateRecommendations = async (student) => {
    const problems = await Problem.find({ status: 'open' });

    if (!problems || problems.length === 0) {
        return [];
    }

    const studentSkills = Array.isArray(student.profile?.skills) ? student.profile.skills : [];
    const studentBio = (student.profile?.bio || '').toLowerCase();

    if (studentSkills.length === 0 && !studentBio) {
        return [];
    }

    const normalizedStudentSkills = studentSkills.map(normalizeSkill);
    const recommendations = [];

    for (const problem of problems) {
        const requiredSkills = Array.isArray(problem.requiredSkills) ? problem.requiredSkills : [];
        const normalizedRequiredSkills = requiredSkills.map(normalizeSkill);

        let totalScore = 0;
        const scoreBreakdown = {};

        // 1. SKILL MATCHING (40% weight)
        const matchingSkills = studentSkills.filter((skill, idx) =>
            normalizedRequiredSkills.some(normReq =>
                normalizedStudentSkills[idx] === normReq ||
                normalizedStudentSkills[idx].includes(normReq) ||
                normReq.includes(normalizedStudentSkills[idx])
            )
        );

        const skillMatchScore = requiredSkills.length > 0
            ? (matchingSkills.length / requiredSkills.length) * 40
            : 0;
        scoreBreakdown.skillMatch = Math.round(skillMatchScore);
        totalScore += skillMatchScore;

        // 2. BIO KEYWORD MATCHING (25% weight)
        const problemText = `${problem.title} ${problem.description}`.toLowerCase();
        const problemKeywords = [...new Set(
            [...problemText.split(/\s+/), ...requiredSkills.map(s => String(s).toLowerCase())]
                .filter(word => word.length > 3)
        )];

        const bioMatches = problemKeywords.filter(keyword =>
            studentBio.includes(keyword) ||
            studentSkills.some(skill => normalizeSkill(skill).includes(normalizeSkill(keyword)))
        ).length;

        const bioScore = problemKeywords.length > 0
            ? (bioMatches / problemKeywords.length) * 25
            : 0;
        scoreBreakdown.bioRelevance = Math.round(bioScore);
        totalScore += bioScore;

        // 3. SKILL DIVERSITY BONUS (15% weight)
        const diversityScore = studentSkills.length > 0
            ? (matchingSkills.length / studentSkills.length) * 15
            : 0;
        scoreBreakdown.skillDiversity = Math.round(diversityScore);
        totalScore += diversityScore;

        // 4. PROBLEM COMPLEXITY MATCH (10% weight)
        const complexityScore = requiredSkills.length > 0 && studentSkills.length > 0
            ? Math.min((studentSkills.length / requiredSkills.length), 1) * 10
            : 0;
        scoreBreakdown.complexityMatch = Math.round(complexityScore);
        totalScore += complexityScore;

        // 5. FRESHNESS BONUS (10% weight)
        const problemAge = Date.now() - new Date(problem.createdAt).getTime();
        const daysOld = problemAge / (1000 * 60 * 60 * 24);
        const freshnessScore = Math.max(0, (30 - daysOld) / 30) * 10;
        scoreBreakdown.freshness = Math.round(freshnessScore);
        totalScore += freshnessScore;

        const finalScore = Math.min(Math.round(totalScore), 100);

        if (finalScore > 10) { // Only include recommendations above 10% threshold
            recommendations.push({
                problem,
                score: finalScore,
                breakdown: scoreBreakdown,
                matchingSkills
            });
        }
    }

    // Sort by score and return top 5
    return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

module.exports = {
    calculateSkillMatch,
    analyzeSolutionViability,
    generateRecommendations,
    normalizeSkill
};
