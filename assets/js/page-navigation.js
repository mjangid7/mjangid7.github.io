/**
 * Page Navigation System
 * Handles single-page app navigation between sections
 */

class PageNavigator {
    constructor() {
        this.currentSection = 'home';
        this.sections = ['home', 'about', 'experience', 'skills', 'education', 'projects', 'github-activity', 'contact'];
        this.init();
    }

    init() {
        // Hide all sections except home initially
        this.hideAllSectionsExceptHome();
        
        // Set up navigation listeners
        this.setupNavigationListeners();
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'home';
            this.navigateToSection(section, false);
        });
        
        // Handle initial hash
        const hash = window.location.hash.slice(1);
        if (hash && this.sections.includes(hash)) {
            this.navigateToSection(hash, true);
        }
    }

    hideAllSectionsExceptHome() {
        this.sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && sectionId !== 'home') {
                section.classList.add('page-hidden');
                section.setAttribute('aria-hidden', 'true');
            } else if (section && sectionId === 'home') {
                section.classList.remove('page-hidden');
                section.setAttribute('aria-hidden', 'false');
            }
        });
    }

    setupNavigationListeners() {
        // Get all navigation links including back-to-home buttons and next section buttons
        const navLinks = document.querySelectorAll('.nav-link, .hero-cta a[href^="#"], .back-to-home-btn, .breadcrumb-link, .btn-next-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const sectionId = href.slice(1);
                    
                    // Map hero to home
                    const targetSection = sectionId === 'hero' ? 'home' : sectionId;
                    
                    if (this.sections.includes(targetSection)) {
                        this.navigateToSection(targetSection, true);
                    }
                }
            });
        });
    }

    navigateToSection(sectionId, updateHistory = true) {
        if (this.currentSection === sectionId) return;

        const currentEl = document.getElementById(this.currentSection);
        const targetEl = document.getElementById(sectionId);

        if (!targetEl) return;

        // Update nav active state
        this.updateNavActiveState(sectionId);

        // Add transitioning class to body
        document.body.style.overflow = 'hidden';

        // Fade out current section with slide up
        if (currentEl) {
            currentEl.style.opacity = '0';
            currentEl.style.transform = 'translateY(-30px) scale(0.98)';
        }

        setTimeout(() => {
            // Hide current, show target
            if (currentEl) {
                currentEl.classList.add('page-hidden');
                currentEl.setAttribute('aria-hidden', 'true');
                // Reset transform for next time
                currentEl.style.transform = 'translateY(0) scale(1)';
            }

            targetEl.classList.remove('page-hidden');
            targetEl.setAttribute('aria-hidden', 'false');
            
            // Start from below with scale
            targetEl.style.opacity = '0';
            targetEl.style.transform = 'translateY(30px) scale(0.98)';

            // Trigger animation
            setTimeout(() => {
                targetEl.style.opacity = '1';
                targetEl.style.transform = 'translateY(0) scale(1)';
                document.body.style.overflow = '';
            }, 50);

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Update current section
            this.currentSection = sectionId;

            // Trigger lazy loading for the section
            if (window.lazyLoader) {
                window.lazyLoader.forceLoadSection(sectionId);
            }

            // Update URL
            if (updateHistory) {
                const url = sectionId === 'home' ? window.location.pathname : `#${sectionId}`;
                history.pushState({ section: sectionId }, '', url);
            }

            // Announce to screen readers
            this.announceNavigation(sectionId);
        }, 350);
    }

    updateNavActiveState(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href')?.slice(1);
            const linkSection = href === 'hero' ? 'home' : href;
            
            if (linkSection === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update breadcrumb
        this.updateBreadcrumb(sectionId);
    }

    updateBreadcrumb(sectionId) {
        const breadcrumbNav = document.getElementById('breadcrumb-nav');
        const breadcrumbCurrent = document.getElementById('breadcrumb-current');
        
        if (!breadcrumbNav || !breadcrumbCurrent) return;

        const sectionNames = {
            home: 'Home',
            about: 'About',
            experience: 'Experience',
            skills: 'Skills',
            education: 'Education',
            projects: 'Projects',
            'github-activity': 'GitHub',
            contact: 'Contact'
        };

        if (sectionId === 'home') {
            breadcrumbNav.style.display = 'none';
        } else {
            breadcrumbNav.style.display = 'flex';
            breadcrumbCurrent.textContent = sectionNames[sectionId] || sectionId;
        }
    }

    announceNavigation(sectionId) {
        const sectionNames = {
            home: 'Home',
            about: 'About',
            experience: 'Experience',
            skills: 'Skills',
            education: 'Education',
            projects: 'Projects',
            'github-activity': 'GitHub Activity',
            contact: 'Contact'
        };

        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${sectionNames[sectionId]} section`;
        document.body.appendChild(announcement);

        setTimeout(() => announcement.remove(), 1000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PageNavigator());
} else {
    new PageNavigator();
}
