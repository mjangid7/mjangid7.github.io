const redis = require('redis');
require('dotenv').config();

async function testRedisConnection() {
    console.log('Testing Redis connection...');
    console.log('Redis URL:', process.env.REDIS_URL);
    
    const client = redis.createClient({
        url: process.env.REDIS_URL
    });
    
    client.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });
    
    try {
        await client.connect();
        console.log('✅ Successfully connected to Redis');
        
        // Test basic operations
        await client.set('test_key', 'test_value');
        const value = await client.get('test_key');
        console.log('✅ Test write/read successful:', value);
        
        // Test contact storage (simulate contact form submission)
        const testContact = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message',
            timestamp: new Date().toISOString()
        };
        
        // Store using the same pattern as the server
        await client.set(`contact:${testContact.name}`, JSON.stringify(testContact));
        await client.lPush('contacts:submissions', JSON.stringify(testContact));
        
        console.log('✅ Test contact storage successful');
        
        // Retrieve contacts to verify
        const storedContact = await client.get(`contact:${testContact.name}`);
        const recentSubmissions = await client.lRange('contacts:submissions', 0, 0);
        
        console.log('📋 Stored contact:', JSON.parse(storedContact));
        console.log('📋 Recent submissions:', recentSubmissions.map(s => JSON.parse(s)));
        
        // Get all contact keys
        const contactKeys = await client.keys('contact:*');
        console.log('📋 All contact keys:', contactKeys);
        
        // Clean up test data
        await client.del('test_key');
        await client.del(`contact:${testContact.name}`);
        await client.lPop('contacts:submissions');
        
        console.log('✅ Cleanup completed');
        
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
    } finally {
        await client.quit();
        console.log('Redis connection closed');
    }
}

testRedisConnection().catch(console.error);