/* ============================================
   Typing Animation
   ============================================ */

const phrases = [
    'Manufacture Operations Developer',
    'Problem Solver',
    'System Architect',
    'Building the Future'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

/**
 * Animate typing effect for the hero section
 */
function typeText() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of phrase
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500;
    }

    setTimeout(typeText, typingSpeed);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', typeText);
