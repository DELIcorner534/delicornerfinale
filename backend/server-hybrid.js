/**
 * DELICORNER - Serveur Hybride pour Gestion des Commandes
 * ========================================================
 * 
 * Solution hybride avec:
 * - Base de données SQLite pour stocker les commandes
 * - Génération de codes uniques côté serveur
 * - Redirection WhatsApp classique (wa.me)
 * - Back-office pour vérifier les commandes
 * - Architecture prête pour WhatsApp Business API
 * 
 * Installation: npm install express cors dotenv better-sqlite3
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const { query, queryOne, queryAll, end: dbEnd } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Rétention des commandes: supprimer celles de plus de X mois (défaut: 3 mois)
const ORDER_RETENTION_MONTHS = parseInt(process.env.ORDER_RETENTION_MONTHS || '3', 10);

// Configuration
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '32451032356';
const ORDER_PREFIX = process.env.ORDER_PREFIX || 'DC';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD n\'est pas défini dans les variables d\'environnement.');
    console.error('   Merci de configurer ADMIN_PASSWORD (Render, .env, etc.) avant de démarrer.');
    process.exit(1);
}

// Configuration Mollie (Bancontact)
const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const MOLLIE_REDIRECT_SUCCESS_URL = process.env.MOLLIE_REDIRECT_SUCCESS_URL || 'https://delicornerhalle.be/payment-return.html';
const MOLLIE_REDIRECT_FAILURE_URL = process.env.MOLLIE_REDIRECT_FAILURE_URL || 'https://delicornerhalle.be/payment-failure.html';
const MOLLIE_WEBHOOK_URL = process.env.MOLLIE_WEBHOOK_URL;

// Durée de vie des tokens de paiement (en ms) lorsque stockés en base
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ============================================================
// BASE DE DONNÉES PostgreSQL (Supabase)
// ============================================================
// Variable requise: DATABASE_URL (ex: postgresql://user:pass@host:5432/db)
// Les tables sont créées via scripts/init-supabase.sql (à exécuter une fois dans Supabase)
// ============================================================

async function initDatabase() {
    const currentYear = new Date().getFullYear();
    const counterRow = await queryOne('SELECT * FROM order_counter WHERE id = 1');

    if (!counterRow) {
        await query('INSERT INTO order_counter (id, year, counter) VALUES (1, $1, 0)', [currentYear]);
    } else if (counterRow.year !== currentYear) {
        await query('UPDATE order_counter SET year = $1, counter = 0 WHERE id = 1', [currentYear]);
    }

    const cutoffSeconds = Math.floor(TOKEN_TTL_MS / 1000);
    const tokenRes = await query(
        'DELETE FROM payment_tokens WHERE EXTRACT(EPOCH FROM (NOW() - created_at)) > $1',
        [cutoffSeconds]
    );
    if (tokenRes.rowCount > 0) console.log(`🗑️ ${tokenRes.rowCount} token(s) expiré(s)`);

    const orderRes = await query(
        'DELETE FROM orders WHERE created_at < NOW() - INTERVAL \'1 month\' * $1',
        [ORDER_RETENTION_MONTHS]
    );
    if (orderRes.rowCount > 0) console.log(`🗑️ ${orderRes.rowCount} commande(s) (> ${ORDER_RETENTION_MONTHS} mois)`);

    console.log(`📦 Base PostgreSQL/Supabase prête (rétention: ${ORDER_RETENTION_MONTHS} mois)`);
}

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Génère un code de commande unique
 * Format: DC-2026-0042
 */
async function generateOrderCode() {
    const year = new Date().getFullYear();
    const counter = await queryOne('SELECT * FROM order_counter WHERE id = 1');
    if (counter.year !== year) {
        await query('UPDATE order_counter SET year = $1, counter = 0 WHERE id = 1', [year]);
    }
    await query('UPDATE order_counter SET counter = counter + 1 WHERE id = 1');
    const newCounter = await queryOne('SELECT counter FROM order_counter WHERE id = 1');
    const orderNumber = String(newCounter.counter).padStart(4, '0');
    return `${ORDER_PREFIX}-${year}-${orderNumber}`;
}

/**
 * Génère le lien WhatsApp avec message pré-rempli
 */
function generateWhatsAppLink(order) {
    const message = `🍽️ NOUVELLE COMMANDE DELICORNER

📋 *Code: ${order.order_code}*
👤 Nom: ${order.customer_name}
📞 Tél: ${order.customer_phone}
🏫 École: ${order.customer_school || 'Non spécifié'}
📅 Date: ${order.delivery_date || 'Non spécifié'}
💰 Total: €${order.total.toFixed(2).replace('.', ',')}

Merci de vérifier ma commande avec ce code.`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
}

/**
 * Formate une commande pour l'affichage
 */
function formatOrderForResponse(order) {
    return {
        id: order.id,
        orderCode: order.order_code,
        customer: {
            name: order.customer_name,
            phone: order.customer_phone,
            class: order.customer_class,
            school: order.customer_school
        },
        deliveryDate: order.delivery_date,
        items: JSON.parse(order.items),
        total: order.total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        notes: order.notes,
        status: order.status,
        whatsappSent: !!order.whatsapp_sent,
        createdAt: order.created_at,
        updatedAt: order.updated_at
    };
}

/**
 * Normalise et valide un numéro de GSM belge.
 * Accepte par exemple : "0488/153.993", "0488 153 993", "+32488153993"
 * Retourne un numéro au format local "0488153993" ou null si invalide.
 */
function normalizeBelgianMobile(phone) {
    if (!phone || typeof phone !== 'string') return null;
    const digits = phone.replace(/[^\d]/g, ''); // garde uniquement les chiffres

    // 10 chiffres commençant par 0 (ex: 0488123456)
    if (digits.length === 10 && /^0[4-9]\d{8}$/.test(digits)) {
        return digits;
    }

    // 11 chiffres commençant par 32 (ex: 32488123456) → enlever 32, remettre 0
    if (digits.length === 11 && digits.startsWith('32') && /^[0-9]+$/.test(digits)) {
        const local = '0' + digits.slice(2);
        if (/^0[4-9]\d{8}$/.test(local)) return local;
    }

    // 13 chiffres commençant par 0032 (ex: 0032488123456)
    if (digits.length === 13 && digits.startsWith('0032')) {
        const local = '0' + digits.slice(4);
        if (/^0[4-9]\d{8}$/.test(local)) return local;
    }

    return null;
}

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS : n'autoriser que les origines connues (site public + back-office + dev local)
const ALLOWED_ORIGINS = [
    'https://delicornerhalle.be',
    'https://www.delicornerhalle.be',
    'https://delicorner-whatsapp.onrender.com',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Les requêtes sans origin (ex: cURL, apps serveur) sont autorisées
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        console.warn('❌ Requête CORS refusée depuis', origin);
        return callback(new Error('Origin non autorisée par CORS'));
    }
}));

app.use(express.json());

// Authentification basique pour le back-office et les routes d'administration
function adminAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const [scheme, encoded] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encoded) {
        res.set('WWW-Authenticate', 'Basic realm="Delicorner Back-office"');
        return res.status(401).send('Authentification requise');
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [, password] = decoded.split(':'); // on ignore le login, seul le mot de passe compte

    if (password !== ADMIN_PASSWORD) {
        res.set('WWW-Authenticate', 'Basic realm="Delicorner Back-office"');
        return res.status(401).send('Identifiants invalides');
    }

    next();
}

// Servir les fichiers statiques du back-office (protégés)
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin')));

// Logging des requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// ============================================================
// ROUTES API - COMMANDES
// ============================================================

/**
 * POST /api/orders
 * Créer une nouvelle commande
 */
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, customerClass, customerSchool, deliveryDate, items, total, paymentMethod, notes } = req.body;
        if (!customerName || !customerPhone || !items || !total) {
            return res.status(400).json({ success: false, error: 'Champs requis manquants: customerName, customerPhone, items, total' });
        }
        const normalizedPhone = normalizeBelgianMobile(customerPhone);
        if (!normalizedPhone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone invalide. Exemple attendu: 0488 153 993' });
        }

        const orderCode = await generateOrderCode();
        await query(`
            INSERT INTO orders (order_code, customer_name, customer_phone, customer_class, customer_school, delivery_date, items, total, payment_method, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [orderCode, customerName, normalizedPhone, customerClass || null, customerSchool || null, deliveryDate || null, JSON.stringify(items), total, paymentMethod || 'cash', notes || null]);

        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [orderCode]);
        const whatsappLink = generateWhatsAppLink(order);

        console.log(`✅ Nouvelle commande créée: ${orderCode}`);
        res.status(201).json({ success: true, order: formatOrderForResponse(order), whatsappLink, message: `Commande ${orderCode} créée avec succès` });
    } catch (error) {
        console.error('❌ Erreur création commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la création de la commande', details: error.message });
    }
});

/**
 * GET /api/orders/:code
 * Récupérer une commande par son code.
 * Accessible publiquement pour permettre à la page de succès paiement
 * d'afficher le récapitulatif exact de la commande.
 */
app.get('/api/orders/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [code.toUpperCase()]);
        if (!order) {
            return res.status(404).json({ success: false, error: `Commande ${code} non trouvée` });
        }
        res.json({ success: true, order: formatOrderForResponse(order) });
    } catch (error) {
        console.error('❌ Erreur récupération commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la commande' });
    }
});

/**
 * GET /api/orders
 * Liste des commandes (avec filtres optionnels) - back-office
 */
app.get('/api/orders', adminAuth, async (req, res) => {
    try {
        const { status, date, limit = 50, offset = 0 } = req.query;
        let baseQuery = "FROM orders WHERE payment_status = 'paid'";
        const filters = [];
        const params = [];
        let p = 1;

        if (status) { filters.push(`status = $${p++}`); params.push(status); }
        if (date) { filters.push(`DATE(created_at) = $${p++}`); params.push(date); }
        if (filters.length > 0) baseQuery += ' AND ' + filters.join(' AND ');

        const countRes = await queryOne(`SELECT COUNT(*)::int as count ${baseQuery}`, params);
        const totalCount = countRes.count;

        params.push(parseInt(limit), parseInt(offset));
        const orders = await queryAll(`SELECT * ${baseQuery} ORDER BY created_at DESC LIMIT $${p} OFFSET $${p + 1}`, params);

        res.json({
            success: true,
            orders: orders.map(formatOrderForResponse),
            pagination: { total: totalCount, limit: parseInt(limit), offset: parseInt(offset) }
        });
    } catch (error) {
        console.error('❌ Erreur liste commandes:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des commandes' });
    }
});

/**
 * PATCH /api/orders/:code
 * Mettre à jour le statut d'une commande (back-office)
 */
app.patch('/api/orders/:code', adminAuth, async (req, res) => {
    try {
        const { code } = req.params;
        const { status, paymentStatus, whatsappSent } = req.body;
        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [code.toUpperCase()]);
        if (!order) return res.status(404).json({ success: false, error: `Commande ${code} non trouvée` });

        const updates = [];
        const params = [];
        let p = 1;
        if (status) { updates.push(`status = $${p++}`); params.push(status); }
        if (paymentStatus) { updates.push(`payment_status = $${p++}`); params.push(paymentStatus); }
        if (whatsappSent !== undefined) { updates.push(`whatsapp_sent = $${p++}`); params.push(whatsappSent ? 1 : 0); }
        if (updates.length === 0) return res.status(400).json({ success: false, error: 'Aucun champ à mettre à jour' });

        updates.push("updated_at = CURRENT_TIMESTAMP");
        params.push(code.toUpperCase());
        await query(`UPDATE orders SET ${updates.join(', ')} WHERE order_code = $${p}`, params);

        const updatedOrder = await queryOne('SELECT * FROM orders WHERE order_code = $1', [code.toUpperCase()]);
        console.log(`📝 Commande ${code} mise à jour`);
        res.json({ success: true, order: formatOrderForResponse(updatedOrder), message: `Commande ${code} mise à jour` });
    } catch (error) {
        console.error('❌ Erreur mise à jour commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la commande' });
    }
});

/**
 * DELETE /api/orders/:code
 * - Sans ?permanent=1 : annulation (soft delete, status = cancelled)
 * - Avec ?permanent=1 : suppression définitive (DELETE) - pour enlever les commandes test
 */
app.delete('/api/orders/:code', adminAuth, async (req, res) => {
    try {
        const { code } = req.params;
        const permanent = req.query.permanent === '1';
        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [code.toUpperCase()]);
        if (!order) return res.status(404).json({ success: false, error: `Commande ${code} non trouvée` });

        if (permanent) {
            await query('DELETE FROM orders WHERE order_code = $1', [code.toUpperCase()]);
            console.log(`🗑️ Commande ${code} supprimée définitivement`);
            return res.json({ success: true, message: `Commande ${code} supprimée définitivement` });
        }
        await query(`UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE order_code = $1`, [code.toUpperCase()]);
        console.log(`🗑️ Commande ${code} annulée`);
        res.json({ success: true, message: `Commande ${code} annulée` });
    } catch (error) {
        console.error('❌ Erreur suppression commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation de la commande' });
    }
});

// ============================================================
// ROUTES API - STATISTIQUES
// ============================================================

/**
 * GET /api/stats
 * Statistiques des commandes (back-office)
 */
app.get('/api/stats', adminAuth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const totalOrders = (await queryOne("SELECT COUNT(*)::int as count FROM orders WHERE payment_status = 'paid'")).count;
        const todayOrders = (await queryOne("SELECT COUNT(*)::int as count FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = $1", [today])).count;
        const pendingOrders = (await queryOne("SELECT COUNT(*)::int as count FROM orders WHERE payment_status = 'paid' AND status = 'pending'")).count;
        const confirmedOrders = (await queryOne("SELECT COUNT(*)::int as count FROM orders WHERE payment_status = 'paid' AND status = 'confirmed'")).count;
        const totalRevenue = parseFloat((await queryOne("SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = 'paid'")).sum);
        const todayRevenue = parseFloat((await queryOne("SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = $1", [today])).sum);

        res.json({ success: true, stats: { totalOrders, todayOrders, pendingOrders, confirmedOrders, totalRevenue, todayRevenue } });
    } catch (error) {
        console.error('❌ Erreur statistiques:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
    }
});

// ============================================================
// ROUTES UTILITAIRES
// ============================================================

/**
 * GET /health
 * Vérification de santé du serveur
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Delicorner Hybrid Order System',
        database: 'PostgreSQL',
        timestamp: new Date().toISOString(),
        features: [
            'Order creation with unique codes',
            'Order verification by code',
            'Admin back-office',
            'WhatsApp redirect links',
            'Ready for WhatsApp Business API'
        ]
    });
});

/**
 * GET /api/config
 * Configuration publique
 */
app.get('/api/config', (req, res) => {
    res.json({
        whatsappPhone: WHATSAPP_PHONE,
        orderPrefix: ORDER_PREFIX,
        features: {
            hybridMode: true,
            whatsappBusinessAPI: false // À activer plus tard
        }
    });
});

// ============================================================
// ROUTES BACK-OFFICE
// ============================================================

/**
 * GET /admin
 * Page d'accueil du back-office
 */
app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ============================================================
// COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
// ============================================================

/**
 * POST /send-whatsapp (ancien endpoint)
 * Redirige vers le nouveau système
 */
app.post('/send-whatsapp', async (req, res) => {
    console.log('⚠️ Ancien endpoint /send-whatsapp appelé - Redirection vers le nouveau système');
    try {
        const { orderData } = req.body;
        if (!orderData) return res.status(400).json({ success: false, error: 'orderData requis' });

        const orderCode = await generateOrderCode();
        const d = orderData.delivery || {};
        await query(`
            INSERT INTO orders (order_code, customer_name, customer_phone, customer_class, customer_school, delivery_date, items, total, payment_method, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [orderCode, d.name || 'Client', d.phone || '', d.class || null, d.school || null, d.date || null, JSON.stringify(orderData.items || []), orderData.total || 0, orderData.payment_method || 'cash', d.notes || null]);

        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [orderCode]);
        const whatsappLink = generateWhatsAppLink(order);
        console.log(`✅ Commande migrée: ${orderCode}`);
        res.json({ success: true, orderNumber: orderCode, whatsappLink, message: 'Commande enregistrée - Utilisez le lien WhatsApp pour notifier' });
    } catch (error) {
        console.error('❌ Erreur migration commande:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// ROUTES MOLLIE (BANCONTACT)
// ============================================================

/**
 * POST /api/create-payment
 * Créer un paiement Mollie (Bancontact)
 */
app.post('/api/create-payment', async (req, res) => {
    try {
        if (!MOLLIE_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Mollie manquante (MOLLIE_API_KEY).'
            });
        }

        const { amount, items, delivery, orderNumber } = req.body || {};
        if (typeof amount !== 'number' || !items || !delivery) {
            return res.status(400).json({ error: 'Données de paiement invalides.' });
        }

        // Validation / normalisation du numéro de téléphone de livraison
        const normalizedPhone = normalizeBelgianMobile(delivery.phone || '');
        if (!normalizedPhone) {
            return res.status(400).json({ error: 'Numéro de téléphone invalide. Exemple: 0488 153 993' });
        }

        const orderCode = await generateOrderCode();
        await query(`
            INSERT INTO orders (order_code, customer_name, customer_phone, customer_class, customer_school, delivery_date, items, total, payment_method, payment_status, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [orderCode, delivery.name || 'Client', normalizedPhone, delivery.class || null, delivery.school || null, delivery.date || null, JSON.stringify(items), amount, 'bancontact', 'pending', delivery.notes || null]);

        console.log(`📦 Commande ${orderCode} créée (paiement en attente)`);

        // Créer le token pour le retour de paiement
        const token = crypto.randomBytes(16).toString('hex');
        const base = MOLLIE_REDIRECT_SUCCESS_URL;
        const redirectUrl = base + (base.includes('?') ? '&' : '?') + 't=' + token;

        const paymentData = {
            amount: {
                currency: 'EUR',
                value: amount.toFixed(2)
            },
            description: `Commande Delicorner ${orderCode} - ${items.length} article(s)`,
            redirectUrl,
            webhookUrl: MOLLIE_WEBHOOK_URL || undefined,
            method: 'bancontact',
            metadata: {
                order_code: orderCode,
                customer_name: delivery.name || '',
                customer_phone: delivery.phone || '',
                school: delivery.school || '',
                class: delivery.class || ''
            }
        };

        const response = await axios.post('https://api.mollie.com/v2/payments', paymentData, {
            headers: {
                Authorization: `Bearer ${MOLLIE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const checkoutUrl = response.data?._links?.checkout?.href;
        const paymentId = response.data?.id;

        if (!checkoutUrl) {
            return res.status(500).json({ error: 'URL de paiement introuvable.' });
        }

        await query(
            'INSERT INTO payment_tokens (token, payment_id, order_code, payload) VALUES ($1, $2, $3, $4)',
            [token, paymentId, orderCode, JSON.stringify({ items, delivery, total: amount, orderNumber: orderCode })]
        );

        console.log(`💳 Paiement Mollie créé: ${paymentId} pour commande ${orderCode}`);

        res.json({ 
            checkout_url: checkoutUrl, 
            payment_id: paymentId, 
            order_code: orderCode,
            return_token: token 
        });

    } catch (error) {
        console.error('❌ Erreur Mollie:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erreur lors de la création du paiement Mollie.' });
    }
});

/**
 * POST /api/create-payment-simulated
 * Mode TEST: créer une commande payée sans passer par Mollie,
 * puis renvoyer une URL de redirection directe vers la page de succès.
 */
app.post('/api/create-payment-simulated', async (req, res) => {
    try {
        const { amount, items, delivery } = req.body || {};
        if (typeof amount !== 'number' || !items || !delivery) {
            return res.status(400).json({ error: 'Données de paiement invalides.' });
        }

        // Validation / normalisation du numéro de téléphone de livraison
        const normalizedPhone = normalizeBelgianMobile(delivery.phone || '');
        if (!normalizedPhone) {
            return res.status(400).json({ error: 'Numéro de téléphone invalide. Exemple: 0488 153 993' });
        }

        const orderCode = await generateOrderCode();
        await query(`
            INSERT INTO orders (order_code, customer_name, customer_phone, customer_class, customer_school, delivery_date, items, total, payment_method, payment_status, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [orderCode, delivery.name || 'Client', normalizedPhone, delivery.class || null, delivery.school || null, delivery.date || null, JSON.stringify(items), amount, 'bancontact', 'paid', 'confirmed', delivery.notes || null]);

        console.log(`🧪 [SIMULATED] Commande ${orderCode} créée comme payée (sans Mollie)`);

        // URL de redirection directe vers la page de succès publique
        const successUrl = `https://delicornerhalle.be/payment-success.html?code=${encodeURIComponent(orderCode)}`;

        res.json({
            checkout_url: successUrl,
            payment_id: null,
            order_code: orderCode,
            simulated: true
        });
    } catch (error) {
        console.error('❌ Erreur create-payment-simulated:', error.message);
        res.status(500).json({ error: 'Erreur lors de la création du paiement simulé.' });
    }
});

/**
 * GET /api/payment-status
 * Vérifier le statut d'un paiement Mollie
 */
app.get('/api/payment-status', async (req, res) => {
    try {
        const id = req.query.id;
        if (!id || !MOLLIE_API_KEY) {
            return res.status(400).json({ error: 'Paramètre id manquant ou Mollie non configuré.' });
        }

        const r = await axios.get(`https://api.mollie.com/v2/payments/${id}`, {
            headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` }
        });

        const status = r.data?.status || 'unknown';
        const failureReason = r.data?.details?.failureReason || r.data?.details?.bankReasonCode || null;
        const canceledReason = r.data?.canceledAt ? 'canceled_by_user' : null;
        const orderCode = r.data?.metadata?.order_code || null;

        if (status === 'paid' && orderCode) {
            await query(`UPDATE orders SET payment_status = 'paid', status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE order_code = $1`, [orderCode]);
            console.log(`✅ Paiement confirmé pour commande ${orderCode}`);
        }

        res.json({ 
            status,
            failureReason: failureReason || canceledReason,
            method: r.data?.method || null,
            order_code: orderCode
        });

    } catch (e) {
        console.error('❌ Erreur payment-status:', e.response?.data || e.message);
        res.status(500).json({ error: 'Impossible de vérifier le paiement.', status: 'unknown' });
    }
});

/**
 * GET /api/payment-by-token
 * Récupérer payment_id à partir du token
 */
app.get('/api/payment-by-token', async (req, res) => {
    const t = req.query.t;
    if (!t) return res.status(400).json({ error: 'Paramètre t manquant.' });
    const entry = await queryOne('SELECT payment_id, order_code, created_at FROM payment_tokens WHERE token = $1', [t]);
    if (!entry || !entry.payment_id) return res.status(404).json({ error: 'Token invalide ou expiré.' });
    res.json({ payment_id: entry.payment_id, order_code: entry.order_code });
});

/**
 * POST /api/confirm-and-send-whatsapp
 * Confirmer le paiement et générer le lien WhatsApp
 */
app.post('/api/confirm-and-send-whatsapp', async (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) {
            return res.status(400).json({ error: 'Paramètre token manquant.', success: false });
        }

        const entry = await queryOne('SELECT payment_id, order_code, payload, created_at FROM payment_tokens WHERE token = $1', [token]);
        if (!entry || !entry.payment_id || !entry.order_code) {
            return res.status(404).json({ error: 'Token invalide ou expiré.', success: false });
        }
        const { payment_id, order_code } = entry;

        const r = await axios.get(`https://api.mollie.com/v2/payments/${payment_id}`, {
            headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` }
        });
        const status = (r.data?.status || '').toLowerCase();
        if (status !== 'paid') return res.status(400).json({ error: 'Paiement non payé.', success: false });

        await query(`UPDATE orders SET payment_status = 'paid', status = 'confirmed', whatsapp_sent = 1, updated_at = CURRENT_TIMESTAMP WHERE order_code = $1`, [order_code]);
        await query('DELETE FROM payment_tokens WHERE token = $1', [token]);

        const order = await queryOne('SELECT * FROM orders WHERE order_code = $1', [order_code]);
        const whatsappLink = generateWhatsAppLink(order);

        console.log(`✅ Paiement confirmé et WhatsApp prêt pour commande ${order_code}`);

        res.json({ 
            success: true, 
            orderNumber: order_code,
            whatsappLink: whatsappLink
        });

    } catch (e) {
        console.error('❌ confirm-and-send-whatsapp:', e.response?.data || e.message);
        res.status(500).json({ error: e.message || 'Erreur confirmation paiement.', success: false });
    }
});

/**
 * POST /api/mollie-webhook
 * Webhook Mollie pour les notifications de paiement
 */
app.post('/api/mollie-webhook', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).send('Missing payment id');
        }

        console.log(`📥 Webhook Mollie reçu pour paiement: ${id}`);

        const r = await axios.get(`https://api.mollie.com/v2/payments/${id}`, {
            headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` }
        });

        const status = r.data?.status || 'unknown';
        const orderCode = r.data?.metadata?.order_code;

        if (orderCode) {
            if (status === 'paid') {
                await query(`UPDATE orders SET payment_status = 'paid', status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE order_code = $1`, [orderCode]);
                console.log(`✅ Webhook: Paiement confirmé pour ${orderCode}`);
            } else if (['canceled', 'expired', 'failed'].includes(status)) {
                await query(`UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_code = $2`, [status, orderCode]);
                console.log(`❌ Webhook: Paiement ${status} pour ${orderCode}`);
            }
        }

        res.status(200).send('OK');

    } catch (e) {
        console.error('❌ Webhook Mollie error:', e.message);
        res.status(500).send('Error');
    }
});

// ============================================================
// GESTION DES ERREURS
// ============================================================

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne'
    });
});

// Route 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée'
    });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================

async function start() {
    try {
        await initDatabase();
    } catch (e) {
        console.error('❌ Erreur initialisation base:', e.message);
        console.error('   Vérifiez DATABASE_URL et exécutez scripts/init-supabase.sql dans Supabase.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║       DELICORNER - SYSTÈME HYBRIDE DE COMMANDES          ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log(`║  🚀 Serveur démarré sur le port ${PORT}                      ║`);
        console.log('║  📦 Base de données: PostgreSQL/Supabase                 ║');
        console.log(`║  📱 WhatsApp: ${WHATSAPP_PHONE.padEnd(38)}║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  ENDPOINTS:                                              ║');
    console.log(`║  • API:        http://localhost:${PORT}/api/orders            ║`);
    console.log(`║  • Back-office: http://localhost:${PORT}/admin                ║`);
    console.log(`║  • Health:     http://localhost:${PORT}/health                ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  STATUTS DISPONIBLES:                                    ║');
    console.log('║  • pending    → En attente                               ║');
    console.log('║  • confirmed  → Confirmée                                ║');
    console.log('║  • preparing  → En préparation                           ║');
    console.log('║  • ready      → Prête                                    ║');
    console.log('║  • delivered  → Livrée                                   ║');
    console.log('║  • cancelled  → Annulée                                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    });
}

start();

process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await dbEnd();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await dbEnd();
    process.exit(0);
});

module.exports = app;
