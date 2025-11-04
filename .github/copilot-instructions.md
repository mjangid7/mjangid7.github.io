<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Portfolio Website - Copilot Instructions

Modern portfolio website for Mukund Jangid showcasing technical product management expertise and full-stack engineering background. This is a vanilla HTML/CSS/JS static site with Redis backend integration for analytics and contact management.

## Architecture Overview

**File Structure Pattern:**
- `index.html` - Single-page application with semantic sections and accessibility features
- `assets/css/styles.css` - CSS custom properties with three-theme system implementation
- `assets/css/modal-popups.css` - Detailed modal popups for enhanced interactivity
- `assets/js/script.js` - Core portfolio functionality and theme management
- `assets/js/redis-integration.js` - Redis backend integration for analytics and contacts
- `assets/js/modal-system.js` - Interactive popup system for detailed content
- `backend/` - Node.js/Express API server with Redis integration
- GitHub Actions workflow for automated deployment

## Redis Backend Integration (NEW)

**API Architecture:**
- Express.js server with Redis client for data persistence
- Nodemailer integration for email notifications
- CORS-enabled endpoints for cross-origin requests
- Fallback to localStorage when Redis API unavailable

**Key Endpoints:**
- `POST /api/visits` - Track page visits with unique visitor identification
- `GET /api/analytics` - Retrieve visit statistics and metrics
- `POST /api/contact` - Process contact form with email automation
- `GET /api/contacts` - Admin endpoint for contact submissions

**Data Patterns:**
- Visit tracking with Redis hashes and sets for unique visitors
- Real-time analytics counters and recent visits lists
- Contact form data persistence with automated email workflows

## Three-Theme System (Critical Pattern)

**Theme Cycling:** Light → Blue Light Filter → Dark
```css
:root { /* Light theme variables */ }
[data-theme="blue-filter"] { /* 60% blue light reduction */ }
[data-theme="dark"] { /* Dark theme variables */ }
```

**Implementation Details:**
- ThemeManager class handles cycling through themes
- CSS custom properties enable smooth transitions
- localStorage persistence with `theme` key
- Icons change per theme: fa-eye → fa-moon → fa-sun
- Blue filter theme uses amber/sepia overlays for eye comfort

## Key JavaScript Classes

**ThemeManager:** Three-theme cycling with accessibility announcements
**RedisVisitTracker:** Server-based analytics with fallback to localStorage
**RedisContactForm:** Backend-integrated contact management with email automation
**DetailedModalSystem:** Interactive popups for "What I Do", "Current Focus", "Key Achievements"
**ThemeGuide:** First-visit popup explaining theme options
**AccessibilityUtils:** ARIA announcements and keyboard navigation helpers

## Interactive Modal System (NEW)

**Clickable Sections:** Enhanced about page with detailed popups
- "What I Do" modal with comprehensive technical expertise breakdown
- "Current Focus" modal featuring cutting-edge technologies and research
- "Key Achievements" modal with detailed metrics and project outcomes

**Modal Architecture:**
- Semantic HTML with proper ARIA attributes for accessibility
- CSS Grid layouts with responsive design patterns
- JavaScript event delegation with keyboard navigation support
- Analytics tracking for modal interactions and engagement

## Development Patterns

**CSS Architecture:**
- CSS custom properties for all colors/spacing
- Mobile-first responsive design with theme-aware modals
- Component-based styling (`.card`, `.btn-*`, `.section-*`, `.modal-*`)
- Animation classes with performance optimizations

**Backend Integration:**
- API retry logic with exponential backoff
- Graceful degradation when backend unavailable
- Environment-based configuration for development/production
- Redis data structures optimized for analytics queries

**Performance Features:**
- Passive event listeners where possible
- Intersection Observer for scroll animations
- Throttled scroll handlers with modal interaction tracking
- Image optimization with loading="eager" for hero

## Deploy Commands

```bash
# Backend setup
cd backend && npm install && npm run dev

# Frontend development  
open index.html  # or use task "Open Portfolio Website"

# Redis local setup
redis-server

# Full stack development
npm run dev  # (from backend directory)
open index.html  # (serve frontend)

# Production deployment
git push origin main  # Auto-deploy via GitHub Actions
```

**Environment Setup:**
- Configure `.env` file with Redis URL and email credentials
- Set up Gmail App Password for email automation
- Update API base URL for production deployment

## Content Strategy

Portfolio emphasizes AI/Platform Engineering expertise with US Patent WO2024233807A1 for regulatory automation. Companies section features Fortune 500 logos with semantic links. Projects showcase technical depth with external documentation links. Enhanced interactivity through detailed modal content showcasing comprehensive technical expertise.

**Debug Functions:**
- `getAnalytics()` - View Redis analytics data
- `trackEvent(type, data)` - Manual event tracking
- `openDetailedModal(type)` - Test modal functionality
- `getModalStatus()` - Check modal state

When editing themes, always test all three states. When adding animations, ensure accessibility compliance. Contact form data is stored in Redis with email automation. Check browser console and Redis CLI for debugging data flows.
