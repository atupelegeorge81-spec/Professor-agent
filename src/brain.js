// src/brain.js - Ubongo wa Professor (Thin Seam Pattern)
// Kila kitu kinachohusiana na AI kinapitiwa hapa peke yake

const axios = require('axios');
const { PROFESSOR_PROMPT } = require('./professor');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Piga simu Groq - hii ndiyo seam moja inayogusa API
 * Kila kitu kingine kinaitumia function hii tu
 */
async function callGroq(messages) {
    const response = await axios.post(GROQ_URL, {
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 30000
    });

    return response.data.choices[0].message.content;
}

/**
 * Fikiri — chukua historia ya mazungumzo, rudisha jibu
 * History ni array ya { role: "user"/"assistant", content: "..." }
 */
async function think(history, userMessage) {
    // Jenga messages kamili — system prompt + historia + message mpya
    const messages = [
        { role: 'system', content: PROFESSOR_PROMPT },
        ...history,
        { role: 'user', content: userMessage }
    ];

    try {
        const reply = await callGroq(messages);
        return { success: true, reply };
    } catch (error) {
        // Handle errors vizuri bila kucrash
        const errMsg = error.response
            ? JSON.stringify(error.response.data)
            : error.message;

        console.error(`[Professor Brain Error]: ${errMsg}`);

        return {
            success: false,
            reply: 'Samahani, kuna tatizo la connection. Jaribu tena.'
        };
    }
}

module.exports = { think };

