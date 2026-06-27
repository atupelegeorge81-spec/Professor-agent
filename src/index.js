// src/index.js - Lango Kuu la Professor Agent (Phase 1)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { think } = require('./brain');
const { getHistory, addToHistory, clearSession } = require('./memory');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check - Koyeb inahitaji hii kujua server ipo
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'alive',
        agent: 'Professor',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * Endpoint kuu — Firebase itatuma messages hapa
 * POST /chat
 * Body: { message: "habari", sessionId: "cj-main" }
 */
app.post('/chat', async (req, res) => {
    const { message, sessionId = 'default' } = req.body;

    // Validate input
    if (!message || message.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Message haikuja'
        });
    }

    console.log(`[${new Date().toISOString()}] CJ: ${message}`);

    // Pata historia ya session hii
    const history = getHistory(sessionId);

    // Professor afikirie
    const result = await think(history, message);

    if (result.success) {
        // Hifadhi mazungumzo kwenye memory
        addToHistory(sessionId, 'user', message);
        addToHistory(sessionId, 'assistant', result.reply);

        console.log(`[${new Date().toISOString()}] Professor: ${result.reply.substring(0, 100)}...`);

        res.json({
            success: true,
            reply: result.reply,
            sessionId
        });
    } else {
        res.status(500).json({
            success: false,
            reply: result.reply,
            error: 'Brain error'
        });
    }
});

/**
 * Reset mazungumzo — anza upya
 * POST /reset
 */
app.post('/reset', (req, res) => {
    const { sessionId = 'default' } = req.body;
    clearSession(sessionId);
    res.json({
        success: true,
        message: 'Mazungumzo yamefutwa. Anza upya!'
    });
});

// Anza server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║   PROFESSOR AGENT - Phase 1 Online  ║
║   Port: ${PORT}                         ║
║   Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}  ║
╚══════════════════════════════════════╝
    `);
});

