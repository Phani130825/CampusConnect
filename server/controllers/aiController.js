const axios = require('axios');
const Problem = require('../models/Problem');

// Helper to compute cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

// HF Inference API URL
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2";

const getEmbeddings = async (texts) => {
    if (!process.env.HUGGING_FACE_TOKEN) {
        throw new Error("HUGGING_FACE_TOKEN is missing");
    }

    try {
        const response = await axios.post(
            HF_API_URL,
            { inputs: texts, options: { wait_for_model: true } },
            {
                headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("HF API Error:", error.response?.data || error.message);
        throw error;
    }
};

exports.analyzeSolution = async (req, res) => {
    try {
        console.log('[ANALYZE] Starting solution analysis');
        const { description, problemId } = req.body;

        if (!problemId) {
            console.log('[ANALYZE] Missing problemId');
            return res.status(400).json({ message: "Problem ID is required for comparison" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            console.log('[ANALYZE] Problem not found:', problemId);
            return res.status(404).json({ message: "Problem not found" });
        }

        console.log('[ANALYZE] Analyzing solution for problem:', problem.title);

        // Keyword-based analysis fallback
        const solutionWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const problemWords = [
            ...problem.title.toLowerCase().split(/\s+/),
            ...problem.description.toLowerCase().split(/\s+/),
            ...problem.requiredSkills.map(s => s.toLowerCase())
        ].filter(w => w.length > 3);

        // Calculate overlap
        const matchingWords = solutionWords.filter(word =>
            problemWords.some(pw => pw.includes(word) || word.includes(pw))
        );

        const uniqueProblemWords = [...new Set(problemWords)];
        const overlapRatio = uniqueProblemWords.length > 0
            ? matchingWords.length / uniqueProblemWords.length
            : 0;

        const score = Math.min(Math.round(overlapRatio * 100), 100);

        // Determine qualitative metrics based on score
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

        console.log('[ANALYZE] Analysis complete, score:', score);

        res.json({
            viabilityScore: score,
            sentiment,
            analysisSummary: `Compatibility: ${score}%. ${feedback}`,
            keyStrengths: matchingWords.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1))
        });

    } catch (err) {
        console.error('[ANALYZE] ERROR:', err);
        console.error('[ANALYZE] ERROR Stack:', err.stack);
        res.status(500).json({ message: 'AI Analysis Failed', error: err.message });
    }
};

exports.matchSkills = async (req, res) => {
    // Keep existing logic for now, or could use embeddings here too
    try {
        const { studentSkills, problemSkills } = req.body;
        const intersection = studentSkills.filter(skill =>
            problemSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
        );
        const matchPercentage = Math.round((intersection.length / problemSkills.length) * 100);

        let feedback = "Low match.";
        if (matchPercentage > 75) feedback = "Excellent match! You have most required skills.";
        else if (matchPercentage > 50) feedback = "Good match. You have the core skills.";
        else if (matchPercentage > 25) feedback = "Partial match. You might need to upskill.";

        // ... existing matchSkills ...
        res.json({ matchPercentage, feedback, matchingSkills: intersection });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.recommendProblems = async (req, res) => {
    console.log('[RECOMMENDATIONS] ========== START ==========');
    console.log('[RECOMMENDATIONS] Request user:', JSON.stringify(req.user));

    try {
        // Safety check 1: Verify user exists
        if (!req.user || !req.user.userId) {
            console.log('[RECOMMENDATIONS] ERROR: No user in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('[RECOMMENDATIONS] Fetching student with ID:', req.user.userId);

        // Safety check 2: Fetch student with error handling
        let student;
        try {
            student = await require('../models/User').findById(req.user.userId);
            console.log('[RECOMMENDATIONS] Student query result:', student ? 'Found' : 'Not found');
        } catch (dbError) {
            console.log('[RECOMMENDATIONS] Database error fetching student:', dbError.message);
            return res.status(500).json({ message: 'Database error', error: dbError.message });
        }

        if (!student) {
            console.log('[RECOMMENDATIONS] Student not found in database');
            return res.json([]);
        }

        console.log('[RECOMMENDATIONS] Student name:', student.name);
        console.log('[RECOMMENDATIONS] Student profile:', JSON.stringify(student.profile));

        // Safety check 3: Fetch problems with error handling
        let problems;
        try {
            problems = await Problem.find({ status: 'open' });
            console.log('[RECOMMENDATIONS] Problems found:', problems.length);
        } catch (dbError) {
            console.log('[RECOMMENDATIONS] Database error fetching problems:', dbError.message);
            return res.status(500).json({ message: 'Database error', error: dbError.message });
        }

        if (!problems || problems.length === 0) {
            console.log('[RECOMMENDATIONS] No open problems found');
            return res.json([]);
        }

        // Safety check 4: Extract profile data with safe defaults
        const studentSkills = Array.isArray(student.profile?.skills) ? student.profile.skills : [];
        const studentBio = (student.profile?.bio || '').toLowerCase();

        console.log('[RECOMMENDATIONS] Student skills array:', JSON.stringify(studentSkills));
        console.log('[RECOMMENDATIONS] Student bio length:', studentBio.length);

        // Normalize skills for better matching (handle variations like "Block Chain" vs "Blockchain")
        const normalizeSkill = (skill) => {
            return String(skill).toLowerCase().replace(/[\s-_]/g, '');
        };

        const normalizedStudentSkills = studentSkills.map(normalizeSkill);

        // Enhanced dynamic scoring algorithm
        const recommendations = [];

        for (let i = 0; i < problems.length; i++) {
            const problem = problems[i];

            try {
                let totalScore = 0;
                const scoreBreakdown = {};

                // Ensure requiredSkills is an array
                const requiredSkills = Array.isArray(problem.requiredSkills) ? problem.requiredSkills : [];
                const normalizedRequiredSkills = requiredSkills.map(normalizeSkill);

                // 1. SKILL MATCHING (40% weight) - Direct skill overlap with fuzzy matching
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

                // 2. BIO KEYWORD MATCHING (25% weight) - Semantic relevance
                const problemTitle = (problem.title || '').toLowerCase();
                const problemDesc = (problem.description || '').toLowerCase();
                const problemKeywords = [
                    ...problemTitle.split(/\s+/),
                    ...problemDesc.split(/\s+/),
                    ...requiredSkills.map(s => String(s).toLowerCase())
                ].filter(word => word.length > 3);

                const uniqueKeywords = [...new Set(problemKeywords)];
                const bioMatches = uniqueKeywords.filter(keyword =>
                    studentBio.includes(keyword) ||
                    studentSkills.some(skill => normalizeSkill(skill).includes(normalizeSkill(keyword)))
                ).length;

                const bioScore = uniqueKeywords.length > 0
                    ? (bioMatches / uniqueKeywords.length) * 25
                    : 0;
                scoreBreakdown.bioRelevance = Math.round(bioScore);
                totalScore += bioScore;

                // 3. SKILL DIVERSITY BONUS (15% weight) - Rewards problems that match student's diverse skillset
                const diversityScore = studentSkills.length > 0
                    ? (matchingSkills.length / studentSkills.length) * 15
                    : 0;
                scoreBreakdown.skillDiversity = Math.round(diversityScore);
                totalScore += diversityScore;

                // 4. PROBLEM COMPLEXITY MATCH (10% weight) - Based on number of required skills
                const complexityScore = requiredSkills.length > 0 && studentSkills.length > 0
                    ? Math.min((studentSkills.length / requiredSkills.length), 1) * 10
                    : 0;
                scoreBreakdown.complexityMatch = Math.round(complexityScore);
                totalScore += complexityScore;

                // 5. FRESHNESS BONUS (10% weight) - Newer problems get slight boost
                const problemAge = Date.now() - new Date(problem.createdAt).getTime();
                const daysOld = problemAge / (1000 * 60 * 60 * 24);
                const freshnessScore = Math.max(0, (30 - daysOld) / 30) * 10; // Decays over 30 days
                scoreBreakdown.freshness = Math.round(freshnessScore);
                totalScore += freshnessScore;

                const finalScore = Math.min(Math.round(totalScore), 100);

                console.log(`[RECOMMENDATIONS] Problem "${problem.title}" - Score: ${finalScore}, Breakdown:`, scoreBreakdown);

                recommendations.push({
                    problem,
                    score: finalScore,
                    breakdown: scoreBreakdown,
                    matchingSkills: matchingSkills
                });
            } catch (processError) {
                console.log('[RECOMMENDATIONS] Error processing problem', problem._id, ':', processError.message);
                // Continue with next problem
            }
        }

        console.log('[RECOMMENDATIONS] Processed', recommendations.length, 'recommendations');

        // Sort by score and filter - LOWERED threshold to 5
        const topRecommendations = recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Show top 5 instead of 3
            .filter(rec => rec.score > 5); // Very low threshold to show all relevant results

        console.log('[RECOMMENDATIONS] Returning', topRecommendations.length, 'top recommendations');
        console.log('[RECOMMENDATIONS] ========== SUCCESS ==========');

        return res.json(topRecommendations);

    } catch (err) {
        console.log('[RECOMMENDATIONS] ========== FATAL ERROR ==========');
        console.log('[RECOMMENDATIONS] Error name:', err.name);
        console.log('[RECOMMENDATIONS] Error message:', err.message);
        console.log('[RECOMMENDATIONS] Error stack:', err.stack);
        console.log('[RECOMMENDATIONS] ========================================');

        return res.status(500).json({
            message: 'Recommendation Failed',
            error: err.message,
            stack: err.stack
        });
    }
};
