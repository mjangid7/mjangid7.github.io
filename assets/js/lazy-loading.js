/**
 * Lazy Loading System
 * Defers loading of heavy images and graphs until sections are navigated to
 */

class LazyLoader {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        // Listen for section navigation events
        this.setupSectionObserver();
        
        // Set up lazy loading for images with data-src
        this.setupImageLazyLoading();
    }

    setupSectionObserver() {
        const sections = ['github-activity', 'projects', 'about'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadSectionContent(sectionId);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });

            observer.observe(section);
            this.observers.set(sectionId, observer);
        });
    }

    loadSectionContent(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Load all lazy images in this section
        const lazyImages = section.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('lazy-loaded');
            }
        });

        // Special handling for GitHub images
        if (sectionId === 'github-activity') {
            this.loadGitHubContent();
        }

        // Announce to console
        console.log(`✓ Loaded content for section: ${sectionId}`);
    }

    loadGitHubContent() {
        const githubSection = document.getElementById('github-activity');
        if (!githubSection) return;

        // Load GitHub stats images
        const statsImages = githubSection.querySelectorAll('img[data-src]');
        statsImages.forEach(img => {
            const src = img.dataset.src;
            if (src) {
                // Create a new image to test loading
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = src;
                    img.classList.add('lazy-loaded');
                    img.removeAttribute('data-src');
                };
                testImg.onerror = () => {
                    console.warn('Failed to load GitHub image:', src);
                    img.alt = 'Image failed to load';
                    img.classList.add('lazy-error');
                };
                testImg.src = src;
            }
        });
    }

    setupImageLazyLoading() {
        // Set up lazy loading for all images with data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('lazy-loaded');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px',
                threshold: 0.01
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }

    // Public method to force load a section
    forceLoadSection(sectionId) {
        this.loadSectionContent(sectionId);
    }

    // Destroy all observers
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize when DOM is ready
let lazyLoader;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoader = new LazyLoader();
    });
} else {
    lazyLoader = new LazyLoader();
}

// Export for use in other scripts
window.LazyLoader = LazyLoader;
window.lazyLoader = lazyLoader;
