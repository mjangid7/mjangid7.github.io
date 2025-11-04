// Enhanced Modal System for Detailed Information Popups

class DetailedModalSystem {
    constructor() {
        this.activeModal = null;
        this.modalData = {
            'what-i-do': 'what-i-do-modal',
            'current-focus': 'current-focus-modal', 
            'key-achievements': 'key-achievements-modal'
        };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Add click handlers to clickable sections
        const clickableSections = document.querySelectorAll('.clickable-section[data-modal]');
        clickableSections.forEach(section => {
            section.addEventListener('click', (e) => this.handleSectionClick(e));
            section.addEventListener('keydown', (e) => this.handleSectionKeydown(e));
            
            // Add ARIA attributes for accessibility
            section.setAttribute('role', 'button');
            section.setAttribute('tabindex', '0');
            section.setAttribute('aria-haspopup', 'dialog');
            section.setAttribute('aria-expanded', 'false');
        });

        // Add close handlers to all modal close buttons
        const closeButtons = document.querySelectorAll('.details-modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Add overlay click to close
        const overlays = document.querySelectorAll('.details-modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        });

        // Add escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });

        console.log('🎯 Detailed modal system initialized');
    }

    handleSectionClick(e) {
        e.preventDefault();
        const modalType = e.currentTarget.dataset.modal;
        this.openModal(modalType);
        
        // Track interaction
        if (typeof visitTracker !== 'undefined' && visitTracker.trackEvent) {
            visitTracker.trackEvent('modal_opened', { 
                modalType,
                section: e.currentTarget.textContent.trim()
            });
        }
    }

    handleSectionKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleSectionClick(e);
        }
    }

    openModal(modalType) {
        const modalId = this.modalData[modalType];
        if (!modalId) {
            console.error(`Modal type "${modalType}" not found`);
            return;
        }

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal element "${modalId}" not found`);
            return;
        }

        // Close any existing modal first
        if (this.activeModal) {
            this.closeModal();
        }

        // Open the new modal
        this.activeModal = modal;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show modal with animation
        modal.classList.add('active');
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstFocusable = modal.querySelector('.details-modal-close');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        // Update ARIA attributes
        const trigger = document.querySelector(`[data-modal="${modalType}"]`);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }

        // Announce to screen readers
        if (typeof AccessibilityUtils !== 'undefined') {
            const modalTitle = modal.querySelector('.details-modal-header h3');
            const title = modalTitle ? modalTitle.textContent : 'Detailed information modal';
            AccessibilityUtils.announce(`${title} opened`);
        }

        console.log(`📖 Opened detailed modal: ${modalType}`);
    }

    closeModal() {
        if (!this.activeModal) return;

        const modalType = Object.keys(this.modalData).find(
            key => this.modalData[key] === this.activeModal.id
        );

        // Hide modal
        this.activeModal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Update ARIA attributes
        if (modalType) {
            const trigger = document.querySelector(`[data-modal="${modalType}"]`);
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
                // Return focus to trigger for accessibility
                trigger.focus();
            }
        }

        // Clear active modal
        this.activeModal = null;

        // Announce to screen readers
        if (typeof AccessibilityUtils !== 'undefined') {
            AccessibilityUtils.announce('Modal closed');
        }

        // Track interaction
        if (typeof visitTracker !== 'undefined' && visitTracker.trackEvent) {
            visitTracker.trackEvent('modal_closed', { modalType });
        }

        console.log(`📖 Closed detailed modal: ${modalType}`);
    }

    // Method to programmatically open modals (for testing/debugging)
    openModalByType(modalType) {
        this.openModal(modalType);
    }

    // Method to check if modal is open
    isModalOpen() {
        return this.activeModal !== null;
    }

    // Method to get current modal type
    getCurrentModalType() {
        if (!this.activeModal) return null;
        
        return Object.keys(this.modalData).find(
            key => this.modalData[key] === this.activeModal.id
        );
    }
}

// Initialize the modal system
const detailedModalSystem = new DetailedModalSystem();

// Make modal functions available globally
window.openDetailedModal = (modalType) => detailedModalSystem.openModalByType(modalType);
window.closeDetailedModal = () => detailedModalSystem.closeModal();

// Debug functions
window.getModalStatus = () => ({
    isOpen: detailedModalSystem.isModalOpen(),
    currentModal: detailedModalSystem.getCurrentModalType(),
    availableModals: Object.keys(detailedModalSystem.modalData)
});

// Analytics tracking for modal interactions
if (typeof visitTracker !== 'undefined') {
    // Track modal hover events
    document.addEventListener('DOMContentLoaded', () => {
        const clickableSections = document.querySelectorAll('.clickable-section[data-modal]');
        clickableSections.forEach(section => {
            let hoverTimeout;
            
            section.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => {
                    visitTracker.trackEvent('modal_hover', {
                        modalType: section.dataset.modal,
                        section: section.textContent.trim()
                    });
                }, 2000); // Track if hovered for more than 2 seconds
            });
            
            section.addEventListener('mouseleave', () => {
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                }
            });
        });
    });
}

console.log('🎯 Detailed modal system loaded and ready');
console.log('📖 Available modals:', Object.keys(detailedModalSystem.modalData));
console.log('🔧 Use openDetailedModal(type) to test modals manually');