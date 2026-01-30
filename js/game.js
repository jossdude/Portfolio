/* ============================================
   Easter Egg Mini Game
   ============================================ */

let score = 0;
let timeLeft = 15;
let gameInterval;
let targetInterval;
let isGameRunning = false;

// DOM elements (initialized after DOM loads)
let gameModal;
let gameArea;
let scoreDisplay;
let timerDisplay;
let startButton;
let closeButton;
let easterEggTrigger;

/**
 * Open the game modal
 */
function openGameModal() {
    gameModal.classList.add('active');
    gameModal.setAttribute('aria-hidden', 'false');
    resetGame();
}

/**
 * Close the game modal
 */
function closeGame() {
    gameModal.classList.remove('active');
    gameModal.setAttribute('aria-hidden', 'true');
    endGame();
}

/**
 * Reset game state
 */
function resetGame() {
    score = 0;
    timeLeft = 15;
    scoreDisplay.textContent = '0';
    timerDisplay.textContent = '15';
    gameArea.innerHTML = '';
    startButton.textContent = 'Start Game';
    startButton.disabled = false;
    isGameRunning = false;
}

/**
 * Start the game
 */
function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    score = 0;
    timeLeft = 15;
    scoreDisplay.textContent = '0';
    startButton.textContent = 'Playing...';
    startButton.disabled = true;

    // Timer countdown
    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Spawn targets
    spawnTarget();
    targetInterval = setInterval(spawnTarget, 800);
}

/**
 * End the game
 */
function endGame() {
    clearInterval(gameInterval);
    clearInterval(targetInterval);
    isGameRunning = false;
    gameArea.innerHTML = '';

    if (timeLeft <= 0) {
        startButton.textContent = `Game Over! Score: ${score}`;
        setTimeout(() => {
            startButton.textContent = 'Play Again';
            startButton.disabled = false;
        }, 2000);
    }
}

/**
 * Spawn a new target in the game area
 */
function spawnTarget() {
    if (!isGameRunning) return;

    const target = document.createElement('div');
    target.className = 'game-target';
    target.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    `;

    // Random position within game area
    const maxX = gameArea.clientWidth - 40;
    const maxY = gameArea.clientHeight - 40;
    target.style.left = Math.random() * maxX + 'px';
    target.style.top = Math.random() * maxY + 'px';

    target.addEventListener('click', () => {
        if (!isGameRunning) return;
        score++;
        scoreDisplay.textContent = score;

        // Pop animation
        target.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.5)', opacity: 0 }
        ], {
            duration: 200,
            easing: 'ease-out'
        }).onfinish = () => target.remove();
    });

    gameArea.appendChild(target);

    // Remove target after a delay if not clicked
    setTimeout(() => {
        if (target.parentNode) {
            target.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], {
                duration: 200
            }).onfinish = () => target.remove();
        }
    }, 1500);
}

/**
 * Initialize the game
 */
function initGame() {
    // Get DOM elements
    gameModal = document.getElementById('game-modal');
    gameArea = document.getElementById('game-area');
    scoreDisplay = document.getElementById('score');
    timerDisplay = document.querySelector('.game-timer');
    startButton = document.getElementById('start-game');
    closeButton = document.querySelector('.close-game');
    easterEggTrigger = document.querySelector('.easter-egg-trigger');

    // Return early if game elements don't exist
    if (!gameModal || !easterEggTrigger) return;

    // Event listeners
    easterEggTrigger.addEventListener('click', openGameModal);
    closeButton.addEventListener('click', closeGame);
    startButton.addEventListener('click', startGame);

    // Close on backdrop click
    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) closeGame();
    });

    // Keyboard close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameModal.classList.contains('active')) {
            closeGame();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);
