// src/db.js - Connection ya Koyeb PostgreSQL
const { Pool } = require('pg');

// Pool ya connections - inashirikiwa na server yote
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Koyeb inahitaji SSL
});

/**
 * Tengeneza tables kama hazijawepo
 * Inaitwa mara moja wakati server inaanza
 */
async function setupDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS memory (
                id SERIAL PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Database tables ziko tayari.');
    } catch (err) {
        console.error('❌ Database setup failed:', err.message);
    }
}

module.exports = { pool, setupDatabase };

