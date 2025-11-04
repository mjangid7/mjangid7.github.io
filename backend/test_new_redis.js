const redis = require('redis');

async function testNewRedisConnection() {
    const redisClient = redis.createClient({
        url: 'redis://default:QRKMFCKNFkvnyHwHTHeLatJFudaOgFVu@trolley.proxy.rlwy.net:14218'
    });

    try {
        await redisClient.connect();
        console.log('✅ Successfully connected to new Railway Redis instance');
        
        // Test basic operations
        await redisClient.set('test:connection', JSON.stringify({
            timestamp: new Date().toISOString(),
            message: 'Connection test successful'
        }));
        
        const testData = await redisClient.get('test:connection');
        console.log('✅ Test data stored and retrieved:', JSON.parse(testData));
        
        // Test contact storage format
        await redisClient.set('contact:Test User', JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            timestamp: new Date().toISOString(),
            project: 'Connection Test'
        }));
        
        const contactData = await redisClient.get('contact:Test User');
        console.log('✅ Contact data test:', JSON.parse(contactData));
        
        console.log('🎉 New Redis connection is working perfectly!');
        
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
    } finally {
        await redisClient.quit();
    }
}

testNewRedisConnection();