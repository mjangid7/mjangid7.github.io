const express = require('express');
const redis = require('redis');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Redis client setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch(console.error);

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://mjangid7.github.io', 'https://mukundjangid.dev'],
    credentials: true
}));
app.use(express.json());

// Utility functions
const getClientIP = (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

const generateVisitorId = () => {
    return `visitor_${Date.now()}_${uuidv4().slice(0, 8)}`;
};

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Track visit
app.post('/api/visits', async (req, res) => {
    try {
        const {
            visitorId,
            userAgent,
            referrer,
            url,
            viewport,
            isNewSession
        } = req.body;

        const ip = getClientIP(req);
        const timestamp = new Date().toISOString();
        const visitId = uuidv4();

        // Store visit data
        const visitData = {
            visitId,
            visitorId: visitorId || generateVisitorId(),
            timestamp,
            ip,
            userAgent,
            referrer: referrer || 'direct',
            url,
            viewport,
            isNewSession
        };

        // Store individual visit
        await redisClient.hSet(`visit:${visitId}`, visitData);

        // Update analytics counters
        await redisClient.incr('analytics:total_visits');
        
        if (isNewSession) {
            await redisClient.incr('analytics:total_sessions');
        }

        // Track unique visitors using Redis Sets
        const isNewVisitor = await redisClient.sAdd('analytics:unique_visitors', visitData.visitorId);
        
        if (isNewVisitor) {
            await redisClient.incr('analytics:unique_visitor_count');
        }

        // Store visitor session
        await redisClient.hSet(`visitor:${visitData.visitorId}`, {
            lastVisit: timestamp,
            ip,
            userAgent
        });

        // Add to recent visits list (keep last 100)
        await redisClient.lPush('analytics:recent_visits', JSON.stringify(visitData));
        await redisClient.lTrim('analytics:recent_visits', 0, 99);

        res.json({ 
            success: true, 
            visitorId: visitData.visitorId,
            visitId,
            isNewVisitor: !!isNewVisitor
        });

    } catch (error) {
        console.error('Error tracking visit:', error);
        res.status(500).json({ error: 'Failed to track visit' });
    }
});

// Get analytics summary
app.get('/api/analytics', async (req, res) => {
    try {
        const [totalVisits, totalSessions, uniqueVisitorCount] = await Promise.all([
            redisClient.get('analytics:total_visits'),
            redisClient.get('analytics:total_sessions'), 
            redisClient.get('analytics:unique_visitor_count')
        ]);

        const recentVisits = await redisClient.lRange('analytics:recent_visits', 0, 9);
        const parsedRecentVisits = recentVisits.map(visit => JSON.parse(visit));

        res.json({
            totalVisits: parseInt(totalVisits) || 0,
            totalSessions: parseInt(totalSessions) || 0,
            uniqueVisitors: parseInt(uniqueVisitorCount) || 0,
            recentVisits: parsedRecentVisits
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const {
            name,
            email,
            company,
            project,
            timeline,
            message,
            visitorId
        } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const contactId = uuidv4();
        const timestamp = new Date().toISOString();
        const ip = getClientIP(req);

        const contactData = {
            contactId,
            name,
            email,
            company: company || '',
            project: project || '',
            timeline: timeline || '',
            message,
            timestamp,
            ip,
            visitorId,
            status: 'new',
            metadata: {
                userAgent: req.headers['user-agent'] || '',
                referer: req.headers.referer || '',
                acceptLanguage: req.headers['accept-language'] || '',
                submissionSource: 'portfolio_website'
            }
        };

        // Store contact with full name as key and complete JSON as value
        await redisClient.set(`contact:${contactData.name}`, JSON.stringify(contactData));

        // Store contact submission in Redis as JSON (keep hash structure for compatibility)
        await redisClient.hSet(`contact:${contactId}`, {
            data: JSON.stringify(contactData),
            created_at: timestamp,
            updated_at: timestamp,
            status: 'new'
        });
        
        // Add to contacts list (for easy retrieval)
        await redisClient.lPush('contacts:submissions', JSON.stringify(contactData));
        
        // Store in daily contact list for analytics
        const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await redisClient.lPush(`contacts:daily:${dateKey}`, JSON.stringify(contactData));
        
        // Update contact counter
        await redisClient.incr('analytics:total_contacts');

        // Send email notification
        try {
            const emailContent = `
                New Contact Form Submission
                ========================
                
                Name: ${name}
                Email: ${email}
                Company: ${company || 'Not provided'}
                Project Type: ${project || 'Not specified'}
                Timeline: ${timeline || 'Not specified'}
                
                Message:
                ${message}
                
                Submission Details:
                - Contact ID: ${contactId}
                - Timestamp: ${timestamp}
                - Visitor ID: ${visitorId}
                - IP Address: ${ip}
            `;

            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'mukund.jangid95@gmail.com',
                subject: `Portfolio Contact: ${name} - ${project || 'General Inquiry'}`,
                text: emailContent
            });

            // Send auto-reply to user
            const autoReplyContent = `
                Hi ${name},
                
                Thank you for reaching out! I've received your message and will get back to you within 24 hours.
                
                Your submission details:
                - Project Type: ${project || 'General Inquiry'}
                - Timeline: ${timeline || 'To be discussed'}
                
                I look forward to discussing your project!
                
                Best regards,
                Mukund Jangid
                Technical Product Manager & AI Strategist
            `;

            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Thank you for contacting Mukund Jangid',
                text: autoReplyContent
            });

            console.log(`Contact form submitted by ${name} (${email})`);

        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue processing even if email fails
        }

        res.json({ 
            success: true, 
            contactId,
            message: 'Thank you for your message! I\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ error: 'Failed to process contact form' });
    }
});

// Get contact submissions (admin endpoint)
app.get('/api/contacts', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        
        const submissions = await redisClient.lRange('contacts:submissions', 
            Number.parseInt(offset), 
            Number.parseInt(offset) + Number.parseInt(limit) - 1
        );
        
        const parsedSubmissions = submissions.map(submission => JSON.parse(submission));
        const totalContacts = await redisClient.get('analytics:total_contacts');

        res.json({
            submissions: parsedSubmissions,
            total: Number.parseInt(totalContacts) || 0,
            limit: Number.parseInt(limit),
            offset: Number.parseInt(offset)
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Get specific contact by ID
app.get('/api/contact/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        
        const contactHash = await redisClient.hGetAll(`contact:${contactId}`);
        
        if (!contactHash.data) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        const contactData = JSON.parse(contactHash.data);
        
        res.json({
            contactId,
            ...contactData,
            redis_metadata: {
                created_at: contactHash.created_at,
                updated_at: contactHash.updated_at,
                status: contactHash.status
            }
        });

    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

// Get contact by full name
app.get('/api/contact/name/:fullName', async (req, res) => {
    try {
        const { fullName } = req.params;
        
        const contactData = await redisClient.get(`contact:${fullName}`);
        
        if (!contactData) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        const parsedContact = JSON.parse(contactData);
        
        res.json({
            message: 'Contact retrieved by full name',
            fullName,
            contact: parsedContact
        });

    } catch (error) {
        console.error('Error fetching contact by name:', error);
        res.status(500).json({ error: 'Failed to fetch contact by name' });
    }
});

// Get all contact names (keys)
app.get('/api/contacts/names', async (req, res) => {
    try {
        const contactKeys = await redisClient.keys('contact:*');
        
        // Filter out the UUID-based contact keys, keep only name-based keys
        const nameKeys = contactKeys.filter(key => 
            !key.match(/contact:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        );
        
        const contactNames = nameKeys.map(key => key.replace('contact:', ''));
        
        res.json({
            message: 'All contact names retrieved',
            total_contacts: contactNames.length,
            contact_names: contactNames,
            contact_keys: nameKeys
        });

    } catch (error) {
        console.error('Error fetching contact names:', error);
        res.status(500).json({ error: 'Failed to fetch contact names' });
    }
});

// Get daily contact analytics
app.get('/api/contacts/analytics/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const dailyContacts = await redisClient.lRange(`contacts:daily:${targetDate}`, 0, -1);
        const parsedContacts = dailyContacts.map(contact => JSON.parse(contact));
        
        // Analytics summary
        const summary = {
            date: targetDate,
            total_contacts: parsedContacts.length,
            project_types: {},
            companies: {},
            timeline_distribution: {}
        };
        
        for (const contact of parsedContacts) {
            // Count project types
            if (contact.project) {
                summary.project_types[contact.project] = (summary.project_types[contact.project] || 0) + 1;
            }
            
            // Count companies
            if (contact.company) {
                summary.companies[contact.company] = (summary.companies[contact.company] || 0) + 1;
            }
            
            // Count timeline preferences
            if (contact.timeline) {
                summary.timeline_distribution[contact.timeline] = (summary.timeline_distribution[contact.timeline] || 0) + 1;
            }
        }
        
        res.json({
            summary,
            contacts: parsedContacts
        });

    } catch (error) {
        console.error('Error fetching daily analytics:', error);
        res.status(500).json({ error: 'Failed to fetch daily analytics' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Portfolio API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await redisClient.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await redisClient.quit();
    process.exit(0);
});