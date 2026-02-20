const axios = require('axios');
const {
    cosineSimilarity,
    getEmbeddings,
    calculateSemanticSimilarity
} = require('../services/embeddingService');

// Mock axios
jest.mock('axios');

describe('EmbeddingService', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.HUGGING_FACE_TOKEN = 'test-token';
    });

    afterEach(() => {
        delete process.env.HUGGING_FACE_TOKEN;
    });

    describe('cosineSimilarity', () => {
        test('should calculate similarity for identical vectors', () => {
            const vec1 = [1, 2, 3];
            const vec2 = [1, 2, 3];
            
            const similarity = cosineSimilarity(vec1, vec2);
            
            expect(similarity).toBeCloseTo(1.0, 5);
        });

        test('should calculate similarity for opposite vectors', () => {
            const vec1 = [1, 2, 3];
            const vec2 = [-1, -2, -3];
            
            const similarity = cosineSimilarity(vec1, vec2);
            
            expect(similarity).toBeCloseTo(-1.0, 5);
        });

        test('should calculate similarity for orthogonal vectors', () => {
            const vec1 = [1, 0, 0];
            const vec2 = [0, 1, 0];
            
            const similarity = cosineSimilarity(vec1, vec2);
            
            expect(similarity).toBeCloseTo(0, 5);
        });

        test('should return 0 for zero magnitude vectors', () => {
            const vec1 = [0, 0, 0];
            const vec2 = [1, 2, 3];
            
            const similarity = cosineSimilarity(vec1, vec2);
            
            expect(similarity).toBe(0);
        });

        test('should throw error for vectors of different lengths', () => {
            const vec1 = [1, 2, 3];
            const vec2 = [1, 2];
            
            expect(() => cosineSimilarity(vec1, vec2)).toThrow('Invalid vectors');
        });

        test('should throw error for null or undefined vectors', () => {
            expect(() => cosineSimilarity(null, [1, 2, 3])).toThrow('Invalid vectors');
            expect(() => cosineSimilarity([1, 2, 3], undefined)).toThrow('Invalid vectors');
        });

        test('should handle floating point vectors', () => {
            const vec1 = [0.5, 0.3, 0.8];
            const vec2 = [0.6, 0.4, 0.7];
            
            const similarity = cosineSimilarity(vec1, vec2);
            
            expect(similarity).toBeGreaterThan(0);
            expect(similarity).toBeLessThanOrEqual(1);
        });
    });

    describe('getEmbeddings', () => {
        test('should fetch embeddings for a single text', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
            axios.post.mockResolvedValue({ data: [mockEmbedding] });
            
            const result = await getEmbeddings('test text');
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('huggingface.co'),
                expect.objectContaining({
                    inputs: ['test text'],
                    options: { wait_for_model: true }
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token'
                    })
                })
            );
            expect(result).toEqual(mockEmbedding);
        });

        test('should fetch embeddings for multiple texts', async () => {
            const mockEmbeddings = [[0.1, 0.2], [0.3, 0.4]];
            axios.post.mockResolvedValue({ data: mockEmbeddings });
            
            const result = await getEmbeddings(['text1', 'text2']);
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    inputs: ['text1', 'text2']
                }),
                expect.any(Object)
            );
            expect(result).toEqual(mockEmbeddings);
        });

        test('should throw error when HUGGING_FACE_TOKEN is missing', async () => {
            delete process.env.HUGGING_FACE_TOKEN;
            
            await expect(getEmbeddings('test')).rejects.toThrow('HUGGING_FACE_TOKEN is missing');
        });

        test('should handle API errors gracefully', async () => {
            axios.post.mockRejectedValue({
                response: { data: { error: 'Model not found' } },
                message: 'API Error'
            });
            
            await expect(getEmbeddings('test')).rejects.toThrow('Embedding generation failed');
        });

        test('should handle network timeout', async () => {
            axios.post.mockRejectedValue(new Error('Network timeout'));
            
            await expect(getEmbeddings('test')).rejects.toThrow('Embedding generation failed');
        });

        test('should include timeout in request config', async () => {
            axios.post.mockResolvedValue({ data: [[0.1, 0.2]] });
            
            await getEmbeddings('test');
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Object),
                expect.objectContaining({ timeout: 30000 })
            );
        });
    });

    describe('calculateSemanticSimilarity', () => {
        test('should calculate similarity between two texts', async () => {
            const mockEmbeddings = [
                [0.5, 0.3, 0.8],
                [0.6, 0.4, 0.7]
            ];
            axios.post.mockResolvedValue({ data: mockEmbeddings });
            
            const similarity = await calculateSemanticSimilarity('text1', 'text2');
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    inputs: ['text1', 'text2']
                }),
                expect.any(Object)
            );
            expect(similarity).toBeGreaterThan(0);
            expect(similarity).toBeLessThanOrEqual(1);
        });

        test('should handle embedding generation errors', async () => {
            axios.post.mockRejectedValue(new Error('API Error'));
            
            await expect(
                calculateSemanticSimilarity('text1', 'text2')
            ).rejects.toThrow();
        });

        test('should work with semantically similar texts', async () => {
            // Mock embeddings that are very similar
            const mockEmbeddings = [
                [1.0, 0.5, 0.3],
                [0.9, 0.5, 0.3]
            ];
            axios.post.mockResolvedValue({ data: mockEmbeddings });
            
            const similarity = await calculateSemanticSimilarity(
                'I love programming',
                'I enjoy coding'
            );
            
            expect(similarity).toBeGreaterThan(0.8); // High similarity expected
        });

        test('should work with semantically different texts', async () => {
            // Mock embeddings that are dissimilar
            const mockEmbeddings = [
                [1.0, 0.0, 0.0],
                [0.0, 0.0, 1.0]
            ];
            axios.post.mockResolvedValue({ data: mockEmbeddings });
            
            const similarity = await calculateSemanticSimilarity(
                'I love programming',
                'The weather is nice today'
            );
            
            expect(similarity).toBeLessThan(0.5); // Low similarity expected
        });
    });
});
