const request = require('supertest');
const app = require('../server');
const { analyzeSolutionViability, calculateSkillMatch, generateRecommendations } = require('../services/recommendationService');
const User = require('../models/User');

// Mock the service layer
jest.mock('../services/recommendationService');

// Mock User model
jest.mock('../models/User');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { userId: 'test-user-123', role: 'student' };
    next();
});

describe('AI Controller Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/ai/analyze-solution', () => {
        test('should analyze solution and return viability score', async () => {
            const mockAnalysis = {
                viabilityScore: 85,
                sentiment: 'High Fit',
                analysisSummary: 'Semantic Compatibility: 85%. Strong alignment.',
                keyStrengths: ['Strong semantic alignment', 'Relevant technical context'],
                method: 'AI Embeddings (all-MiniLM-L6-v2)'
            };

            analyzeSolutionViability.mockResolvedValue(mockAnalysis);

            const response = await request(app)
                .post('/api/ai/analyze-solution')
                .send({
                    description: 'I will build a React Native app with Firebase',
                    problemId: 'problem123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAnalysis);
            expect(analyzeSolutionViability).toHaveBeenCalledWith(
                'I will build a React Native app with Firebase',
                'problem123'
            );
        });

        test('should return 400 if description is missing', async () => {
            const response = await request(app)
                .post('/api/ai/analyze-solution')
                .send({
                    problemId: 'problem123'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('required');
        });

        test('should return 400 if problemId is missing', async () => {
            const response = await request(app)
                .post('/api/ai/analyze-solution')
                .send({
                    description: 'Some solution'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('required');
        });

        test('should return 500 if analysis fails', async () => {
            analyzeSolutionViability.mockRejectedValue(new Error('Analysis failed'));

            const response = await request(app)
                .post('/api/ai/analyze-solution')
                .send({
                    description: 'Some solution',
                    problemId: 'problem123'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('AI Analysis Failed');
        });
    });

    describe('POST /api/ai/match-skills', () => {
        test('should match skills and return percentage', async () => {
            const mockMatchResult = {
                matchPercentage: 75,
                matchingSkills: ['JavaScript', 'React'],
                feedback: 'Good match. You have the core skills.'
            };

            calculateSkillMatch.mockReturnValue(mockMatchResult);

            const response = await request(app)
                .post('/api/ai/match-skills')
                .send({
                    studentSkills: ['JavaScript', 'React', 'Python'],
                    problemSkills: ['JavaScript', 'React', 'Node.js']
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMatchResult);
            expect(calculateSkillMatch).toHaveBeenCalledWith(
                ['JavaScript', 'React', 'Python'],
                ['JavaScript', 'React', 'Node.js']
            );
        });

        test('should return 400 if studentSkills is not an array', async () => {
            const response = await request(app)
                .post('/api/ai/match-skills')
                .send({
                    studentSkills: 'not-an-array',
                    problemSkills: ['JavaScript']
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid skill data');
        });

        test('should return 400 if problemSkills is not an array', async () => {
            const response = await request(app)
                .post('/api/ai/match-skills')
                .send({
                    studentSkills: ['JavaScript'],
                    problemSkills: 'not-an-array'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid skill data');
        });

        test('should handle empty skill arrays', async () => {
            calculateSkillMatch.mockReturnValue({
                matchPercentage: 0,
                matchingSkills: [],
                feedback: 'Low match.'
            });

            const response = await request(app)
                .post('/api/ai/match-skills')
                .send({
                    studentSkills: [],
                    problemSkills: ['JavaScript']
                });

            expect(response.status).toBe(200);
            expect(response.body.matchPercentage).toBe(0);
        });
    });

    describe('GET /api/ai/recommendations', () => {
        test('should return personalized recommendations', async () => {
            const mockStudent = {
                userId: 'test-user-123',
                role: 'student',
                profile: {
                    skills: ['React Native', 'JavaScript'],
                    bio: 'Experienced mobile developer'
                }
            };

            const mockRecommendations = [
                {
                    problem: {
                        _id: 'problem1',
                        title: 'Build Mobile App',
                        description: 'Need a mobile app'
                    },
                    score: 85,
                    breakdown: {
                        skillMatch: 40,
                        bioRelevance: 20,
                        skillDiversity: 15,
                        complexityMatch: 10,
                        freshness: 0
                    },
                    matchingSkills: ['React Native', 'JavaScript']
                }
            ];

            User.findById.mockResolvedValue(mockStudent);
            generateRecommendations.mockResolvedValue(mockRecommendations);

            const response = await request(app)
                .get('/api/ai/recommendations');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRecommendations);
            expect(User.findById).toHaveBeenCalledWith('test-user-123');
            expect(generateRecommendations).toHaveBeenCalledWith(mockStudent);
        });

        test('should return empty array if student not found', async () => {
            User.findById.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/ai/recommendations');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('should return 500 if recommendation generation fails', async () => {
            const mockStudent = {
                userId: 'test-user-123',
                role: 'student',
                profile: {
                    skills: ['React Native', 'JavaScript'],
                    bio: 'Experienced mobile developer'
                }
            };

            User.findById.mockResolvedValue(mockStudent);
            generateRecommendations.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/ai/recommendations');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Recommendation Failed');
        });
    });
});
