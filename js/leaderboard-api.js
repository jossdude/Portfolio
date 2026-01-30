/* ============================================
   Global leaderboard API (Supabase)
   Set window.LEADERBOARD_CONFIG in index.html:
   { supabaseUrl: 'https://xxx.supabase.co', supabaseAnonKey: 'eyJ...' }
   ============================================ */

const LEADERBOARD_TABLE = 'catch_targets_scores';
const MAX_HIGH_SCORES = 10;

function getConfig() {
    return window.LEADERBOARD_CONFIG || null;
}

function isServerEnabled() {
    const c = getConfig();
    return !!(c && c.supabaseUrl && c.supabaseAnonKey);
}

function getHeaders() {
    const c = getConfig();
    return {
        'Content-Type': 'application/json',
        'apikey': c.supabaseAnonKey,
        'Authorization': 'Bearer ' + c.supabaseAnonKey,
        'Prefer': 'return=minimal'
    };
}

/**
 * Fetch top scores from the global leaderboard (Supabase).
 * @returns {Promise<Array<{name: string, score: number, created_at: string}>>}
 */
async function fetchHighScoresFromServer() {
    const c = getConfig();
    if (!c?.supabaseUrl || !c?.supabaseAnonKey) return null;
    const url = `${c.supabaseUrl.replace(/\/$/, '')}/rest/v1/${LEADERBOARD_TABLE}?select=name,score,created_at&order=score.desc&limit=${MAX_HIGH_SCORES}`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data.map(row => ({
            name: row.name || 'Player',
            score: Number(row.score) || 0,
            date: row.created_at || new Date().toISOString()
        })) : null;
    } catch (_) {
        return null;
    }
}

/**
 * Submit a score to the global leaderboard.
 * @param {string} name
 * @param {number} score
 * @returns {Promise<boolean>}
 */
async function submitScoreToServer(name, score) {
    const c = getConfig();
    if (!c?.supabaseUrl || !c?.supabaseAnonKey) return false;
    const url = `${c.supabaseUrl.replace(/\/$/, '')}/rest/v1/${LEADERBOARD_TABLE}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name: (name || 'Player').trim() || 'Player', score: Number(score) || 0 })
        });
        return res.ok;
    } catch (_) {
        return false;
    }
}
