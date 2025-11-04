const redis = require('redis');

async function testRedisConnection() {
    const redisUrl = 'redis://default:pkBNZGuCsUuZjMNuHTvDQbkcKhBNCpdd@switchback.proxy.rlwy.net:44804';
    
    console.log('🔌 Testing Redis Connection to Railway...');
    console.log('=' * 50);
    
    const client = redis.createClient({
        url: redisUrl
    });

    client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
    });

    try {
        console.log('Connecting to Redis...');
        await client.connect();
        console.log('✅ Connected to Redis successfully!');
        
        // Test basic operations
        console.log('\nTesting basic operations...');
        
        // Set a test key
        await client.set('portfolio:test', 'Hello from Portfolio Backend!');
        console.log('✅ Set test key');
        
        // Get the test key
        const value = await client.get('portfolio:test');
        console.log(`✅ Retrieved test key: "${value}"`);
        
        // Test analytics counters
        await client.incr('analytics:test_counter');
        const counter = await client.get('analytics:test_counter');
        console.log(`✅ Test counter: ${counter}`);
        
        // Clean up test data
        await client.del('portfolio:test');
        await client.del('analytics:test_counter');
        console.log('✅ Cleaned up test data');
        
        console.log('\n🎉 All Redis tests passed! Backend is ready to use.');
        
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        process.exit(1);
    } finally {
        await client.quit();
        console.log('👋 Disconnected from Redis');
    }
}

testRedisConnection();