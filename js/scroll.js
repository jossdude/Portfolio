/* ============================================
   Scroll Animations & Navigation
   ============================================ */

/**
 * Initialize Intersection Observer for scroll animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections except hero (which is already visible)
    document.querySelectorAll('section:not(.hero)').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Initialize smooth scroll for navigation links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize logo click to scroll to top
 */
function initLogoScroll() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    logo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    logo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Initialize all scroll functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScroll();
    initLogoScroll();
});
