/* ============================================
   Easter Egg Mini Game
   ============================================ */

const HIGH_SCORE_KEY = 'catch-targets-high-scores';
const MAX_HIGH_SCORES = 10;

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
let highScoreListEl;

/**
 * Open the game modal
 */
function openGameModal() {
    gameModal.classList.add('active');
    gameModal.setAttribute('aria-hidden', 'false');
    resetGame();
    renderHighScores();
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
 * Get high scores from localStorage (fallback when server is off or unavailable)
 */
function getHighScoresLocal() {
    try {
        const raw = localStorage.getItem(HIGH_SCORE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveHighScoresLocal(scores) {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    } catch (_) {}
}

/**
 * Fetch scores: from server if configured, else from localStorage
 */
async function fetchHighScores() {
    if (typeof fetchHighScoresFromServer === 'function' && isServerEnabled()) {
        const server = await fetchHighScoresFromServer();
        if (Array.isArray(server) && server.length >= 0) return server;
    }
    return getHighScoresLocal();
}

/**
 * Add a score: submit to server if configured, else save to localStorage
 */
async function addHighScore(name, playerScore) {
    const entry = { name: (name || 'Player').trim() || 'Player', score: playerScore, date: new Date().toISOString() };
    if (typeof submitScoreToServer === 'function' && isServerEnabled()) {
        const ok = await submitScoreToServer(entry.name, entry.score);
        if (ok) {
            await renderHighScores();
            return;
        }
    }
    // Server off or failed: fall back to localStorage
    const scores = getHighScoresLocal();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    saveHighScoresLocal(scores.slice(0, MAX_HIGH_SCORES));
    renderHighScoresWith(scores.slice(0, MAX_HIGH_SCORES));
}

/**
 * Render the high score table (async: fetches from server if configured)
 */
function renderHighScoresWith(scores) {
    if (!highScoreListEl) return;
    const list = Array.isArray(scores) ? scores : [];
    highScoreListEl.innerHTML = list.length
        ? list.map((e, i) => `<li><span class="hs-rank">${i + 1}</span><span class="hs-name">${escapeHtml(e.name)}</span><span class="hs-score">${e.score}</span></li>`).join('')
        : '<li class="hs-empty">No scores yet. Play to claim the top!</li>';
}

async function renderHighScores() {
    if (!highScoreListEl) return;
    highScoreListEl.innerHTML = '<li class="hs-loading">Loading…</li>';
    const scores = await fetchHighScores();
    renderHighScoresWith(scores);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        (async () => {
            const scores = await fetchHighScores();
            const isHighScore = scores.length < MAX_HIGH_SCORES || score > (scores[MAX_HIGH_SCORES - 1]?.score ?? -1);
            if (isHighScore && score > 0) {
                const name = prompt('High score! Enter your name (or leave blank):', 'Player') ?? 'Player';
                await addHighScore(name, score);
            } else {
                await renderHighScores();
            }
        })();
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
    highScoreListEl = document.getElementById('high-score-list');

    // Return early if game elements don't exist
    if (!gameModal || !easterEggTrigger) return;

    renderHighScores();

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
