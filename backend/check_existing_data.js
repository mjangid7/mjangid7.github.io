const redis = require('redis');
require('dotenv').config();

async function checkExistingData() {
    console.log('Checking existing data in Redis...');
    
    const client = redis.createClient({
        url: process.env.REDIS_URL
    });
    
    client.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });
    
    try {
        await client.connect();
        console.log('✅ Connected to Redis');
        
        // Check all contact-related keys
        console.log('\n=== CONTACT DATA ANALYSIS ===');
        
        // Get all contact keys
        const contactKeys = await client.keys('contact:*');
        console.log(`📋 Total contact keys found: ${contactKeys.length}`);
        console.log('Contact keys:', contactKeys);
        
        // Get contact submissions list
        const submissionsList = await client.lLen('contacts:submissions');
        console.log(`📋 Contact submissions list length: ${submissionsList}`);
        
        if (submissionsList > 0) {
            const recentSubmissions = await client.lRange('contacts:submissions', 0, -1);
            console.log('\n📋 All submissions in list:');
            recentSubmissions.forEach((submission, index) => {
                console.log(`${index + 1}:`, JSON.parse(submission));
            });
        }
        
        // Check analytics counters
        console.log('\n=== ANALYTICS DATA ===');
        const totalContacts = await client.get('analytics:total_contacts');
        const totalVisits = await client.get('analytics:total_visits');
        const uniqueVisitors = await client.get('analytics:unique_visitor_count');
        
        console.log(`📊 Total contacts: ${totalContacts || 0}`);
        console.log(`📊 Total visits: ${totalVisits || 0}`);
        console.log(`📊 Unique visitors: ${uniqueVisitors || 0}`);
        
        // Check daily contact data
        console.log('\n=== DAILY CONTACT DATA ===');
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
        
        const todayContacts = await client.lLen(`contacts:daily:${today}`);
        const yesterdayContacts = await client.lLen(`contacts:daily:${yesterday}`);
        
        console.log(`📅 Today (${today}): ${todayContacts} contacts`);
        console.log(`📅 Yesterday (${yesterday}): ${yesterdayContacts} contacts`);
        
        // List all keys to see what data exists
        console.log('\n=== ALL REDIS KEYS ===');
        const allKeys = await client.keys('*');
        console.log(`🔑 Total keys in database: ${allKeys.length}`);
        console.log('All keys:', allKeys);
        
    } catch (error) {
        console.error('❌ Error checking data:', error);
    } finally {
        await client.quit();
        console.log('\nRedis connection closed');
    }
}

checkExistingData().catch(console.error);