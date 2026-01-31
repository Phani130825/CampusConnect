const Problem = require('../models/Problem');

exports.createProblem = async (req, res) => {
    try {
        const { title, description, domain, requiredSkills } = req.body;

        const problem = new Problem({
            title,
            description,
            domain,
            requiredSkills: requiredSkills.split(',').map(skill => skill.trim()),
            entrepreneur: req.user.userId
        });

        await problem.save();
        res.status(201).json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ status: 'open' }).populate('entrepreneur', 'name profile.companyName');
        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ entrepreneur: req.user.userId }).sort({ createdAt: -1 });
        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
