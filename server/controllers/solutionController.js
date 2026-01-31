const Solution = require('../models/Solution');
const Problem = require('../models/Problem');

exports.createSolution = async (req, res) => {
    try {
        const { problemId, description, documentLink, prototypeLink } = req.body;

        // Check if problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        const solution = new Solution({
            problem: problemId,
            student: req.user.userId,
            description,
            documentLink,
            prototypeLink
        });

        await solution.save();
        res.status(201).json(solution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getSolutionsForProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        // Verify ownership (optional but good practice)
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        if (problem.entrepreneur.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const solutions = await Solution.find({ problem: problemId }).populate('student', 'name email profile');
        res.json(solutions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.forwardSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const { investorId, recommendationNote } = req.body;

        const solution = await Solution.findById(solutionId);
        if (!solution) return res.status(404).json({ message: 'Solution not found' });

        // TODO: Verify entrepreneur ownership of the problem associated with this solution

        solution.forwardedTo.push(investorId);
        solution.recommendationNote = recommendationNote;
        solution.status = 'forwarded';

        await solution.save();
        res.json(solution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getForwardedSolutions = async (req, res) => {
    try {
        // For investors
        const solutions = await Solution.find({ forwardedTo: req.user.userId })
            .populate('problem', 'title description domain')
            .populate('student', 'name profile')
            .sort({ submittedAt: -1 });

        res.json(solutions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
