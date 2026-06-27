// src/index.js - Lango Kuu la Professor Agent (Phase 2)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { think } = require('./brain');
const { setupDatabase } = require('./db');
const { getHistory, addToHistory, clearSession, getAllFacts } = require('./memory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'alive',
        agent: 'Professor',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Endpoint kuu — Firebase itatuma messages hapa
app.post('/chat', async (req, res) => {
    const { message, sessionId = 'default' } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ success: false, error: 'Message haikuja' });
    }

    console.log(`[${new Date().toISOString()}] CJ: ${message}`);

    // Pata historia + facts kutoka database
    const history = await getHistory(sessionId);
    const facts = await getAllFacts();

    // Ongeza facts kwenye message kama context
    const contextMessage = facts.length > 0
        ? `[Ninachokujua kukuhusu: ${facts.map(f => f.value).join('. ')}]\n\n${message}`
        : message;

    const result = await think(history, contextMessage);

    if (result.success) {
        await addToHistory(sessionId, 'user', message);
        await addToHistory(sessionId, 'assistant', result.reply);

        console.log(`[${new Date().toISOString()}] Professor: ${result.reply.substring(0, 100)}...`);

        res.json({ success: true, reply: result.reply, sessionId });
    } else {
        res.status(500).json({ success: false, reply: result.reply });
    }
});

// Reset mazungumzo
app.post('/reset', async (req, res) => {
    const { sessionId = 'default' } = req.body;
    await clearSession(sessionId);
    res.json({ success: true, message: 'Mazungumzo yamefutwa!' });
});

// Anza server + setup database
async function start() {
    await setupDatabase();
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════╗
║  PROFESSOR AGENT v2.0 - Memory ON   ║
║  Port: ${PORT}                          ║
╚══════════════════════════════════════╝
        `);
    });
}

start();

