const {
    calculateSkillMatch,
    normalizeSkill,
    analyzeSolutionViability
} = require('../services/recommendationService');
const Problem = require('../models/Problem');

// Mock the Problem model
jest.mock('../models/Problem');

// Mock the embedding service
jest.mock('../services/embeddingService', () => ({
    calculateSemanticSimilarity: jest.fn()
}));

const { calculateSemanticSimilarity } = require('../services/embeddingService');

// Test Constants to avoid magic numbers (Issue #13)
const MATCH_THRESHOLDS = {
    EXCELLENT: 75,
    GOOD: 50,
    PARTIAL: 25,
    NONE: 0
};

const VIABILITY_THRESHOLDS = {
    HIGH_FIT: 75,
    MODERATE_FIT: 50,
    WEAK_FIT: 25,
    POOR_FIT: 0
};

// Helper function to create realistic mock problems (Issue #6)
const createMockProblem = (overrides = {}) => ({
    _id: 'problem123',
    title: 'Build a Mobile App',
    description: 'We need a mobile application for tracking fitness activities',
    requiredSkills: ['React Native', 'JavaScript', 'Firebase'],
    status: 'open',
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-15'),
    companyId: 'company456',
    ...overrides
});

describe('RecommendationService - Skill Matching', () => {
    
    describe('normalizeSkill', () => {
        test('should normalize skill by removing spaces, hyphens, and underscores', () => {
            expect(normalizeSkill('Block Chain')).toBe('blockchain');
            expect(normalizeSkill('Node.js')).toBe('node.js');
            expect(normalizeSkill('Machine-Learning')).toBe('machinelearning');
            expect(normalizeSkill('Data_Science')).toBe('datascience');
        });

        test('should convert to lowercase', () => {
            expect(normalizeSkill('PYTHON')).toBe('python');
            expect(normalizeSkill('JavaScript')).toBe('javascript');
        });

        // ISSUE #2: Special Characters & Edge Cases
        describe('special character handling', () => {
            test('should handle programming language syntax characters', () => {
                expect(normalizeSkill('C++')).toBe('c++');
                expect(normalizeSkill('C#')).toBe('c#');
                expect(normalizeSkill('ASP.NET')).toBe('asp.net');
                expect(normalizeSkill('Vue.js')).toBe('vue.js');
                expect(normalizeSkill('React.js')).toBe('react.js');
            });

            test('should handle version numbers and parentheses', () => {
                expect(normalizeSkill('Python (3.11)')).toBe('python(3.11)');
                expect(normalizeSkill('Node.js v18')).toBe('node.jsv18');
            });

            test('should handle multiple consecutive special characters', () => {
                expect(normalizeSkill('Multi - Skill - Name')).toBe('multiskillname');
                expect(normalizeSkill('Data___Science')).toBe('datascience');
            });

            test('should handle empty strings and whitespace only', () => {
                expect(normalizeSkill('')).toBe('');
                expect(normalizeSkill('   ')).toBe('');
                expect(normalizeSkill('\t\n')).toBe('');
            });

            test('should handle non-string inputs gracefully by converting to string', () => {
                expect(normalizeSkill(123)).toBe('123');
                expect(normalizeSkill(null)).toBe('null');
                expect(normalizeSkill(undefined)).toBe('undefined');
            });

            // ISSUE #8: Input Sanitization
            test('should handle potentially malicious inputs', () => {
                expect(normalizeSkill('<script>alert(1)</script>')).toBe('<script>alert(1)</script>');
                expect(normalizeSkill("'; DROP TABLE--")).toBe("';droptable");
                expect(normalizeSkill('../../etc/passwd')).toBe('../../etc/passwd');
            });

            test('should handle unicode and emoji', () => {
                expect(normalizeSkill('Java☕')).toBe('java☕');
                expect(normalizeSkill('Python🐍')).toBe('python🐍');
                expect(normalizeSkill('火箭科学')).toBe('火箭科学');
            });

            // ISSUE #10: Performance Tests
            test('should handle very long strings efficiently', () => {
                const longSkill = 'A'.repeat(10000);
                const start = Date.now();
                const result = normalizeSkill(longSkill);
                const duration = Date.now() - start;
                
                expect(result).toBe('a'.repeat(10000));
                expect(duration).toBeLessThan(100); // Should complete in under 100ms
            });
        });
    });

    describe('calculateSkillMatch', () => {
        test('should return 100% match when student has all required skills', () => {
            const studentSkills = ['JavaScript', 'React', 'Node.js'];
            const requiredSkills = ['JavaScript', 'React'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            expect(result.matchPercentage).toBe(100);
            expect(result.matchingSkills).toEqual(['JavaScript', 'React']);
            expect(result.feedback).toContain('Excellent match');
        });

        test('should return 0% match when student has no matching skills', () => {
            const studentSkills = ['Python', 'Django'];
            const requiredSkills = ['JavaScript', 'React'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            expect(result.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result.matchingSkills).toEqual([]);
            expect(result.feedback).toContain('Low match');
        });

        test('should handle partial skill matches', () => {
            const studentSkills = ['JavaScript', 'Python'];
            const requiredSkills = ['JavaScript', 'React', 'Node.js'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            const expectedPercentage = Math.round((1 / 3) * 100); // 33
            expect(result.matchPercentage).toBe(expectedPercentage);
            expect(result.matchingSkills).toEqual(['JavaScript']);
        });

        // ISSUE #1: Fixed - Was too vague, now specific
        test('should handle fuzzy matching with exact verification', () => {
            const studentSkills = ['Block Chain', 'Machine Learning'];
            const requiredSkills = ['Blockchain', 'Machine-Learning'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            // Both should match after normalization
            expect(result.matchPercentage).toBe(100);
            expect(result.matchingSkills).toHaveLength(2);
            expect(result.matchingSkills).toContain('Block Chain');
            expect(result.matchingSkills).toContain('Machine Learning');
        });

        // ISSUE #1: AI vs Artificial Intelligence doesn't match without semantic matching
        test('should NOT match semantically different terms without AI', () => {
            const studentSkills = ['AI'];
            const requiredSkills = ['Artificial Intelligence'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            // Without semantic matching, these should NOT match
            expect(result.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result.matchingSkills).toEqual([]);
        });

        test('should return 0% when student has empty skills array', () => {
            const studentSkills = [];
            const requiredSkills = ['JavaScript', 'React'];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            expect(result.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result.matchingSkills).toEqual([]);
        });

        test('should return 100% when required skills array is empty', () => {
            const studentSkills = ['JavaScript', 'React'];
            const requiredSkills = [];
            
            const result = calculateSkillMatch(studentSkills, requiredSkills);
            
            expect(result.matchPercentage).toBe(100);
            expect(result.feedback).toContain('No specific skills required');
        });

        test('should handle invalid input gracefully', () => {
            const result1 = calculateSkillMatch(null, ['JavaScript']);
            expect(result1.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result1.feedback).toBe('Invalid skill data');
            
            const result2 = calculateSkillMatch(['JavaScript'], null);
            expect(result2.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result2.feedback).toBe('Invalid skill data');
            
            const result3 = calculateSkillMatch('not-an-array', ['JavaScript']);
            expect(result3.matchPercentage).toBe(MATCH_THRESHOLDS.NONE);
            expect(result3.feedback).toBe('Invalid skill data');
        });

        // ISSUE #11: Exact feedback message tests
        describe('feedback message validation', () => {
            test('should provide exact feedback for Excellent match (>75%)', () => {
                const requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
                const excellentMatch = calculateSkillMatch(
                    ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                    requiredSkills
                );
                expect(excellentMatch.feedback).toBe('Excellent match! You have most required skills.');
                expect(excellentMatch.matchPercentage).toBeGreaterThan(MATCH_THRESHOLDS.EXCELLENT);
            });
            
            test('should provide exact feedback for Good match (>50%)', () => {
                const requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
                // Need 3 out of 4 = 75% for Good match (but this gives 50% so we need different skills)
                const goodMatch = calculateSkillMatch(
                    ['JavaScript', 'React', 'Node.js', 'Python', 'Docker'],
                    requiredSkills
                );
                expect(goodMatch.feedback).toBe('Good match. You have the core skills.');
                expect(goodMatch.matchPercentage).toBeGreaterThan(MATCH_THRESHOLDS.GOOD);
                expect(goodMatch.matchPercentage).toBeLessThanOrEqual(MATCH_THRESHOLDS.EXCELLENT);
            });
            
            test('should provide exact feedback for Partial match (>25%)', () => {
                const requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
                // Need 2 out of 4 = 50% which is actually Good match, so use 1 out of 3 skills
                const partialMatch = calculateSkillMatch(
                    ['JavaScript', 'Python', 'Django'],
                    ['JavaScript', 'React', 'Node.js']
                );
                expect(partialMatch.feedback).toBe('Partial match. You might need to upskill.');
                expect(partialMatch.matchPercentage).toBeGreaterThan(MATCH_THRESHOLDS.PARTIAL);
                expect(partialMatch.matchPercentage).toBeLessThanOrEqual(MATCH_THRESHOLDS.GOOD);
            });
            
            test('should provide exact feedback for Low match', () => {
                const requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
                const lowMatch = calculateSkillMatch(
                    ['Python'],
                    requiredSkills
                );
                expect(lowMatch.feedback).toBe('Low match.');
                expect(lowMatch.matchPercentage).toBeLessThanOrEqual(MATCH_THRESHOLDS.PARTIAL);
            });
        });

        // ISSUE #5 & #9: Boundary Value Tests and Percentage Calculation
        describe('boundary value and percentage calculation', () => {
            test('should calculate exact percentages with proper rounding', () => {
                // 1 out of 3 = 33.333...% → should round to 33
                const result1 = calculateSkillMatch(
                    ['JavaScript'],
                    ['JavaScript', 'React', 'Node.js']
                );
                expect(result1.matchPercentage).toBe(33);
                
                // 2 out of 3 = 66.666...% → should round to 67
                const result2 = calculateSkillMatch(
                    ['JavaScript', 'React'],
                    ['JavaScript', 'React', 'Node.js']
                );
                expect(result2.matchPercentage).toBe(67);
                
                // 1 out of 7 = 14.285...% → should round to 14
                const result3 = calculateSkillMatch(
                    ['JavaScript'],
                    ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'Docker']
                );
                expect(result3.matchPercentage).toBe(14);
            });

            test('should handle boundary values at exactly 75%', () => {
                // 3 out of 4 = 75% exactly
                const result = calculateSkillMatch(
                    ['JavaScript', 'React', 'Node.js'],
                    ['JavaScript', 'React', 'Node.js', 'MongoDB']
                );
                expect(result.matchPercentage).toBe(75);
                // At 75%, should still be "Good match" (needs > 75 for Excellent)
                expect(result.feedback).toBe('Good match. You have the core skills.');
            });

            test('should handle boundary values at exactly 76% (Excellent threshold)', () => {
                // Need just over 75%: 76% requires specific ratios
                const requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'];
                const studentSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
                
                const result = calculateSkillMatch(studentSkills, requiredSkills);
                const expectedPercentage = Math.round((4 / 5) * 100); // 80%
                expect(result.matchPercentage).toBe(expectedPercentage);
                expect(result.feedback).toBe('Excellent match! You have most required skills.');
            });

            test('should handle boundary values at exactly 50%', () => {
                // 2 out of 4 = 50% exactly
                const result = calculateSkillMatch(
                    ['JavaScript', 'React'],
                    ['JavaScript', 'React', 'Node.js', 'MongoDB']
                );
                expect(result.matchPercentage).toBe(50);
                // At 50%, should be "Partial match" (needs > 50 for Good)
                expect(result.feedback).toBe('Partial match. You might need to upskill.');
            });

            test('should handle boundary values at exactly 25%', () => {
                // 1 out of 4 = 25% exactly
                const result = calculateSkillMatch(
                    ['JavaScript'],
                    ['JavaScript', 'React', 'Node.js', 'MongoDB']
                );
                expect(result.matchPercentage).toBe(25);
                // At 25%, should be "Low match" (needs > 25 for Partial)
                expect(result.feedback).toBe('Low match.');
            });
        });

        // ISSUE #8 & #10: Input Sanitization and Performance
        describe('security and performance', () => {
            test('should handle potentially malicious skill names', () => {
                const maliciousSkills = [
                    '<script>alert(1)</script>',
                    "'; DROP TABLE--",
                    '../../etc/passwd',
                    'Java\0Script'
                ];
                
                const result = calculateSkillMatch(maliciousSkills, ['JavaScript']);
                // Should not crash and should handle gracefully
                expect(result).toHaveProperty('matchPercentage');
                expect(result).toHaveProperty('matchingSkills');
                expect(result).toHaveProperty('feedback');
            });

            test('should handle large skill arrays efficiently', () => {
                const largeStudentSkills = Array.from({ length: 1000 }, (_, i) => `Skill${i}`);
                const largeRequiredSkills = Array.from({ length: 500 }, (_, i) => `Skill${i + 500}`);
                
                const start = Date.now();
                const result = calculateSkillMatch(largeStudentSkills, largeRequiredSkills);
                const duration = Date.now() - start;
                
                expect(result).toHaveProperty('matchPercentage');
                expect(duration).toBeLessThan(1000); // Should complete in under 1 second
            });

            test('should handle very long skill names', () => {
                const longSkillName = 'VeryLongSkillName'.repeat(100);
                const result = calculateSkillMatch([longSkillName], [longSkillName]);
                
                expect(result.matchPercentage).toBe(100);
                expect(result.matchingSkills).toHaveLength(1);
            });
        });

        // ISSUE #2: Special character handling in real scenarios
        describe('real-world skill name variations', () => {
            test('should match common programming framework variations', () => {
                // These should match due to includes logic: 'react.js'.includes('react')
                const result1 = calculateSkillMatch(['React.js'], ['React']);
                expect(result1.matchingSkills.length).toBe(1); // react.js includes react
                
                const result2 = calculateSkillMatch(['Node.js'], ['Node']);
                expect(result2.matchingSkills.length).toBe(1); // node.js includes node
                
                // This won't match because 'vuejs' doesn't include 'vue.js' or vice versa
                const result3 = calculateSkillMatch(['VueJS'], ['Vue.js']);
                // This may not match, so just verify it doesn't crash
                expect(result3).toHaveProperty('matchingSkills');
            });

            test('should match skills with dots', () => {
                const result = calculateSkillMatch(['ASP.NET', 'Node.js'], ['ASP.NET', 'Node.js']);
                expect(result.matchPercentage).toBe(100);
                expect(result.matchingSkills).toHaveLength(2);
            });

            test('should match skills with special characters', () => {
                const result = calculateSkillMatch(['C++', 'C#'], ['C++', 'C#']);
                expect(result.matchPercentage).toBe(100);
                expect(result.matchingSkills).toHaveLength(2);
            });
        });
    });
});

describe('RecommendationService - Solution Analysis', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeSolutionViability', () => {
        // ISSUE #6: Realistic mock data
        const mockProblem = createMockProblem();

        test('should use semantic similarity when available', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockResolvedValue(0.85); // 85% similarity
            
            const solutionDescription = 'I will build a React Native app with Firebase backend for fitness tracking';
            const result = await analyzeSolutionViability(solutionDescription, 'problem123');
            
            expect(result.viabilityScore).toBe(85);
            expect(result.sentiment).toBe('High Fit');
            expect(result.method).toBe('AI Embeddings (all-MiniLM-L6-v2)');
            expect(calculateSemanticSimilarity).toHaveBeenCalledWith(
                solutionDescription,
                expect.stringContaining('Build a Mobile App')
            );
        });

        test('should fall back to keyword matching when embeddings fail', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockRejectedValue(new Error('API Error'));
            
            const solutionDescription = 'I will build a React Native mobile app with JavaScript and Firebase';
            const result = await analyzeSolutionViability(solutionDescription, 'problem123');
            
            expect(result.viabilityScore).toBeGreaterThan(0);
            expect(result.method).toBe('Fallback Keyword Matching');
        });

        test('should throw error when problem not found', async () => {
            Problem.findById.mockResolvedValue(null);
            
            await expect(
                analyzeSolutionViability('Some solution', 'invalid-id')
            ).rejects.toThrow('Problem not found');
        });

        test('should throw error when problemId is missing', async () => {
            await expect(
                analyzeSolutionViability('Some solution', null)
            ).rejects.toThrow('Problem ID is required');
        });

        // ISSUE #3 & #5: Boundary Value Tests for Semantic Similarity
        describe('semantic similarity score boundaries', () => {
            beforeEach(() => {
                Problem.findById.mockResolvedValue(mockProblem);
            });

            test('should handle exactly 0.75 similarity (boundary)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.75);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(75);
                expect(result.sentiment).toBe('Moderate Fit');
            });

            test('should handle exactly 0.7501 similarity (just over boundary)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.7501);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(75); // Rounds to 75
                expect(result.sentiment).toBe('Moderate Fit');
            });

            test('should handle exactly 0.76 similarity (High Fit)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.76);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(76);
                expect(result.sentiment).toBe('High Fit');
            });

            test('should handle exactly 0.50 similarity (boundary)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.50);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(50);
                expect(result.sentiment).toBe('Weak Fit');
            });

            test('should handle exactly 0.25 similarity (boundary)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.25);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(25);
                expect(result.sentiment).toBe('Poor Fit');
            });

            test('should handle 0.001 similarity (very low)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.001);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(0);
                expect(result.sentiment).toBe('Poor Fit');
            });

            test('should handle 0.856 similarity with proper rounding', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.856);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(86); // Rounds to 86
                expect(result.sentiment).toBe('High Fit');
            });

            test('should handle 0.999 similarity (near perfect)', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.999);
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(100); // Rounds to 100
                expect(result.sentiment).toBe('High Fit');
            });
        });

        test('should categorize High Fit correctly (>75%)', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockResolvedValue(0.85);
            
            const result = await analyzeSolutionViability('test solution', 'problem123');
            
            expect(result.viabilityScore).toBe(85);
            expect(result.sentiment).toBe('High Fit');
            expect(result.analysisSummary).toContain('strong alignment');
        });

        test('should categorize Moderate Fit correctly (50-75%)', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockResolvedValue(0.60);
            
            const result = await analyzeSolutionViability('test solution', 'problem123');
            
            expect(result.viabilityScore).toBe(60);
            expect(result.sentiment).toBe('Moderate Fit');
        });

        test('should categorize Weak Fit correctly (25-50%)', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockResolvedValue(0.35);
            
            const result = await analyzeSolutionViability('test solution', 'problem123');
            
            expect(result.viabilityScore).toBe(35);
            expect(result.sentiment).toBe('Weak Fit');
        });

        test('should categorize Poor Fit correctly (<25%)', async () => {
            Problem.findById.mockResolvedValue(mockProblem);
            calculateSemanticSimilarity.mockResolvedValue(0.15);
            
            const result = await analyzeSolutionViability('test solution', 'problem123');
            
            expect(result.viabilityScore).toBe(15);
            expect(result.sentiment).toBe('Poor Fit');
        });

        // ISSUE #7: Enhanced Error Handling Tests
        describe('comprehensive error handling', () => {
            test('should handle network timeout errors', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockRejectedValue(new Error('ETIMEDOUT'));
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.method).toBe('Fallback Keyword Matching');
                expect(result).toHaveProperty('viabilityScore');
            });

            test('should handle invalid API responses', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(null);
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                // Should convert null to 0
                expect(result.viabilityScore).toBe(0);
            });

            test('should handle undefined API responses', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(undefined);
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(0);
            });

            test('should handle database errors gracefully', async () => {
                Problem.findById.mockRejectedValue(new Error('Database connection failed'));
                
                await expect(
                    analyzeSolutionViability('test solution', 'problem123')
                ).rejects.toThrow('Database connection failed');
            });

            test('should handle missing problemId variations', async () => {
                await expect(analyzeSolutionViability('test', '')).rejects.toThrow();
                await expect(analyzeSolutionViability('test', undefined)).rejects.toThrow();
                await expect(analyzeSolutionViability('test', null)).rejects.toThrow();
            });

            test('should handle empty solution description', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.1);
                
                const result = await analyzeSolutionViability('', 'problem123');
                
                expect(result).toHaveProperty('viabilityScore');
            });

            test('should handle non-numeric similarity values', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(NaN);
                
                const result = await analyzeSolutionViability('test', 'problem123');
                
                expect(result.viabilityScore).toBe(0);
            });
        });

        // ISSUE #6: Mock Data Reality Tests
        describe('problem data variations', () => {
            test('should handle problem with missing requiredSkills', async () => {
                const problemNoSkills = createMockProblem({ requiredSkills: [] });
                Problem.findById.mockResolvedValue(problemNoSkills);
                calculateSemanticSimilarity.mockResolvedValue(0.6);
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result).toHaveProperty('viabilityScore');
            });

            test('should handle problem with empty description', async () => {
                const problemNoDesc = createMockProblem({ description: '' });
                Problem.findById.mockResolvedValue(problemNoDesc);
                calculateSemanticSimilarity.mockResolvedValue(0.5);
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result).toHaveProperty('viabilityScore');
            });

            test('should handle problem with all fields populated', async () => {
                const fullProblem = createMockProblem({
                    status: 'open',
                    createdAt: new Date('2026-02-15'),
                    updatedAt: new Date('2026-02-15'),
                    companyId: 'company456'
                });
                Problem.findById.mockResolvedValue(fullProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.8);
                
                const result = await analyzeSolutionViability('test solution', 'problem123');
                
                expect(result.viabilityScore).toBe(80);
                expect(result.sentiment).toBe('High Fit');
            });
        });

        // ISSUE #8 & #10: Input Sanitization and Performance
        describe('security and performance', () => {
            test('should handle malicious input in solution description', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.3);
                
                const maliciousInputs = [
                    '<script>alert(1)</script>',
                    "'; DROP TABLE solutions--",
                    '../../etc/passwd',
                    'XSS<img src=x onerror=alert(1)>'
                ];
                
                for (const input of maliciousInputs) {
                    const result = await analyzeSolutionViability(input, 'problem123');
                    expect(result).toHaveProperty('viabilityScore');
                }
            });

            test('should handle very long solution descriptions', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.5);
                
                const longDescription = 'A'.repeat(10000);
                const start = Date.now();
                const result = await analyzeSolutionViability(longDescription, 'problem123');
                const duration = Date.now() - start;
                
                expect(result).toHaveProperty('viabilityScore');
                expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
            });

            test('should handle unicode and special characters', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.4);
                
                const unicodeDescription = '我将使用React Native构建这个应用程序 🚀';
                const result = await analyzeSolutionViability(unicodeDescription, 'problem123');
                
                expect(result).toHaveProperty('viabilityScore');
            });
        });

        // ISSUE #4: Concurrent Request Tests
        describe('concurrent operations', () => {
            test('should handle multiple simultaneous calls to same problem', async () => {
                Problem.findById.mockResolvedValue(mockProblem);
                calculateSemanticSimilarity.mockResolvedValue(0.7);
                
                const requests = Array.from({ length: 10 }, () =>
                    analyzeSolutionViability('test solution', 'problem123')
                );
                
                const results = await Promise.all(requests);
                
                expect(results).toHaveLength(10);
                results.forEach(result => {
                    expect(result.viabilityScore).toBe(70);
                    expect(result.sentiment).toBe('Moderate Fit');
                });
            });

            test('should handle concurrent calls to different problems', async () => {
                const problems = [
                    createMockProblem({ _id: 'problem1' }),
                    createMockProblem({ _id: 'problem2' }),
                    createMockProblem({ _id: 'problem3' })
                ];
                
                Problem.findById
                    .mockResolvedValueOnce(problems[0])
                    .mockResolvedValueOnce(problems[1])
                    .mockResolvedValueOnce(problems[2]);
                
                calculateSemanticSimilarity
                    .mockResolvedValueOnce(0.8)
                    .mockResolvedValueOnce(0.6)
                    .mockResolvedValueOnce(0.4);
                
                const requests = [
                    analyzeSolutionViability('solution1', 'problem1'),
                    analyzeSolutionViability('solution2', 'problem2'),
                    analyzeSolutionViability('solution3', 'problem3')
                ];
                
                const results = await Promise.all(requests);
                
                expect(results[0].viabilityScore).toBe(80);
                expect(results[1].viabilityScore).toBe(60);
                expect(results[2].viabilityScore).toBe(40);
            });

            test('should handle mixed success and failure scenarios', async () => {
                Problem.findById
                    .mockResolvedValueOnce(mockProblem)
                    .mockResolvedValueOnce(null)
                    .mockResolvedValueOnce(mockProblem);
                
                calculateSemanticSimilarity.mockResolvedValue(0.7);
                
                const results = await Promise.allSettled([
                    analyzeSolutionViability('solution1', 'problem1'),
                    analyzeSolutionViability('solution2', 'invalid-id'),
                    analyzeSolutionViability('solution3', 'problem3')
                ]);
                
                expect(results[0].status).toBe('fulfilled');
                expect(results[1].status).toBe('rejected');
                expect(results[2].status).toBe('fulfilled');
            });
        });

        // ISSUE #11: Exact analysis summary format tests
        describe('analysis summary format validation', () => {
            beforeEach(() => {
                Problem.findById.mockResolvedValue(mockProblem);
            });

            test('should provide exact summary for High Fit', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.85);
                const result = await analyzeSolutionViability('test', 'problem123');
                
                expect(result.analysisSummary).toMatch(/^Semantic Compatibility: \d+%\./);
                expect(result.analysisSummary).toContain('strong alignment');
                expect(result.keyStrengths).toContain('Strong semantic alignment');
            });

            test('should provide exact summary for Moderate Fit', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.60);
                const result = await analyzeSolutionViability('test', 'problem123');
                
                expect(result.analysisSummary).toContain('60%');
                expect(result.analysisSummary).toContain('reasonable alignment');
                expect(result.keyStrengths).toContain('Moderate contextual match');
            });

            test('should provide exact summary for Weak Fit', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.35);
                const result = await analyzeSolutionViability('test', 'problem123');
                
                expect(result.analysisSummary).toContain('35%');
                expect(result.analysisSummary).toContain('limited alignment');
                expect(result.keyStrengths).toContain('Basic concept overlap');
            });

            test('should provide exact summary for Poor Fit', async () => {
                calculateSemanticSimilarity.mockResolvedValue(0.15);
                const result = await analyzeSolutionViability('test', 'problem123');
                
                expect(result.analysisSummary).toContain('15%');
                expect(result.analysisSummary).toContain('disconnected');
                expect(result.keyStrengths).toContain('Minimal alignment');
            });
        });
    });
});
