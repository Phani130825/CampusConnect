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
const HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

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
        const { description, problemId } = req.body;

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required for comparison" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // Get embeddings for both texts
        // We compare the solution description against the Problem Title + Description for context
        const problemText = `${problem.title}. ${problem.description}`;
        const output = await getEmbeddings([description, problemText]);

        // HF Feature Extraction returns a list of arrays (embeddings)
        // If the model is not loaded, it might fail initially, but 'wait_for_model: true' helps.

        if (!Array.isArray(output) || output.length !== 2) {
            // Fallback for demo if API fails or token is invalid
            console.warn("Using heuristic fallback due to API issue");
            // ... existing heuristic logic could go here, but user asked for REAL implementation.
            // We will throw error to prompt user to fix token if that's the issue.
            if (output.error) throw new Error(output.error);
            throw new Error("Invalid response from AI Model");
        }

        const solutionVector = output[0];
        const problemVector = output[1];

        const similarity = cosineSimilarity(solutionVector, problemVector);
        // Normalize score to 0-100
        const score = Math.round(similarity * 100);

        // Determine qualitative metrics based on score
        let sentiment = "Neutral";
        let feedback = "relevance is moderate.";

        if (score > 75) {
            sentiment = "High Fit";
            feedback = "The solution appears strongly aligned with the problem requirements semantics.";
        } else if (score > 50) {
            sentiment = "Moderate Fit";
            feedback = "The solution has some semantic overlap with the problem space.";
        } else {
            sentiment = "Low Fit";
            feedback = "The solution description may need more specific details related to the problem.";
        }

        res.json({
            viabilityScore: score,
            sentiment,
            analysisSummary: `Semantic Compatibility: ${score}%. ${feedback}`,
            keyStrengths: ["Semantic Alignment", "Context Matching"] // Since this model doesn't do keyword extraction
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'AI Analysis Failed. Ensure valid HUGGING_FACE_TOKEN in .env' });
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

        res.json({ matchPercentage, feedback, matchingSkills: intersection });
    } catch (err) {
        res.status(500).send('Server Error');
    }
}
