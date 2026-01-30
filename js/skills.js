/* ============================================
   Skill Card Interactions
   ============================================ */

/**
 * Create particle burst effect for skill cards
 * @param {HTMLElement} element - The element to create particles around
 */
function createParticleBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'skill-particles';
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #6366f1, #f472b6);
            border-radius: 50%;
            left: ${centerX}px;
            top: ${centerY}px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(particle);

        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;

        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
    }
}

/**
 * Initialize skill card click interactions
 */
function initSkillCards() {
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.add('clicked');

            // Create particle burst effect
            createParticleBurst(this);

            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
        });

        // Keyboard accessibility
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.click();
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSkillCards);
