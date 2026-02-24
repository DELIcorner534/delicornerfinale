/**
 * Connexion PostgreSQL (Supabase) - Delicorner
 * Utilisé par server-hybrid.js
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL n\'est pas défini. Configurez Supabase ou une base PostgreSQL.');
    console.error('   Exemple: postgresql://user:password@host:5432/database');
    process.exit(1);
}

const useSSL = /supabase|pooler|\.amazonaws\.|\.neon\.tech/.test(DATABASE_URL || '');
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: useSSL ? { rejectUnauthorized: false } : false
});

/**
 * Exécute une requête et retourne les lignes
 */
async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
}

/**
 * Exécute une requête et retourne une seule ligne ou undefined
 */
async function queryOne(text, params) {
    const res = await query(text, params);
    return res.rows[0];
}

/**
 * Exécute une requête et retourne toutes les lignes
 */
async function queryAll(text, params) {
    const res = await query(text, params);
    return res.rows;
}

async function end() {
    await pool.end();
}

module.exports = { pool, query, queryOne, queryAll, end };
