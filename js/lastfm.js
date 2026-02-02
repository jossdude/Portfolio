/**
 * Last.fm Integration
 * Fetches and displays Last.fm stats: currently playing track and top artist
 */

(function() {
    'use strict';

    const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';

    /**
     * Check if Last.fm is configured
     */
    function isConfigured() {
        return window.LASTFM_CONFIG &&
               window.LASTFM_CONFIG.apiKey &&
               window.LASTFM_CONFIG.username;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Make a Last.fm API request
     */
    async function apiRequest(method, params = {}) {
        if (!isConfigured()) return null;

        const { apiKey, username } = window.LASTFM_CONFIG;
        const url = new URL(LASTFM_API_BASE);
        url.searchParams.set('method', method);
        url.searchParams.set('user', username);
        url.searchParams.set('api_key', apiKey);
        url.searchParams.set('format', 'json');

        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Last.fm API error:', error);
            return null;
        }
    }

    /**
     * Get the currently playing or most recent track
     */
    async function getNowPlaying() {
        const data = await apiRequest('user.getRecentTracks', { limit: 1 });
        if (!data || !data.recenttracks || !data.recenttracks.track) return null;

        const tracks = data.recenttracks.track;
        const track = Array.isArray(tracks) ? tracks[0] : tracks;
        if (!track) return null;

        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

        return {
            name: track.name,
            artist: track.artist['#text'] || track.artist.name,
            album: track.album ? track.album['#text'] : null,
            image: getTrackImage(track),
            url: track.url,
            isNowPlaying: isNowPlaying
        };
    }

    /**
     * Get the top artist for the specified period
     */
    async function getTopArtist(period = '12month') {
        const data = await apiRequest('user.getTopArtists', { period, limit: 1 });
        if (!data || !data.topartists || !data.topartists.artist) return null;

        const artists = data.topartists.artist;
        const artist = Array.isArray(artists) ? artists[0] : artists;
        if (!artist) return null;

        return {
            name: artist.name,
            playcount: parseInt(artist.playcount, 10),
            image: getArtistImage(artist),
            url: artist.url
        };
    }

    /**
     * Extract the best available image from track data
     */
    function getTrackImage(track) {
        if (!track.image || !Array.isArray(track.image)) return null;
        // Prefer large or medium size
        const sizes = ['large', 'medium', 'small'];
        for (const size of sizes) {
            const img = track.image.find(i => i.size === size);
            if (img && img['#text']) return img['#text'];
        }
        return null;
    }

    /**
     * Extract the best available image from artist data
     */
    function getArtistImage(artist) {
        if (!artist.image || !Array.isArray(artist.image)) return null;
        const sizes = ['large', 'medium', 'small'];
        for (const size of sizes) {
            const img = artist.image.find(i => i.size === size);
            if (img && img['#text']) return img['#text'];
        }
        return null;
    }

    /**
     * Render the now playing section
     */
    function renderNowPlaying(container, track) {
        if (!track) {
            container.innerHTML = `
                <div class="lastfm-empty">
                    <span class="lastfm-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                    </span>
                    <p>Nothing playing right now</p>
                </div>
            `;
            return;
        }

        const statusText = track.isNowPlaying ? 'Now Playing' : 'Last Played';
        const statusClass = track.isNowPlaying ? 'lastfm-status-live' : 'lastfm-status-recent';
        const imageHtml = track.image
            ? `<img src="${escapeHtml(track.image)}" alt="${escapeHtml(track.album || track.name)}" class="lastfm-track-image"/>`
            : `<div class="lastfm-track-image lastfm-track-image-placeholder">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M9 18V5l12-2v13"/>
                       <circle cx="6" cy="18" r="3"/>
                       <circle cx="18" cy="16" r="3"/>
                   </svg>
               </div>`;

        container.innerHTML = `
            <div class="lastfm-track">
                <div class="lastfm-status ${statusClass}">
                    ${track.isNowPlaying ? '<span class="lastfm-pulse"></span>' : ''}
                    ${statusText}
                </div>
                ${imageHtml}
                <div class="lastfm-track-info">
                    <a href="${escapeHtml(track.url)}" target="_blank" rel="noopener noreferrer" class="lastfm-track-name">
                        ${escapeHtml(track.name)}
                    </a>
                    <p class="lastfm-track-artist">${escapeHtml(track.artist)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render the top artist section
     */
    function renderTopArtist(container, artist) {
        if (!artist) {
            container.innerHTML = `
                <div class="lastfm-empty">
                    <span class="lastfm-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </span>
                    <p>No data available</p>
                </div>
            `;
            return;
        }

        const imageHtml = artist.image
            ? `<img src="${escapeHtml(artist.image)}" alt="${escapeHtml(artist.name)}" class="lastfm-artist-image"/>`
            : `<div class="lastfm-artist-image lastfm-artist-image-placeholder">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                       <circle cx="12" cy="7" r="4"/>
                   </svg>
               </div>`;

        container.innerHTML = `
            <div class="lastfm-artist">
                <div class="lastfm-label">Top Artist (12 months)</div>
                ${imageHtml}
                <div class="lastfm-artist-info">
                    <a href="${escapeHtml(artist.url)}" target="_blank" rel="noopener noreferrer" class="lastfm-artist-name">
                        ${escapeHtml(artist.name)}
                    </a>
                    <p class="lastfm-artist-plays">${artist.playcount.toLocaleString()} plays</p>
                </div>
            </div>
        `;
    }

    /**
     * Show error state
     */
    function showError(container) {
        container.innerHTML = `
            <div class="lastfm-error">
                <p>Unable to load Last.fm data</p>
            </div>
        `;
    }

    /**
     * Show not configured state
     */
    function showNotConfigured(section) {
        section.style.display = 'none';
    }

    /**
     * Initialize the Last.fm section
     */
    async function init() {
        const section = document.getElementById('lastfm');
        const nowPlayingContainer = document.getElementById('lastfm-now-playing');
        const topArtistContainer = document.getElementById('lastfm-top-artist');

        if (!section || !nowPlayingContainer || !topArtistContainer) return;

        if (!isConfigured()) {
            showNotConfigured(section);
            return;
        }

        try {
            // Fetch both in parallel
            const [track, artist] = await Promise.all([
                getNowPlaying(),
                getTopArtist('12month')
            ]);

            renderNowPlaying(nowPlayingContainer, track);
            renderTopArtist(topArtistContainer, artist);
        } catch (error) {
            console.error('Failed to load Last.fm data:', error);
            showError(nowPlayingContainer);
            showError(topArtistContainer);
        }
    }

    /**
     * Auto-refresh now playing every 30 seconds
     */
    function startAutoRefresh() {
        if (!isConfigured()) return;

        setInterval(async () => {
            const container = document.getElementById('lastfm-now-playing');
            if (!container) return;

            try {
                const track = await getNowPlaying();
                renderNowPlaying(container, track);
            } catch (error) {
                console.error('Failed to refresh now playing:', error);
            }
        }, 30000); // 30 seconds
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            startAutoRefresh();
        });
    } else {
        init();
        startAutoRefresh();
    }
})();
