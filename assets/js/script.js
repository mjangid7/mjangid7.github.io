// Enhanced Portfolio JavaScript with Dark Theme Features, Performance Optimizations, and Accessibility

// Visit Tracking Analytics
class VisitTracker {
    constructor() {
        this.storageKey = 'portfolio_analytics';
        this.sessionKey = 'portfolio_session';
        this.init();
    }

    init() {
        this.trackPageVisit();
        this.trackEngagement();
        this.setupVisibilityTracking();
    }

    // Generate unique visitor ID
    generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get or create visitor ID
    getVisitorId() {
        let visitorId = localStorage.getItem('portfolio_visitor_id');
        if (!visitorId) {
            visitorId = this.generateVisitorId();
            localStorage.setItem('portfolio_visitor_id', visitorId);
        }
        return visitorId;
    }

    // Check if this is a new session
    isNewSession() {
        const sessionId = sessionStorage.getItem(this.sessionKey);
        if (!sessionId) {
            const newSessionId = 'session_' + Date.now();
            sessionStorage.setItem(this.sessionKey, newSessionId);
            return true;
        }
        return false;
    }

    // Track page visit
    trackPageVisit() {
        const analytics = this.getAnalytics();
        const visitorId = this.getVisitorId();
        const isNewSession = this.isNewSession();
        const timestamp = new Date().toISOString();

        // Update total visits
        analytics.totalVisits = (analytics.totalVisits || 0) + 1;

        // Track unique visitors
        if (!analytics.uniqueVisitors) {
            analytics.uniqueVisitors = new Set();
        }
        analytics.uniqueVisitors.add(visitorId);

        // Track sessions
        if (isNewSession) {
            analytics.totalSessions = (analytics.totalSessions || 0) + 1;
        }

        // Track visit details
        const visitData = {
            visitorId,
            timestamp,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            isNewSession
        };

        // Get IP address and location data
        this.getIPDetails().then(ipData => {
            if (ipData) {
                visitData.ip = ipData;
                // Store IP data separately for easy access
                this.storeIPData(ipData, visitData);
            }
            
            if (!analytics.visits) {
                analytics.visits = [];
            }
            
            analytics.visits.push(visitData);
            this.saveAnalytics(analytics);
            
            console.log('📊 Visit tracked with IP data:', visitData);
        }).catch(error => {
            console.warn('Could not get IP data:', error);
            
            // Save without IP data if API fails
            if (!analytics.visits) {
                analytics.visits = [];
            }
            
            analytics.visits.push(visitData);
            this.saveAnalytics(analytics);
            
            console.log('📊 Visit tracked (no IP data):', visitData);
        });
    }

    // Store IP data separately for easy access
    storeIPData(ipData, visitData) {
        const storageKey = 'portfolio_ip_tracking';
        let ipTracking = {};
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                ipTracking = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error reading stored IP data:', e);
            ipTracking = {};
        }
        
        // Initialize structure if needed
        if (!ipTracking.visitors) {
            ipTracking.visitors = {};
            ipTracking.totalVisits = 0;
            ipTracking.uniqueIPs = 0;
            ipTracking.countries = new Set();
            ipTracking.cities = new Set();
            ipTracking.lastUpdated = new Date().toISOString();
        }
        
        const ip = ipData.ip;
        const timestamp = visitData.timestamp;
        
        // Update or create IP visitor record
        if (!ipTracking.visitors[ip]) {
            ipTracking.visitors[ip] = {
                ...ipData,
                firstSeen: timestamp,
                lastSeen: timestamp,
                visitCount: 0,
                sessions: []
            };
            ipTracking.uniqueIPs++;
        }
        
        // Update visitor data
        ipTracking.visitors[ip].visitCount++;
        ipTracking.visitors[ip].lastSeen = timestamp;
        ipTracking.visitors[ip].sessions.push({
            timestamp: timestamp,
            userAgent: visitData.userAgent,
            referrer: visitData.referrer,
            viewport: visitData.viewport,
            isNewSession: visitData.isNewSession
        });
        
        // Update aggregated data
        ipTracking.totalVisits++;
        if (ipData.country) ipTracking.countries.add(ipData.country);
        if (ipData.city) ipTracking.cities.add(ipData.city);
        ipTracking.lastUpdated = new Date().toISOString();
        
        // Keep only last 50 sessions per IP to manage storage
        if (ipTracking.visitors[ip].sessions.length > 50) {
            ipTracking.visitors[ip].sessions = ipTracking.visitors[ip].sessions.slice(-50);
        }
        
        try {
            // Convert Sets to Arrays for storage
            const toStore = {
                ...ipTracking,
                countries: Array.from(ipTracking.countries),
                cities: Array.from(ipTracking.cities)
            };
            localStorage.setItem(storageKey, JSON.stringify(toStore));
            
            // Update global object for easy access
            window.portfolioIPData = {
                ...ipTracking,
                countries: Array.from(ipTracking.countries),
                cities: Array.from(ipTracking.cities)
            };
            
            console.log('🌍 IP data stored successfully for:', ip);
        } catch (e) {
            console.error('Error storing IP data:', e);
        }
    }

    // Get IP address and location details
    async getIPDetails() {
        try {
            // Using ipapi.co free service (1000 requests/day)
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error('IP API request failed');
            }
            
            const data = await response.json();
            
            return {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                countryCode: data.country_code,
                timezone: data.timezone,
                isp: data.org,
                latitude: data.latitude,
                longitude: data.longitude
            };
        } catch (error) {
            console.warn('Failed to get IP details:', error);
            return null;
        }
    }

    // Track user engagement
    trackEngagement() {
        let startTime = Date.now();
        let isActive = true;

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.updateEngagement('timeSpent', timeSpent);
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.updateEngagement('maxScrollDepth', maxScroll);
            }
        });

        // Track section views
        this.trackSectionViews();

        // Track interactions
        this.trackInteractions();
    }

    // Track which sections are viewed
    trackSectionViews() {
        const sections = document.querySelectorAll('section[id]');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateEngagement('sectionsViewed', sectionId, 'add');
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Track user interactions
    trackInteractions() {
        // Track clicks on important elements
        const trackableElements = [
            'a[href^="mailto:"]',
            'a[href^="tel:"]',
            'a[href*="linkedin.com"]',
            'a[href*="github.com"]',
            '.btn',
            '.contact-card',
            '.project-card',
            '.tech-tag'
        ];

        trackableElements.forEach(selector => {
            document.addEventListener('click', (e) => {
                if (e.target.matches(selector) || e.target.closest(selector)) {
                    const element = e.target.matches(selector) ? e.target : e.target.closest(selector);
                    const elementType = this.getElementType(element);
                    const elementData = this.getElementData(element);
                    
                    this.updateEngagement('interactions', {
                        type: elementType,
                        data: elementData,
                        timestamp: new Date().toISOString()
                    }, 'push');
                }
            });
        });

        // Track theme changes
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theme-toggle') || e.target.closest('.theme-toggle')) {
                this.updateEngagement('themeChanges', Date.now(), 'increment');
            }
        });
    }

    // Setup page visibility tracking
    setupVisibilityTracking() {
        let hiddenTime = 0;
        let lastHidden = null;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                lastHidden = Date.now();
            } else if (lastHidden) {
                hiddenTime += Date.now() - lastHidden;
                this.updateEngagement('timeHidden', hiddenTime);
                lastHidden = null;
            }
        });
    }

    // Get element type for tracking
    getElementType(element) {
        if (element.matches('a[href^="mailto:"]')) return 'email';
        if (element.matches('a[href^="tel:"]')) return 'phone';
        if (element.matches('a[href*="linkedin.com"]')) return 'linkedin';
        if (element.matches('a[href*="github.com"]')) return 'github';
        if (element.matches('.btn')) return 'button';
        if (element.matches('.contact-card')) return 'contact';
        if (element.matches('.project-card')) return 'project';
        if (element.matches('.tech-tag')) return 'technology';
        return 'other';
    }

    // Get element data for tracking
    getElementData(element) {
        return {
            text: element.textContent?.trim().substring(0, 50) || '',
            href: element.href || '',
            className: element.className || '',
            id: element.id || ''
        };
    }

    // Update engagement metrics
    updateEngagement(metric, value, operation = 'set') {
        const analytics = this.getAnalytics();
        
        if (!analytics.engagement) {
            analytics.engagement = {};
        }

        const engagement = analytics.engagement;

        switch (operation) {
            case 'add':
                if (!engagement[metric]) engagement[metric] = new Set();
                engagement[metric].add(value);
                break;
            case 'push':
                if (!engagement[metric]) engagement[metric] = [];
                engagement[metric].push(value);
                break;
            case 'increment':
                engagement[metric] = (engagement[metric] || 0) + 1;
                break;
            case 'max':
                engagement[metric] = Math.max(engagement[metric] || 0, value);
                break;
            default:
                engagement[metric] = value;
        }

        this.saveAnalytics(analytics);
    }

    // Get analytics data
    getAnalytics() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                // Convert Sets back from arrays
                if (parsed.uniqueVisitors && Array.isArray(parsed.uniqueVisitors)) {
                    parsed.uniqueVisitors = new Set(parsed.uniqueVisitors);
                }
                if (parsed.engagement?.sectionsViewed && Array.isArray(parsed.engagement.sectionsViewed)) {
                    parsed.engagement.sectionsViewed = new Set(parsed.engagement.sectionsViewed);
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse analytics data:', e);
        }
        return {};
    }

    // Save analytics data
    saveAnalytics(data) {
        try {
            // Convert Sets to arrays for JSON serialization
            const serializable = { ...data };
            if (serializable.uniqueVisitors instanceof Set) {
                serializable.uniqueVisitors = Array.from(serializable.uniqueVisitors);
            }
            if (serializable.engagement?.sectionsViewed instanceof Set) {
                serializable.engagement.sectionsViewed = Array.from(serializable.engagement.sectionsViewed);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(serializable));
        } catch (e) {
            console.warn('Failed to save analytics data:', e);
        }
    }

    // Log visit for debugging
    logVisit(visitData) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Portfolio Visit Tracked:', {
                visitor: visitData.visitorId,
                timestamp: visitData.timestamp,
                isNewSession: visitData.isNewSession,
                referrer: visitData.referrer,
                viewport: visitData.viewport
            });
        }
    }

    // Get analytics summary (for debugging or display)
    getSummary() {
        const analytics = this.getAnalytics();
        return {
            totalVisits: analytics.totalVisits || 0,
            uniqueVisitors: analytics.uniqueVisitors ? analytics.uniqueVisitors.size : 0,
            totalSessions: analytics.totalSessions || 0,
            averageTimeSpent: analytics.engagement?.timeSpent || 0,
            maxScrollDepth: analytics.engagement?.maxScrollDepth || 0,
            sectionsViewed: analytics.engagement?.sectionsViewed ? analytics.engagement.sectionsViewed.size : 0,
            interactions: analytics.engagement?.interactions?.length || 0,
            themeChanges: analytics.engagement?.themeChanges || 0
        };
    }

    // Export analytics data
    exportData() {
        return this.getAnalytics();
    }

    // Clear analytics data
    clearData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('portfolio_visitor_id');
        sessionStorage.removeItem(this.sessionKey);
        console.log('📊 Analytics data cleared');
    }
}

// Accessibility utilities
const AccessibilityUtils = {
    // Announce dynamic content changes to screen readers
    announce: function(message, priority = 'polite') {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
        
        setTimeout(() => {
            announcer.textContent = message;
            setTimeout(() => {
                document.body.removeChild(announcer);
            }, 1000);
        }, 100);
    },
    
    // Manage focus for better keyboard navigation
    manageFocus: function(element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },
    
    // Enhanced keyboard navigation
    handleKeydown: function(event, callback) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            callback();
        }
    }
};

// Theme Management with Three Themes and Accessibility
class ThemeManager {
    constructor() {
        this.themes = ['light', 'blue-filter', 'dark'];
        this.themeLabels = {
            'light': 'Switch to blue light filter mode',
            'blue-filter': 'Switch to dark mode', 
            'dark': 'Switch to light mode'
        };
        this.themeIcons = {
            'light': 'fas fa-eye',
            'blue-filter': 'fas fa-moon',
            'dark': 'fas fa-sun'
        };
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.themeToggle = null;
        this.themeIcon = null;
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }
    
    setupToggle() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Add keyboard support
            this.themeToggle.addEventListener('keydown', (e) => {
                AccessibilityUtils.handleKeydown(e, () => this.toggleTheme());
            });
            
            this.updateIcon();
        }
    }
    
    setTheme(theme) {
        const oldTheme = this.currentTheme;
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon();
        
        // Announce theme change to screen readers
        if (oldTheme !== theme) {
            const themeNames = {
                'light': 'Light',
                'blue-filter': 'Blue Light Filter',
                'dark': 'Dark'
            };
            AccessibilityUtils.announce(`Theme changed to ${themeNames[theme]} mode`);
        }
    }
    
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const newTheme = this.themes[nextIndex];
        
        // Add transition class for smooth toggle
        if (this.themeToggle) {
            this.themeToggle.classList.add('transitioning');
            setTimeout(() => {
                this.themeToggle.classList.remove('transitioning');
            }, 300);
        }
        
        this.setTheme(newTheme);
    }
    
    updateIcon() {
        if (this.themeIcon) {
            switch (this.currentTheme) {
                case 'dark':
                    this.themeIcon.className = 'fas fa-sun';
                    this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
                    break;
                case 'blue-filter':
                    this.themeIcon.className = 'fas fa-moon';
                    this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
                    break;
                default: // light
                    this.themeIcon.className = 'fas fa-eye';
                    this.themeToggle.setAttribute('aria-label', 'Switch to blue light filter mode');
                    break;
            }
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Theme Guide Popup System
class ThemeGuide {
    constructor() {
        this.hasShownGuide = localStorage.getItem('theme-guide-shown') === 'true';
        this.guideElement = null;
        this.init();
    }

    init() {
        // Show guide only for first-time visitors or if they haven't seen it
        if (!this.hasShownGuide) {
            // Quick delay for page load, but show popup quickly
            setTimeout(() => {
                this.showGuide();
            }, 500);
        }
    }

    showGuide() {
        if (this.guideElement) return; // Already showing

        // Prevent body scroll while popup is open
        document.body.style.overflow = 'hidden';

        this.guideElement = document.createElement('div');
        this.guideElement.id = 'theme-guide-popup';
        this.guideElement.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.6);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
                overflow: auto;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: var(--text-primary);
                    text-align: center;
                    position: relative;
                    animation: slideIn 0.3s ease-out;
                    margin: auto;
                    transform: translateZ(0);
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
                    <h3 style="
                        margin: 0 0 12px 0;
                        font-size: 20px;
                        color: var(--primary-color);
                        font-weight: 600;
                    ">Glad to see you here!!</h3>
                    <p style="
                        margin: 0 0 20px 0;
                        color: var(--text-secondary);
                        line-height: 1.5;
                        font-size: 14px;
                    ">
                        My portfolio features <strong>3 visual themes</strong> for your comfort:<br>
                        🌞 Light • 👁️ Blue Filter • 🌙 Dark
                    </p>
                    <div style="
                        background: var(--tertiary-bg);
                        border-radius: 8px;
                        padding: 16px;
                        margin: 16px 0;
                        border-left: 3px solid var(--primary-color);
                    ">
                        <div style="font-size: 24px; margin-bottom: 8px;">
                            <i id="guide-theme-icon" class="fas fa-sun"></i>
                        </div>
                        <p style="
                            margin: 0;
                            font-size: 13px;
                            color: var(--text-secondary);
                        ">
                            👆 Click the theme button in the top-right corner<br>
                            to switch between visual modes anytime!
                        </p>
                    </div>
                    <div style="
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                        margin-top: 20px;
                    ">
                        <button onclick="themeGuide.dismissGuide()" style="
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.transform='translateY(-1px)'" 
                           onmouseout="this.style.transform='translateY(0)'">
                            Got it! 👍
                        </button>
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
        `;

        document.body.appendChild(this.guideElement);

        // Add click outside to close
        this.guideElement.addEventListener('click', (e) => {
            if (e.target === this.guideElement) {
                this.dismissGuide();
            }
        });

        // Add escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.dismissGuide();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    dismissGuide() {
        if (this.guideElement) {
            // Restore body scroll
            document.body.style.overflow = '';
            
            this.guideElement.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (this.guideElement && this.guideElement.parentNode) {
                    this.guideElement.parentNode.removeChild(this.guideElement);
                }
                this.guideElement = null;
            }, 300);
        }
        
        // Mark as shown so it doesn't appear again
        localStorage.setItem('theme-guide-shown', 'true');
        this.hasShownGuide = true;
    }

    // Method to reset guide (for testing)
    resetGuide() {
        localStorage.removeItem('theme-guide-shown');
        this.hasShownGuide = false;
        console.log('🎨 Theme guide reset - will show on next page load');
    }

    // Method to manually show guide
    showGuideNow() {
        this.showGuide();
    }
}

// Initialize theme guide
const themeGuide = new ThemeGuide();

// Make guide functions available globally for testing
window.showThemeGuide = () => themeGuide.showGuideNow();
window.resetThemeGuide = () => themeGuide.resetGuide();

// Debug: Log theme guide status
console.log('🎨 Theme Guide Status:', {
    hasShownGuide: themeGuide.hasShownGuide,
    willShowAutomatically: !themeGuide.hasShownGuide
});

// Performance optimization - use passive listeners where possible
const passiveSupported = (() => {
    let passiveSupported = false;
    try {
        const options = Object.defineProperty({}, 'passive', {
            get: () => {
                passiveSupported = true;
                return false;
            },
        });
        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
    } catch (err) {
        passiveSupported = false;
    }
    return passiveSupported;
})();

// Initialize loading screen with enhanced animation
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced loading screen animation
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const loadingSubtitle = document.querySelector('.loading-subtitle');
    
    // Add entrance animations
    if (loadingText) {
        loadingText.style.animation = 'fadeInUp 0.5s ease forwards 0.1s';
        loadingText.style.opacity = '0';
    }
    
    if (loadingSubtitle) {
        loadingSubtitle.style.animation = 'fadeInUp 0.5s ease forwards 0.2s';
        loadingSubtitle.style.opacity = '0';
    }
    
    // Hide loading screen with stagger animation
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // Trigger entrance animations for main content
                document.body.classList.add('loaded');
            }, 400);
        }
    }, 800);
});

// Enhanced custom cursor functionality with performance optimization
document.addEventListener('DOMContentLoaded', function() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return; // Exit if elements don't exist
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let isVisible = false;
    
    // Throttle mouse movement for better performance
    let mouseMoveTimer = null;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isVisible) {
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
            isVisible = true;
        }
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        
        // Clear previous timer
        if (mouseMoveTimer) {
            clearTimeout(mouseMoveTimer);
        }
        
        // Set timer to hide cursor after inactivity
        mouseMoveTimer = setTimeout(() => {
            if (isVisible) {
                cursorDot.style.opacity = '0';
                cursorOutline.style.opacity = '0';
                isVisible = false;
            }
        }, 2000);
    }, passiveSupported ? { passive: true } : false);
    
    // Optimized cursor outline follow with requestAnimationFrame
    let animationId;
    function animateCursorOutline() {
        const ease = 0.15;
        const distance = Math.sqrt(Math.pow(mouseX - outlineX, 2) + Math.pow(mouseY - outlineY, 2));
        
        if (distance > 1) {
            outlineX += (mouseX - outlineX) * ease;
            outlineY += (mouseY - outlineY) * ease;
            
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
        }
        
        animationId = requestAnimationFrame(animateCursorOutline);
    }
    
    animationId = requestAnimationFrame(animateCursorOutline);
    
    // Enhanced cursor hover effects with better selectors
    const interactiveElements = document.querySelectorAll(`
        a, button, .btn, .nav-link, .project-card, 
        .contact-card, .skill-card, [role="button"], 
        input, textarea, select
    `);
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            cursorDot.style.transform = 'scale(2)';
            cursorOutline.style.transform = 'scale(2)';
            cursorDot.style.mixBlendMode = 'difference';
        }, passiveSupported ? { passive: true } : false);
        
        el.addEventListener('mouseleave', function() {
            cursorDot.style.transform = 'scale(1)';
            cursorOutline.style.transform = 'scale(1)';
            cursorDot.style.mixBlendMode = 'normal';
        }, passiveSupported ? { passive: true } : false);
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function() {
        if (isVisible) {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
            isVisible = false;
        }
    });
    
    // Show cursor when entering window
    document.addEventListener('mouseenter', function() {
        if (!isVisible) {
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
            isVisible = true;
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (mouseMoveTimer) {
            clearTimeout(mouseMoveTimer);
        }
    });
});

// Enhanced Mobile Navigation with Accessibility Support
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

if (navToggle && navMenu) {
    let isMenuOpen = false;
    
    // Set initial ARIA states
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('id', 'nav-menu');
    
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMenu();
    });
    
    // Keyboard support for menu toggle
    navToggle.addEventListener('keydown', function(e) {
        AccessibilityUtils.handleKeydown(e, () => toggleMenu());
    });
    
    // Handle Escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
            AccessibilityUtils.manageFocus(navToggle);
        }
    });
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', isMenuOpen);
        navToggle.setAttribute('aria-label', isMenuOpen ? 'Close navigation menu' : 'Open navigation menu');
        
        // Toggle menu visibility
        navMenu.classList.toggle('active', isMenuOpen);
        navToggle.classList.toggle('active', isMenuOpen);
        
        // Prevent body scroll when menu is open
        body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Announce menu state change
        AccessibilityUtils.announce(
            isMenuOpen ? 'Navigation menu opened' : 'Navigation menu closed'
        );
        
        // Enhanced hamburger animation with accessibility
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (isMenuOpen) {
                bar.style.transformOrigin = 'center';
                if (index === 0) {
                    bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                } else if (index === 1) {
                    bar.style.opacity = '0';
                    bar.style.transform = 'scale(0)';
                } else if (index === 2) {
                    bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                }
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });
        
        // Focus management
        if (isMenuOpen) {
            // Move focus to first menu item
            const firstFocusableElement = navMenu.querySelector('.nav-link');
            if (firstFocusableElement) {
                setTimeout(() => AccessibilityUtils.manageFocus(firstFocusableElement), 300);
            }
        } else {
            // Return focus to toggle button
            AccessibilityUtils.manageFocus(navToggle);
        }
    }
    
    // Enhanced mobile menu link handling
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            if (isMenuOpen) {
                // Add delay to see the click effect
                setTimeout(() => {
                    toggleMenu(); // Use the accessible toggle function
                }, 150);
            }
        });
        
        // Add keyboard navigation
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
                navToggle.focus();
            }
        });
    });
    
    function closeMobileMenu() {
        isMenuOpen = false;
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        body.style.overflow = '';
        
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    }
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize (desktop breakpoint)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMobileMenu();
            }
        }, 150);
    }, passiveSupported ? { passive: true } : false);
}

// Enhanced smooth scrolling with offset calculation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbar = document.querySelector('.navbar');
            const headerOffset = navbar ? navbar.offsetHeight : 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without jumping
            if (history.pushState) {
                history.pushState(null, null, this.getAttribute('href'));
            }
        }
    });
});

// Enhanced navbar scroll effect with throttling
let ticking = false;
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
}, passiveSupported ? { passive: true } : false);

// Enhanced active navigation link highlighting with throttling
let navTicking = false;
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= (sectionTop - 200) && scrollY < (sectionTop + sectionHeight - 200)) {
            current = sectionId;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + current) {
            link.classList.add('active');
        }
    });
    
    navTicking = false;
}

window.addEventListener('scroll', function() {
    if (!navTicking) {
        requestAnimationFrame(updateActiveNav);
        navTicking = true;
    }
}, passiveSupported ? { passive: true } : false);

// Enhanced Intersection Observer for animations with better performance
const observerOptions = {
    threshold: [0, 0.05],
    rootMargin: '0px 0px 50px 0px'
};

const animationObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const delay = element.dataset.delay || 0;
            
            setTimeout(() => {
                element.classList.add('animate-in');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                
                // Add stagger effect for child elements
                const children = element.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-in');
                    }, index * 20);
                });
            }, delay);
            
            // Unobserve after animation to improve performance
            animationObserver.unobserve(element);
        }
    });
}, observerOptions);

// Counter animation observer
const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target || counter.textContent);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
            counterObserver.unobserve(counter);
        }
    });
});

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Observe elements for animation with improved selectors
    const animateElements = document.querySelectorAll(`
        .project-card, .skill-card, .timeline-item, 
        .section-header, .about-card, .contact-card,
        .hero-stats .stat-item, .about-achievements
    `);
    
    animateElements.forEach((el, index) => {
        // Add initial styles for animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Add stagger delay
        el.dataset.delay = index * 20;
        
        animationObserver.observe(el);
    });
    
    // Observe counters
    const counters = document.querySelectorAll('.stat-item h3, .metric-value');
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // Add entrance animation to hero content
    const heroElements = document.querySelectorAll('.hero-title .title-line');
    heroElements.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.2}s`;
    });
});

// Enhanced parallax effect with performance optimization
let parallaxTicking = false;
function updateParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    const rateGrid = scrolled * -0.3;
    
    const heroParticles = document.querySelector('.hero-particles');
    const heroGrid = document.querySelector('.hero-grid');
    const heroOrbs = document.querySelectorAll('.gradient-orb');
    
    if (heroParticles) {
        heroParticles.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
    
    if (heroGrid) {
        heroGrid.style.transform = `translate3d(0, ${rateGrid}px, 0)`;
    }
    
    // Animate gradient orbs with different speeds
    heroOrbs.forEach((orb, index) => {
        const orbRate = scrolled * (-0.2 - index * 0.1);
        orb.style.transform = `translate3d(0, ${orbRate}px, 0)`;
    });
    
    parallaxTicking = false;
}

window.addEventListener('scroll', function() {
    if (!parallaxTicking && window.innerWidth > 768) { // Only on desktop
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
    }
}, passiveSupported ? { passive: true } : false);

// Enhanced project video handling with better UX
document.addEventListener('DOMContentLoaded', function() {
    const videoOverlays = document.querySelectorAll('.video-overlay');
    
    videoOverlays.forEach(overlay => {
        const video = overlay.parentElement.querySelector('video');
        const playButton = overlay.querySelector('.play-button');
        
        if (playButton && video) {
            playButton.addEventListener('click', function() {
                video.play().then(() => {
                    overlay.style.opacity = '0';
                    overlay.style.pointerEvents = 'none';
                }).catch(error => {
                    console.log('Video play failed:', error);
                });
            });
            
            // Show overlay when video ends
            video.addEventListener('ended', function() {
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
            });
            
            // Pause video when not in viewport
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                        overlay.style.opacity = '1';
                        overlay.style.pointerEvents = 'auto';
                    }
                });
            });
            
            videoObserver.observe(video);
        }
    });
});

// Performance monitoring and optimization
document.addEventListener('DOMContentLoaded', function() {
    // Add skip link for accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark if not exists
    const heroSection = document.querySelector('#hero');
    if (heroSection && !document.querySelector('main')) {
        heroSection.setAttribute('role', 'main');
        heroSection.setAttribute('id', 'main');
    }
    
    // Preload critical resources
    const criticalImages = document.querySelectorAll('img[data-preload]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
    });
    
    // Lazy load non-critical images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Add focus visible polyfill behavior
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('using-keyboard');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('using-keyboard');
    });
});

// Error handling and fallbacks
window.addEventListener('error', function(e) {
    console.warn('Portfolio script error:', e.error);
    // Graceful degradation - ensure basic functionality works
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    // Cancel any ongoing animations
    const observers = [animationObserver, counterObserver];
    observers.forEach(observer => {
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
    });
});

// ========================================
// CONTACT MODAL FUNCTIONALITY
// ========================================

// Modal functions
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="name"]');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = modal.querySelector('#contactForm');
        if (form) {
            form.reset();
            hideFormMessage();
        }
    }
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeContactModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeContactModal();
            }
        });
    }
});

// Form submission with EmailJS
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formData = new FormData(e.target);
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    hideFormMessage();
    
    try {
        // Prepare email data
        const emailData = {
            to_email: 'mukund.jangid95@gmail.com',
            from_name: formData.get('name'),
            from_email: formData.get('email'),
            company: formData.get('company') || 'Not specified',
            project_type: formData.get('project') || 'Not specified',
            message: formData.get('message'),
            timeline: formData.get('timeline') || 'Not specified',
            timestamp: new Date().toLocaleString()
        };
        
        // Send email using EmailJS (you'll need to set this up)
        const result = await sendEmailJS(emailData);
        
        if (result.success) {
            showFormMessage('Opening your email client... If it doesn\'t open automatically, please copy the email details and send to mukund.jangid95@gmail.com', 'success');
            
            // Reset form after delay
            setTimeout(() => {
                e.target.reset();
                closeContactModal();
            }, 3000);
        } else {
            throw new Error('Failed to send message');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage('Sorry, there was an error sending your message. Please try again or contact me directly at mukund.jangid95@gmail.com', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// EmailJS integration (you'll need to configure this)
async function sendEmailJS(emailData) {
    try {
        // For now, we'll use a fallback method
        // You can replace this with actual EmailJS configuration
        
        // Create mailto link as fallback
        const subject = `New Portfolio Contact: ${emailData.project_type}`;
        const body = `
Name: ${emailData.from_name}
Email: ${emailData.from_email}
Company: ${emailData.company}
Project Type: ${emailData.project_type}
Timeline: ${emailData.timeline}

Message:
${emailData.message}

Sent from: Portfolio Website
Time: ${emailData.timestamp}
        `.trim();
        
        const mailtoLink = `mailto:${emailData.to_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Try to open email client with fallback handling
        try {
            // Use window.location.href for better compatibility
            window.location.href = mailtoLink;
            
            // Show additional guidance after a short delay
            setTimeout(() => {
                const currentMessage = document.querySelector('.form-message');
                if (currentMessage && currentMessage.textContent.includes('Opening your email client')) {
                    showFormMessage(`Email client opened! If you don't see your email app, you can manually copy this email: mukund.jangid95@gmail.com`, 'info');
                }
            }, 2000);
            
        } catch (error) {
            // If mailto fails, show the email details for manual copying
            console.log('Mailto failed, showing manual copy option');
            showEmailDetails(emailData, subject, body);
        }
        
        return { success: true };
        
        /* 
        // Uncomment and configure this when you set up EmailJS
        const response = await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            emailData,
            'YOUR_PUBLIC_KEY'
        );
        return { success: true, response };
        */
        
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error };
    }
}

// Show email details for manual copying if mailto fails
function showEmailDetails(emailData, subject, body) {
    const modal = document.getElementById('contactModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Create elements instead of using template literals to avoid escaping issues
    modalContent.innerHTML = `
        <div class="email-details">
            <h4>Email Details (Copy & Send Manually)</h4>
            <p>Your email client couldn't open automatically. Please copy the details below:</p>
            <div class="email-field">
                <label>To:</label>
                <div class="email-value">
                    <input type="text" value="${emailData.to_email}" readonly>
                    <button onclick="copyToClipboard('${emailData.to_email}')" class="copy-btn">Copy</button>
                </div>
            </div>
            <div class="email-field">
                <label>Subject:</label>
                <div class="email-value">
                    <input type="text" value="${subject}" readonly>
                    <button onclick="copyToClipboard('${subject.replace(/'/g, "\\'")}', this)" class="copy-btn">Copy</button>
                </div>
            </div>
            <div class="email-field">
                <label>Message:</label>
                <div class="email-value">
                    <textarea readonly rows="8" id="emailBody">${body}</textarea>
                    <button onclick="copyEmailBody()" class="copy-btn">Copy</button>
                </div>
            </div>
            <div class="email-actions">
                <button onclick="location.reload()" class="btn btn-secondary">Start Over</button>
                <button onclick="closeContactModal()" class="btn btn-primary">Close</button>
            </div>
        </div>
    `;
}

// Helper functions for copying
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#10b981';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function copyEmailBody() {
    const textarea = document.getElementById('emailBody');
    const button = event.target;
    copyToClipboard(textarea.value, button);
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showFormMessage(message, type) {
    const modal = document.getElementById('contactModal');
    let messageDiv = modal.querySelector('.form-message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'form-message';
        const form = modal.querySelector('.contact-form');
        form.insertBefore(messageDiv, form.firstChild);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => hideFormMessage(), 5000);
    }
}

function hideFormMessage() {
    const modal = document.getElementById('contactModal');
    const messageDiv = modal?.querySelector('.form-message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}

// Make functions globally available
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;

// Enhanced hover effects for project cards
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            
            const icon = this.querySelector('.project-icon');
            if (icon) {
                icon.style.transform = 'rotateY(180deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            
            const icon = this.querySelector('.project-icon');
            if (icon) {
                icon.style.transform = 'rotateY(0deg)';
            }
        });
    });
});

// Typing animation for hero title
document.addEventListener('DOMContentLoaded', function() {
    const titleLines = document.querySelectorAll('.title-line');
    
    titleLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeInterval = setInterval(() => {
                line.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(typeInterval);
                }
            }, 50);
        }, index * 800);
    });
});

// Background particle animation
document.addEventListener('DOMContentLoaded', function() {
    createFloatingParticles();
});

function createFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'rgba(0, 212, 255, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `floatParticle ${5 + Math.random() * 5}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        hero.appendChild(particle);
    }
}

// Add keyframe animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
        }
        50% {
            transform: translateY(0px) translateX(20px);
            opacity: 0.5;
        }
        75% {
            transform: translateY(20px) translateX(-10px);
            opacity: 0.8;
        }
    }
`;
document.head.appendChild(style);

// Contact form handling with local storage (like analytics)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear any existing error messages
            clearFormErrors(contactForm);
            
            // Enhanced form validation
            const formData = new FormData(contactForm);
            const formObject = {};
            let isValid = true;
            const errors = {};
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'message'];
            
            requiredFields.forEach(field => {
                const input = contactForm.querySelector(`[name="${field}"]`);
                const value = input.value.trim();
                
                if (!value) {
                    isValid = false;
                    errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                    showFieldError(input, errors[field]);
                } else {
                    formObject[field] = value;
                    clearFieldError(input);
                }
            });
            
            // Get optional fields
            const optionalFields = ['company', 'project', 'timeline'];
            optionalFields.forEach(field => {
                const input = contactForm.querySelector(`[name="${field}"]`);
                if (input && input.value.trim()) {
                    formObject[field] = input.value.trim();
                }
            });
            
            // Email validation
            const emailField = contactForm.querySelector('[name="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formObject.email && !emailRegex.test(formObject.email)) {
                isValid = false;
                errors.email = 'Please enter a valid email address';
                showFieldError(emailField, errors.email);
            }
            
            // If validation fails, don't proceed and don't close form
            if (!isValid) {
                // Show general error message at top of form
                showFormError(contactForm, 'Please fix the errors below and try again.');
                return;
            }
            
            // Store contact form submission
            storeContactSubmission(formObject);
            
            // Submit form with visual feedback
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            submitButton.style.background = 'var(--gradient-accent)';
            
            setTimeout(() => {
                submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitButton.style.background = '#10b981';
                
                // Show success message in form
                showFormSuccess(contactForm, 'Thank you! Your message has been recorded successfully. I\'ll get back to you soon.');
                
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = 'var(--gradient-primary)';
                    submitButton.disabled = false;
                    contactForm.reset();
                    clearFormMessages(contactForm);
                    
                    // Close modal if it's open (only on success)
                    const modal = document.getElementById('contactModal');
                    if (modal && modal.style.display !== 'none') {
                        closeContactModal();
                    }
                }, 3000);
            }, 1500);
        });
    }
});

// Form validation helper functions
function showFieldError(input, message) {
    // Add error styling to input
    input.style.borderColor = '#ef4444';
    input.style.backgroundColor = '#fef2f2';
    
    // Find or create error message element
    let errorElement = input.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        `;
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorElement.style.display = 'flex';
}

function clearFieldError(input) {
    // Remove error styling
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    
    // Remove error message
    const errorElement = input.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function showFormError(form, message) {
    // Find or create form error element
    let errorElement = form.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.style.cssText = `
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        `;
        form.insertBefore(errorElement, form.firstChild.nextSibling);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    errorElement.style.display = 'flex';
    
    // Scroll to top of form to show error
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showFormSuccess(form, message) {
    // Find or create form success element
    let successElement = form.querySelector('.form-success');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.style.cssText = `
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        `;
        form.insertBefore(successElement, form.firstChild.nextSibling);
    }
    
    successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successElement.style.display = 'flex';
    
    // Scroll to top of form to show success
    successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearFormErrors(form) {
    // Remove all field errors
    const fieldErrors = form.querySelectorAll('.field-error');
    fieldErrors.forEach(error => error.remove());
    
    // Remove form error
    const formError = form.querySelector('.form-error');
    if (formError) {
        formError.remove();
    }
    
    // Reset field styling
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
    });
}

function clearFormMessages(form) {
    // Remove all messages (errors and success)
    const messages = form.querySelectorAll('.form-error, .form-success');
    messages.forEach(message => message.remove());
}

// Store contact form submissions in local storage
function storeContactSubmission(submissionData) {
    const storageKey = 'portfolio_contact_submissions';
    let submissions = [];
    
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            submissions = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading stored contact submissions:', e);
        submissions = [];
    }
    
    // Create submission object with timestamp and ID
    const submission = {
        id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        ...submissionData
    };
    
    // Add IP data if available
    getIPDetailsForContact().then(ipData => {
        if (ipData) {
            submission.ip = ipData;
            // Also store in the main IP tracking system
            storeContactIPData(ipData, submission);
        }
        
        submissions.push(submission);
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(submissions));
            console.log('✅ Contact submission stored with IP data:', submission);
            
            // Update global contact object for easy access
            window.portfolioContacts = {
                submissions: submissions,
                total: submissions.length,
                latest: submission
            };
            
        } catch (e) {
            console.error('Error storing contact submission:', e);
        }
    }).catch(error => {
        console.warn('Could not get IP data for contact:', error);
        
        // Save without IP data if API fails
        submissions.push(submission);
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(submissions));
            console.log('✅ Contact submission stored (no IP data):', submission);
            
            // Update global contact object for easy access
            window.portfolioContacts = {
                submissions: submissions,
                total: submissions.length,
                latest: submission
            };
            
        } catch (e) {
            console.error('Error storing contact submission:', e);
        }
    });
}

// Store contact form IP data in the main IP tracking system
function storeContactIPData(ipData, submissionData) {
    const storageKey = 'portfolio_ip_tracking';
    let ipTracking = {};
    
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            ipTracking = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Error reading IP tracking data for contact:', e);
        ipTracking = {};
    }
    
    // Initialize structure if needed
    if (!ipTracking.visitors) {
        ipTracking.visitors = {};
        ipTracking.totalVisits = 0;
        ipTracking.uniqueIPs = 0;
        ipTracking.countries = new Set();
        ipTracking.cities = new Set();
        ipTracking.lastUpdated = new Date().toISOString();
    }
    
    const ip = ipData.ip;
    const timestamp = submissionData.timestamp;
    
    // Update or create IP visitor record
    if (!ipTracking.visitors[ip]) {
        ipTracking.visitors[ip] = {
            ...ipData,
            firstSeen: timestamp,
            lastSeen: timestamp,
            visitCount: 0,
            sessions: [],
            contactSubmissions: []
        };
        ipTracking.uniqueIPs++;
    }
    
    // Add contact submission to visitor record
    ipTracking.visitors[ip].contactSubmissions.push({
        submissionId: submissionData.id,
        timestamp: timestamp,
        name: submissionData.name,
        email: submissionData.email,
        company: submissionData.company,
        project: submissionData.project
    });
    
    // Update visitor data
    ipTracking.visitors[ip].lastSeen = timestamp;
    
    // Update aggregated data
    if (ipData.country) ipTracking.countries.add(ipData.country);
    if (ipData.city) ipTracking.cities.add(ipData.city);
    ipTracking.lastUpdated = new Date().toISOString();
    
    try {
        // Convert Sets to Arrays for storage
        const toStore = {
            ...ipTracking,
            countries: Array.from(ipTracking.countries),
            cities: Array.from(ipTracking.cities)
        };
        localStorage.setItem(storageKey, JSON.stringify(toStore));
        
        // Update global object for easy access
        window.portfolioIPData = {
            ...ipTracking,
            countries: Array.from(ipTracking.countries),
            cities: Array.from(ipTracking.cities)
        };
        
        console.log('🌍 Contact IP data stored in tracking system for:', ip);
    } catch (e) {
        console.error('Error storing contact IP data:', e);
    }
}

// Get IP details for contact form (same as visit tracking)
async function getIPDetailsForContact() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            throw new Error('IP API request failed');
        }
        
        const data = await response.json();
        
        return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            countryCode: data.country_code,
            timezone: data.timezone,
            isp: data.org,
            latitude: data.latitude,
            longitude: data.longitude
        };
    } catch (error) {
        console.warn('Failed to get IP details for contact:', error);
        return null;
    }
}

// Get all contact submissions (accessible from console)
function getContactSubmissions() {
    const storageKey = 'portfolio_contact_submissions';
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const submissions = JSON.parse(stored);
            console.log('📧 Contact Submissions:', submissions);
            console.log(`📊 Total submissions: ${submissions.length}`);
            return submissions;
        } else {
            console.log('📧 No contact submissions found');
            return [];
        }
    } catch (e) {
        console.error('Error reading contact submissions:', e);
        return [];
    }
}

// Show contact submissions summary (accessible from console)
function showContactSummary() {
    const submissions = getContactSubmissions();
    if (submissions.length === 0) {
        console.log('📧 No contact submissions yet');
        return;
    }
    
    console.log('📧 CONTACT SUBMISSIONS SUMMARY');
    console.log('=' .repeat(50));
    
    submissions.forEach((submission, index) => {
        console.log(`📩 Submission ${index + 1}:`);
        console.log(`   Name: ${submission.name}`);
        console.log(`   Email: ${submission.email}`);
        console.log(`   Company: ${submission.company || 'Not specified'}`);
        console.log(`   Project: ${submission.project || 'Not specified'}`);
        console.log(`   Timeline: ${submission.timeline || 'Not specified'}`);
        console.log(`   Date: ${submission.date} at ${submission.time}`);
        if (submission.ip) {
            console.log(`   🌍 Location: ${submission.ip.city || 'Unknown'}, ${submission.ip.country || 'Unknown'}`);
            console.log(`   🌐 IP: ${submission.ip.ip}`);
            console.log(`   🏢 ISP: ${submission.ip.isp || 'Unknown'}`);
        } else {
            console.log(`   🌍 Location: IP data not available`);
        }
        console.log(`   Message: ${submission.message}`);
        console.log('   ' + '-'.repeat(40));
    });
    
    return submissions;
}

// Add to global window object for console access
window.getContactSubmissions = getContactSubmissions;
window.showContactSummary = showContactSummary;

// IP Data Management Functions
// Get all stored IP data (accessible from console)
function getIPData() {
    const storageKey = 'portfolio_ip_tracking';
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const ipData = JSON.parse(stored);
            // Convert arrays back to Sets for processing
            ipData.countries = new Set(ipData.countries);
            ipData.cities = new Set(ipData.cities);
            console.log('🌍 IP Tracking Data:', ipData);
            return ipData;
        } else {
            console.log('🌍 No IP tracking data found');
            return null;
        }
    } catch (e) {
        console.error('Error reading IP tracking data:', e);
        return null;
    }
}

// Show IP tracking summary (accessible from console)
function showIPSummary() {
    const ipData = getIPData();
    if (!ipData || Object.keys(ipData.visitors || {}).length === 0) {
        console.log('🌍 No IP tracking data available yet');
        return;
    }
    
    console.log('🌍 IP TRACKING SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📊 Total Visits: ${ipData.totalVisits}`);
    console.log(`🌐 Unique IP Addresses: ${ipData.uniqueIPs}`);
    console.log(`🗺️ Countries: ${Array.from(ipData.countries).join(', ')}`);
    console.log(`🏙️ Cities: ${Array.from(ipData.cities).join(', ')}`);
    console.log(`⏰ Last Updated: ${new Date(ipData.lastUpdated).toLocaleString()}`);
    console.log('');
    
    console.log('🔍 VISITOR DETAILS:');
    console.log('-' .repeat(50));
    
    const visitors = Object.values(ipData.visitors);
    const sortedVisitors = visitors.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
    
    sortedVisitors.forEach((visitor, index) => {
        console.log(`👤 Visitor ${index + 1}:`);
        console.log(`   🌐 IP: ${visitor.ip}`);
        console.log(`   📍 Location: ${visitor.city || 'Unknown'}, ${visitor.region || ''} ${visitor.country || 'Unknown'}`);
        console.log(`   🏢 ISP: ${visitor.isp || 'Unknown'}`);
        console.log(`   📊 Visits: ${visitor.visitCount}`);
        console.log(`   🕒 First Seen: ${new Date(visitor.firstSeen).toLocaleString()}`);
        console.log(`   🕐 Last Seen: ${new Date(visitor.lastSeen).toLocaleString()}`);
        console.log(`   📱 Recent Sessions: ${visitor.sessions.length}`);
        console.log('   ' + '-'.repeat(40));
    });
    
    return ipData;
}

// Get visitor details by IP (accessible from console)
function getVisitorByIP(ip) {
    const ipData = getIPData();
    if (!ipData || !ipData.visitors || !ipData.visitors[ip]) {
        console.log(`🌍 No data found for IP: ${ip}`);
        return null;
    }
    
    const visitor = ipData.visitors[ip];
    console.log(`👤 VISITOR DETAILS FOR ${ip}`);
    console.log('=' .repeat(50));
    console.log(`📍 Location: ${visitor.city || 'Unknown'}, ${visitor.region || ''} ${visitor.country || 'Unknown'}`);
    console.log(`🏢 ISP: ${visitor.isp || 'Unknown'}`);
    console.log(`🌐 Country Code: ${visitor.countryCode || 'Unknown'}`);
    console.log(`🕰️ Timezone: ${visitor.timezone || 'Unknown'}`);
    console.log(`📊 Total Visits: ${visitor.visitCount}`);
    console.log(`🕒 First Seen: ${new Date(visitor.firstSeen).toLocaleString()}`);
    console.log(`🕐 Last Seen: ${new Date(visitor.lastSeen).toLocaleString()}`);
    console.log('');
    console.log('📱 SESSION HISTORY:');
    console.log('-' .repeat(30));
    
    visitor.sessions.slice(-10).forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  Time: ${new Date(session.timestamp).toLocaleString()}`);
        console.log(`  New Session: ${session.isNewSession ? 'Yes' : 'No'}`);
        console.log(`  Referrer: ${session.referrer}`);
        console.log(`  Viewport: ${session.viewport.width}x${session.viewport.height}`);
        console.log('  ' + '-'.repeat(25));
    });
    
    return visitor;
}

// Clear IP tracking data (accessible from console)
function clearIPData() {
    const storageKey = 'portfolio_ip_tracking';
    try {
        localStorage.removeItem(storageKey);
        window.portfolioIPData = null;
        console.log('🗑️ IP tracking data cleared successfully');
        return 'IP data cleared';
    } catch (e) {
        console.error('Error clearing IP data:', e);
        return 'Error clearing IP data';
    }
}

// Export IP data as JSON (accessible from console)
function exportIPData() {
    const ipData = getIPData();
    if (!ipData) {
        console.log('🌍 No IP data to export');
        return null;
    }
    
    // Convert to exportable format
    const exportData = {
        ...ipData,
        countries: Array.from(ipData.countries),
        cities: Array.from(ipData.cities),
        exportedAt: new Date().toISOString()
    };
    
    console.log('📤 IP Data Export:', JSON.stringify(exportData, null, 2));
    return exportData;
}

// Add IP functions to global window object for console access
window.getIPData = getIPData;
window.showIPSummary = showIPSummary;
window.getVisitorByIP = getVisitorByIP;
window.clearIPData = clearIPData;
window.exportIPData = exportIPData;

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-based animations and effects
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
}, 16));

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
});

// Easter egg: Konami code
document.addEventListener('DOMContentLoaded', function() {
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            document.body.style.background = 'var(--gradient-accent)';
            setTimeout(() => {
                document.body.style.background = 'var(--primary-bg)';
            }, 2000);
        }
    });
});

// Initialize Visit Tracking
const visitTracker = new VisitTracker();

// Global function to show analytics dashboard (works everywhere)
window.showAnalytics = function() {
    console.log('📊 Showing analytics dashboard...');
    
    // Check if dashboard already exists
    if (document.getElementById('analytics-dashboard')) {
        console.log('📊 Dashboard already visible');
        return 'Dashboard already visible';
    }
    
    try {
        // Get analytics data
        const summary = window.portfolioAnalytics ? window.portfolioAnalytics.getSummary() : {
            totalVisits: 0,
            uniqueVisitors: 0,
            totalSessions: 0,
            averageTimeSpent: 0,
            maxScrollDepth: 0,
            sectionsViewed: 0,
            interactions: 0,
            themeChanges: 0
        };
        
        // Create dashboard
        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 300px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px;
                color: #1a202c;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 16px; color: #2563eb;">📊 Analytics</h3>
                    <button onclick="document.getElementById('analytics-dashboard').remove()" 
                            style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                <div style="display: grid; gap: 8px;">
                    <div>👥 <strong>Total Visits:</strong> ${summary.totalVisits}</div>
                    <div>🆔 <strong>Unique Visitors:</strong> ${summary.uniqueVisitors}</div>
                    <div>🔄 <strong>Sessions:</strong> ${summary.totalSessions}</div>
                    <div>⏱️ <strong>Avg Time:</strong> ${Math.round(summary.averageTimeSpent / 1000)}s</div>
                    <div>📜 <strong>Max Scroll:</strong> ${summary.maxScrollDepth}%</div>
                    <div>👀 <strong>Sections Viewed:</strong> ${summary.sectionsViewed}</div>
                    <div>🎯 <strong>Interactions:</strong> ${summary.interactions}</div>
                    <div>🎨 <strong>Theme Changes:</strong> ${summary.themeChanges}</div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <button onclick="showIPDetails()" 
                            style="width: 100%; padding: 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 10px;">
                        🌍 View IP Details
                    </button>
                    <div style="font-size: 12px; color: #64748b;">
                        <div>Analytics + IP tracking active</div>
                        <div>Data stored locally</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            const dash = document.getElementById('analytics-dashboard');
            if (dash) dash.remove();
        }, 10000);
        
        console.log('📊 Dashboard created successfully!');
        return 'Dashboard created successfully!';
        
    } catch (error) {
        console.error('❌ Error creating dashboard:', error);
        return 'Error: ' + error.message;
    }
};

// Make the tracker available globally
window.portfolioAnalytics = visitTracker;

// Additional helper functions
window.getAnalyticsSummary = function() {
    if (window.portfolioAnalytics) {
        const summary = window.portfolioAnalytics.getSummary();
        console.table(summary);
        return summary;
    } else {
        console.log('❌ Analytics not initialized yet');
        return null;
    }
};

window.clearAnalytics = function() {
    if (window.portfolioAnalytics) {
        window.portfolioAnalytics.clearData();
        console.log('🗑️ Analytics data cleared');
        return 'Data cleared';
    } else {
        console.log('❌ Analytics not initialized yet');
        return null;
    }
};

window.testAnalytics = function() {
    console.log('🧪 Testing analytics system...');
    console.log('✅ showAnalytics function:', typeof window.showAnalytics);
    console.log('✅ portfolioAnalytics object:', typeof window.portfolioAnalytics);
    console.log('✅ DOM ready:', document.readyState);
    
    if (window.portfolioAnalytics) {
        console.log('✅ Analytics working! Current data:');
        console.table(window.portfolioAnalytics.getSummary());
    }
    
    return 'Test complete - check console for results';
};

// IP Details viewer function
window.showIPDetails = function() {
    console.log('🌍 Showing IP details...');
    
    // Check if IP dashboard already exists
    if (document.getElementById('ip-dashboard')) {
        console.log('🌍 IP Dashboard already visible');
        return 'IP Dashboard already visible';
    }
    
    try {
        // Get analytics data with IP information
        const analytics = JSON.parse(localStorage.getItem('portfolio_analytics') || '{}');
        const visits = analytics.visits || [];
        
        // Get unique IP addresses and locations
        const ipData = {};
        const uniqueCountries = new Set();
        const uniqueCities = new Set();
        
        visits.forEach(visit => {
            if (visit.ip) {
                const ip = visit.ip.ip;
                if (!ipData[ip]) {
                    ipData[ip] = {
                        ...visit.ip,
                        visits: 0,
                        firstSeen: visit.timestamp,
                        lastSeen: visit.timestamp
                    };
                }
                ipData[ip].visits++;
                ipData[ip].lastSeen = visit.timestamp;
                
                if (visit.ip.country) uniqueCountries.add(visit.ip.country);
                if (visit.ip.city) uniqueCities.add(visit.ip.city);
            }
        });
        
        const ips = Object.values(ipData);
        const totalWithIP = visits.filter(v => v.ip).length;
        const totalWithoutIP = visits.length - totalWithIP;
        
        // Create IP dashboard
        const dashboard = document.createElement('div');
        dashboard.id = 'ip-dashboard';
        dashboard.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 20px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px;
                color: #1a202c;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 16px; color: #2563eb;">🌍 IP Analytics</h3>
                    <button onclick="document.getElementById('ip-dashboard').remove()" 
                            style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                
                <div style="display: grid; gap: 8px; margin-bottom: 15px;">
                    <div>🌐 <strong>Unique IPs:</strong> ${ips.length}</div>
                    <div>🗺️ <strong>Countries:</strong> ${uniqueCountries.size}</div>
                    <div>🏙️ <strong>Cities:</strong> ${uniqueCities.size}</div>
                    <div>✅ <strong>With IP Data:</strong> ${totalWithIP}</div>
                    <div>❌ <strong>Without IP Data:</strong> ${totalWithoutIP}</div>
                </div>
                
                ${ips.length > 0 ? `
                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">Recent Visitors:</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${ips.slice(-10).reverse().map(ip => `
                            <div style="background: #f8fafc; padding: 10px; border-radius: 4px; margin-bottom: 8px; font-size: 12px;">
                                <div><strong>IP:</strong> ${ip.ip}</div>
                                ${ip.city ? `<div>📍 ${ip.city}, ${ip.region || ''} ${ip.country || ''}</div>` : ''}
                                ${ip.isp ? `<div>🌐 ${ip.isp}</div>` : ''}
                                <div>📊 ${ip.visits} visit${ip.visits > 1 ? 's' : ''}</div>
                                <div style="color: #64748b;">Last: ${new Date(ip.lastSeen).toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 12px; color: #64748b;">
                        <div>IP tracking via ipapi.co</div>
                        <div>Privacy compliant</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            const dash = document.getElementById('ip-dashboard');
            if (dash) dash.remove();
        }, 15000);
        
        console.log('🌍 IP Dashboard created successfully!');
        console.log('📊 IP Summary:', {
            uniqueIPs: ips.length,
            countries: uniqueCountries.size,
            cities: uniqueCities.size,
            withIPData: totalWithIP,
            withoutIPData: totalWithoutIP
        });
        
        return 'IP Dashboard created successfully!';
        
    } catch (error) {
        console.error('❌ Error creating IP dashboard:', error);
        return 'Error: ' + error.message;
    }
};

// Analytics Dashboard (hidden feature)
function createAnalyticsDashboard() {
    const summary = visitTracker.getSummary();
    const analytics = visitTracker.getAnalytics();
    
    const dashboard = document.createElement('div');
    dashboard.id = 'analytics-dashboard';
    dashboard.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: var(--text-primary);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 16px; color: var(--primary-color);">📊 Analytics</h3>
                <button onclick="document.getElementById('analytics-dashboard').remove()" 
                        style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px;">&times;</button>
            </div>
            <div style="display: grid; gap: 8px;">
                <div>👥 <strong>Total Visits:</strong> ${summary.totalVisits}</div>
                <div>🆔 <strong>Unique Visitors:</strong> ${summary.uniqueVisitors}</div>
                <div>🔄 <strong>Sessions:</strong> ${summary.totalSessions}</div>
                <div>⏱️ <strong>Avg Time:</strong> ${Math.round(summary.averageTimeSpent / 1000)}s</div>
                <div>📜 <strong>Max Scroll:</strong> ${summary.maxScrollDepth}%</div>
                <div>👀 <strong>Sections Viewed:</strong> ${summary.sectionsViewed}</div>
                <div>🎯 <strong>Interactions:</strong> ${summary.interactions}</div>
                <div>🎨 <strong>Theme Changes:</strong> ${summary.themeChanges}</div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <div>Latest Visit: ${analytics.visits?.[analytics.visits.length - 1]?.timestamp?.split('T')[0] || 'N/A'}</div>
                    <div>Visitor ID: ${analytics.visits?.[analytics.visits.length - 1]?.visitorId?.split('_')[1] || 'N/A'}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dashboard);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        const dash = document.getElementById('analytics-dashboard');
        if (dash) dash.remove();
    }, 10000);
}

// Keyboard shortcut to show analytics (Cmd+Option+A on Mac, Ctrl+Alt+A on PC)
document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? e.metaKey : e.ctrlKey; // Cmd on Mac, Ctrl on PC
    
    // Debug logging
    if (modifierKey && e.altKey && e.key.toLowerCase() === 'a') {
        console.log('📊 Analytics shortcut triggered!');
        e.preventDefault();
        if (!document.getElementById('analytics-dashboard')) {
            createAnalyticsDashboard();
        }
    }
});

// Alternative: Double-click on page title to show analytics
document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.querySelector('h1, .hero-title, [data-analytics-trigger]');
    if (pageTitle) {
        let clickCount = 0;
        pageTitle.addEventListener('click', () => {
            clickCount++;
            setTimeout(() => { clickCount = 0; }, 500);
            
            if (clickCount === 2) { // Double click
                console.log('📊 Analytics dashboard triggered by double-click!');
                if (!document.getElementById('analytics-dashboard')) {
                    createAnalyticsDashboard();
                }
            }
        });
    }
});

// Debug: Add analytics summary to console in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('� Analytics Summary:', visitTracker.getSummary());
    
    // Make tracker available in console for debugging
    window.portfolioAnalytics = visitTracker;
    console.log('🔧 Analytics available in console as: window.portfolioAnalytics');
    console.log('🔧 Available commands:');
    console.log('   - window.portfolioAnalytics.getSummary()');
    console.log('   - window.portfolioAnalytics.exportData()');
    console.log('   - window.portfolioAnalytics.clearData()');
}

console.log('�🚀 Enhanced Portfolio Website Loaded Successfully!');
console.log('💫 Dark theme with advanced animations active');
console.log('🎯 Ready for professional showcasing');
console.log('📊 Visit tracking initialized');
