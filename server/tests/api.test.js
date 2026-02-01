const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    test('GET /api/test should return working message', async () => {
        const res = await request(app).get('/api/test');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('API Test Working');
    });

    test('GET / should return running message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('CAMPUS CONNECT API is running...');
    });

    test('Invalid route should return 404', async () => {
        const res = await request(app).get('/api/invalid-route');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('Route not found');
    });
});
