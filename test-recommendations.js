const axios = require('axios');

async function testLogin() {
    try {
        // Login with existing test student
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'teststudent@test.com',
            password: 'test123'
        });

        console.log('Login successful!');
        const token = loginRes.data.token;

        // Now try to get recommendations
        console.log('\nFetching recommendations...');
        const recRes = await axios.get('http://localhost:5000/api/ai/recommendations', {
            headers: {
                'Cookie': `token=${token}`
            }
        });

        console.log('SUCCESS! Recommendations received:', recRes.data.length, 'items');
        console.log(JSON.stringify(recRes.data, null, 2));

    } catch (error) {
        console.error('\n=== ERROR ===');
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Status:', error.response?.status);
        console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
    }
}

testLogin();
