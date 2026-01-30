/* ============================================
   Particle Background System
   ============================================ */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;
let animationId;

/**
 * Resize canvas to match window dimensions
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Particle class - represents a single animated particle
 */
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        // Color variation between primary and secondary
        const colors = ['99, 102, 241', '244, 114, 182', '52, 211, 153'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Mouse interaction - particles move away from cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const force = (150 - distance) / 150;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

/**
 * Initialize particle array based on screen size
 */
function initParticles() {
    particles = [];
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

/**
 * Draw connections between nearby particles
 */
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 120)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

/**
 * Main animation loop
 */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animate);
}

/**
 * Initialize the particle system
 */
function initParticleSystem() {
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Performance: Pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initParticleSystem);
