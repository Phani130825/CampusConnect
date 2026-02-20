const axios = require('axios');

// HuggingFace Inference API Configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

/**
 * Compute cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        throw new Error('Invalid vectors for similarity calculation');
    }
    
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Get embeddings from HuggingFace API
 * @param {string|string[]} texts - Text or array of texts to embed
 * @returns {Promise<number[]|number[][]>} - Embedding vector(s)
 */
const getEmbeddings = async (texts) => {
    if (!process.env.HUGGING_FACE_TOKEN) {
        throw new Error("HUGGING_FACE_TOKEN is missing in environment variables");
    }

    const inputTexts = Array.isArray(texts) ? texts : [texts];
    
    try {
        const response = await axios.post(
            HF_API_URL,
            { 
                inputs: inputTexts,
                options: { wait_for_model: true }
            },
            {
                headers: { 
                    Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );
        
        // Return single vector if single text, array of vectors if multiple
        return Array.isArray(texts) ? response.data : response.data[0];
    } catch (error) {
        console.error("HuggingFace API Error:", error.response?.data || error.message);
        throw new Error(`Embedding generation failed: ${error.message}`);
    }
};

/**
 * Calculate semantic similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {Promise<number>} - Similarity score between 0 and 1
 */
const calculateSemanticSimilarity = async (text1, text2) => {
    try {
        const embeddings = await getEmbeddings([text1, text2]);
        return cosineSimilarity(embeddings[0], embeddings[1]);
    } catch (error) {
        console.error("Semantic similarity calculation failed:", error.message);
        throw error;
    }
};

module.exports = {
    getEmbeddings,
    cosineSimilarity,
    calculateSemanticSimilarity
};
