// src/memory.js - Kumbukumbu ya Mazungumzo (Phase 1 - RAM tu)
// Phase 2 itabadilisha hii na Koyeb PostgreSQL

// Hifadhi ya mazungumzo kwa session ID
const sessions = new Map();

// Historia ya max messages 20 per session (token optimization)
const MAX_HISTORY = 20;

/**
 * Pata historia ya session
 */
function getHistory(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
    }
    return sessions.get(sessionId);
}

/**
 * Ongeza message kwenye historia
 */
function addToHistory(sessionId, role, content) {
    const history = getHistory(sessionId);
    history.push({ role, content });

    // Zuia historia isikue kubwa sana — token optimization
    if (history.length > MAX_HISTORY) {
        // Futa messages za zamani lakini acha 2 za kwanza (context ya mwanzo)
        history.splice(2, history.length - MAX_HISTORY);
    }
}

/**
 * Futa session (reset mazungumzo)
 */
function clearSession(sessionId) {
    sessions.delete(sessionId);
}

module.exports = { getHistory, addToHistory, clearSession };

