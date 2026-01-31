// Simulated AI Controller
// In a real production app, this would call OpenAI, Claude, or a local Python ML service

const analyzeText = (text) => {
    // Simple heuristic analysis for demo purposes
    const score = Math.floor(Math.random() * (95 - 60) + 60); // Random score between 60-95

    const buzzwords = ['scalable', 'ai', 'blockchain', 'secure', 'optimized', 'cloud', 'data', 'efficient', 'innovative'];
    const foundKeywords = buzzwords.filter(word => text.toLowerCase().includes(word));

    let sentiment = "Neutral";
    if (score > 85) sentiment = "Highly Positive";
    else if (score > 70) sentiment = "Positive";
    else sentiment = "Moderate";

    return {
        viabilityScore: score,
        sentiment,
        keyStrengths: foundKeywords.length > 0 ? foundKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)) : ['Clarity', 'Feasibility'],
        analysisSummary: `The proposed solution demonstrates ${sentiment.toLowerCase()} potential. It addresses the core problem with a viability score of ${score}/100. The approach appears technically sound${foundKeywords.length > 0 ? `, leveraging key technologies like ${foundKeywords.join(', ')}` : '.'}. Recommended for further technical review.`
    };
};

exports.analyzeSolution = async (req, res) => {
    try {
        const { description } = req.body;

        // Simulate AI processing delay
        setTimeout(() => {
            const analysis = analyzeText(description);
            res.json(analysis);
        }, 1500);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.matchSkills = async (req, res) => {
    // API to match a student's skills against a problem
    // This could also be "AI" powered
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
