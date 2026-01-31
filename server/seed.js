const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Problem = require('./models/Problem');
const Solution = require('./models/Solution');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Problem.deleteMany({});
        await Solution.deleteMany({});
        console.log('Cleared database');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        // 1. Create Users
        const users = await User.insertMany([
            {
                name: "Rahul Sharma",
                email: "student@test.com",
                password,
                role: "student",
                profile: {
                    university: "KMIT",
                    skills: ["React", "Node.js", "Python"],
                    bio: "Full stack developer enthusiast"
                }
            },
            {
                name: "Priya Patel",
                email: "student2@test.com",
                password,
                role: "student",
                profile: {
                    university: "IIT Hyderabad",
                    skills: ["AI/ML", "Data Science", "Computer Vision"],
                    bio: "Passionate about AI solutions"
                }
            },
            {
                name: "Vikram Malhotra",
                email: "entrepreneur@test.com",
                password,
                role: "entrepreneur",
                profile: {
                    companyName: "TechNova Solutions",
                    industry: "Fintech",
                    bio: "Building the next gen payment gateway"
                }
            },
            {
                name: "Anjali Gupta",
                email: "entrepreneur2@test.com",
                password,
                role: "entrepreneur",
                profile: {
                    companyName: "HealthPlus",
                    industry: "Healthcare",
                    bio: "Revolutionizing remote diagnostics"
                }
            },
            {
                name: "Arjun Reddy",
                email: "investor@test.com",
                password,
                role: "investor",
                profile: {
                    investmentFocus: ["Fintech", "Healthcare", "AI"],
                    portfolio: "Reddy Capital Ventures",
                    bio: "Early stage angel investor"
                }
            }
        ]);

        const student1 = users[0];
        const student2 = users[1];
        const entrepreneur1 = users[2];
        const entrepreneur2 = users[3];
        const investor1 = users[4];

        // 2. Create Problems
        const problems = await Problem.insertMany([
            {
                title: "Secure Blockchain Payment Gateway",
                description: "We need a secure, decentralized payment gateway that supports multiple cryptocurrencies with low transaction fees. The system must be scalable and easy to integrate for e-commerce sites.",
                domain: "Fintech",
                requiredSkills: ["Blockchain", "Node.js", "Cryptography"],
                entrepreneur: entrepreneur1._id,
                status: "open"
            },
            {
                title: "AI-Powered Diagnostic Tool",
                description: "Looking for a computer vision solution that can analyze X-ray images to detect early signs of pneumonia. The model needs to run on edge devices with limited processing power.",
                domain: "Healthcare",
                requiredSkills: ["Python", "TensorFlow", "Computer Vision"],
                entrepreneur: entrepreneur2._id,
                status: "open"
            },
            {
                title: "Smart Inventory Management",
                description: "A cloud-based inventory system that predicts stock depletion using historical sales data and automatically alerts suppliers.",
                domain: "Retail Tech",
                requiredSkills: ["React", "Data Analysis", "Cloud"],
                entrepreneur: entrepreneur1._id,
                status: "open"
            }
        ]);

        // 3. Create Solutions
        const solutions = await Solution.insertMany([
            {
                problem: problems[1]._id, // AI Diagnostic
                student: student2._id,
                description: "I have developed a lightweight CNN model using MobileNet architecture that achieves 94% accuracy on the ChestX-ray14 dataset. It is optimized for mobile deployment using TensorFlow Lite.",
                documentLink: "https://example.com/project-report.pdf",
                prototypeLink: "https://github.com/priya/chest-xray-ai",
                status: "pending"
            },
            {
                problem: problems[0]._id, // Blockchain
                student: student1._id,
                description: "Proposed a Layer 2 solution on Ethereum to reduce gas fees. The prototype demonstrates a throughput of 1000 TPS.",
                documentLink: "https://example.com/whitepaper.pdf",
                prototypeLink: "https://github.com/rahul/eth-layer2",
                status: "shortlisted",
                entrepreneurFeedback: "Impressive throughput numbers. Would like to see security audit report."
            }
        ]);

        console.log('Database seeded successfully!');
        console.log('-----------------------------------');
        console.log('Credentials:');
        console.log('Student: student@test.com / password123');
        console.log('Entrepreneur: entrepreneur@test.com / password123');
        console.log('Investor: investor@test.com / password123');
        console.log('-----------------------------------');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
