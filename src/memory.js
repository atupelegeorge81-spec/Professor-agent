// src/memory.js - Memory ya Kudumu (Phase 2 - PostgreSQL)
const { pool } = require('./db');

const MAX_HISTORY = 20;

/**
 * Pata historia ya session kutoka database
 */
async function getHistory(sessionId) {
    try {
        const result = await pool.query(
            `SELECT role, content FROM conversations
             WHERE session_id = $1
             ORDER BY created_at ASC
             LIMIT $2`,
            [sessionId, MAX_HISTORY]
        );
        return result.rows.map(row => ({
            role: row.role,
            content: row.content
        }));
    } catch (err) {
        console.error('getHistory error:', err.message);
        return [];
    }
}

/**
 * Hifadhi message mpya kwenye database
 */
async function addToHistory(sessionId, role, content) {
    try {
        await pool.query(
            `INSERT INTO conversations (session_id, role, content)
             VALUES ($1, $2, $3)`,
            [sessionId, role, content]
        );
    } catch (err) {
        console.error('addToHistory error:', err.message);
    }
}

/**
 * Futa mazungumzo ya session — anza upya
 */
async function clearSession(sessionId) {
    try {
        await pool.query(
            `DELETE FROM conversations WHERE session_id = $1`,
            [sessionId]
        );
    } catch (err) {
        console.error('clearSession error:', err.message);
    }
}

/**
 * Hifadhi fact muhimu — Professor ataikumbuka milele
 * Mfano: saveFact("jina_la_cj", "CJ ni developer wa East Africa")
 */
async function saveFact(key, value) {
    try {
        await pool.query(
            `INSERT INTO memory (key, value, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE
             SET value = $2, updated_at = NOW()`,
            [key, value]
        );
    } catch (err) {
        console.error('saveFact error:', err.message);
    }
}

/**
 * Pata facts zote anazozijua Professor
 */
async function getAllFacts() {
    try {
        const result = await pool.query(
            `SELECT key, value FROM memory ORDER BY updated_at DESC`
        );
        return result.rows;
    } catch (err) {
        console.error('getAllFacts error:', err.message);
        return [];
    }
}

module.exports = {
    getHistory,
    addToHistory,
    clearSession,
    saveFact,
    getAllFacts
};

