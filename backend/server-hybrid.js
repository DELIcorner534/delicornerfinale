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
require('dotenv').config();

// Import de better-sqlite3 (synchrone, plus simple que sqlite3)
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '32451032356';
const ORDER_PREFIX = process.env.ORDER_PREFIX || 'DC';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'delicorner2026';

// ============================================================
// BASE DE DONNÉES SQLite
// ============================================================

// Initialiser la base de données
const dbPath = path.join(__dirname, 'orders.db');
const db = new Database(dbPath);

// Créer les tables si elles n'existent pas
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_class TEXT,
        customer_school TEXT,
        delivery_date TEXT,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        notes TEXT,
        status TEXT DEFAULT 'pending',
        whatsapp_sent INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS order_counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        year INTEGER NOT NULL,
        counter INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_order_code ON orders(order_code);
    CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_created_at ON orders(created_at);
`);

// Initialiser le compteur si nécessaire
const currentYear = new Date().getFullYear();
const counterRow = db.prepare('SELECT * FROM order_counter WHERE id = 1').get();

if (!counterRow) {
    db.prepare('INSERT INTO order_counter (id, year, counter) VALUES (1, ?, 0)').run(currentYear);
} else if (counterRow.year !== currentYear) {
    // Réinitialiser le compteur au début de chaque année
    db.prepare('UPDATE order_counter SET year = ?, counter = 0 WHERE id = 1').run(currentYear);
}

console.log(`📦 Base de données initialisée: ${dbPath}`);

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Génère un code de commande unique
 * Format: DC-2026-0042
 */
function generateOrderCode() {
    const year = new Date().getFullYear();
    
    // Vérifier si on a changé d'année
    const counter = db.prepare('SELECT * FROM order_counter WHERE id = 1').get();
    if (counter.year !== year) {
        db.prepare('UPDATE order_counter SET year = ?, counter = 0 WHERE id = 1').run(year);
    }
    
    // Incrémenter le compteur
    db.prepare('UPDATE order_counter SET counter = counter + 1 WHERE id = 1').run();
    
    // Récupérer le nouveau compteur
    const newCounter = db.prepare('SELECT counter FROM order_counter WHERE id = 1').get();
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

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du back-office
app.use('/admin', express.static(path.join(__dirname, 'admin')));

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
app.post('/api/orders', (req, res) => {
    try {
        const { 
            customerName, 
            customerPhone, 
            customerClass, 
            customerSchool,
            deliveryDate,
            items, 
            total, 
            paymentMethod,
            notes 
        } = req.body;

        // Validation
        if (!customerName || !customerPhone || !items || !total) {
            return res.status(400).json({
                success: false,
                error: 'Champs requis manquants: customerName, customerPhone, items, total'
            });
        }

        // Générer le code de commande
        const orderCode = generateOrderCode();

        // Insérer la commande
        const stmt = db.prepare(`
            INSERT INTO orders (
                order_code, customer_name, customer_phone, customer_class,
                customer_school, delivery_date, items, total, payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            orderCode,
            customerName,
            customerPhone,
            customerClass || null,
            customerSchool || null,
            deliveryDate || null,
            JSON.stringify(items),
            total,
            paymentMethod || 'cash',
            notes || null
        );

        // Récupérer la commande créée
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

        // Générer le lien WhatsApp
        const whatsappLink = generateWhatsAppLink(order);

        console.log(`✅ Nouvelle commande créée: ${orderCode}`);

        res.status(201).json({
            success: true,
            order: formatOrderForResponse(order),
            whatsappLink: whatsappLink,
            message: `Commande ${orderCode} créée avec succès`
        });

    } catch (error) {
        console.error('❌ Erreur création commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la commande',
            details: error.message
        });
    }
});

/**
 * GET /api/orders/:code
 * Récupérer une commande par son code
 */
app.get('/api/orders/:code', (req, res) => {
    try {
        const { code } = req.params;

        const order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(code.toUpperCase());

        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Commande ${code} non trouvée`
            });
        }

        res.json({
            success: true,
            order: formatOrderForResponse(order)
        });

    } catch (error) {
        console.error('❌ Erreur récupération commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la commande'
        });
    }
});

/**
 * GET /api/orders
 * Liste des commandes (avec filtres optionnels)
 */
app.get('/api/orders', (req, res) => {
    try {
        const { status, date, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (date) {
            query += ' AND DATE(created_at) = ?';
            params.push(date);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const orders = db.prepare(query).all(...params);
        const totalCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

        res.json({
            success: true,
            orders: orders.map(formatOrderForResponse),
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('❌ Erreur liste commandes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des commandes'
        });
    }
});

/**
 * PATCH /api/orders/:code
 * Mettre à jour le statut d'une commande
 */
app.patch('/api/orders/:code', (req, res) => {
    try {
        const { code } = req.params;
        const { status, paymentStatus, whatsappSent } = req.body;

        const order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(code.toUpperCase());

        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Commande ${code} non trouvée`
            });
        }

        // Construire la mise à jour
        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (paymentStatus) {
            updates.push('payment_status = ?');
            params.push(paymentStatus);
        }
        if (whatsappSent !== undefined) {
            updates.push('whatsapp_sent = ?');
            params.push(whatsappSent ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucun champ à mettre à jour'
            });
        }

        updates.push("updated_at = datetime('now', 'localtime')");
        params.push(code.toUpperCase());

        db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE order_code = ?`).run(...params);

        const updatedOrder = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(code.toUpperCase());

        console.log(`📝 Commande ${code} mise à jour`);

        res.json({
            success: true,
            order: formatOrderForResponse(updatedOrder),
            message: `Commande ${code} mise à jour`
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la commande'
        });
    }
});

/**
 * DELETE /api/orders/:code
 * Supprimer une commande (soft delete - change status to cancelled)
 */
app.delete('/api/orders/:code', (req, res) => {
    try {
        const { code } = req.params;

        const order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(code.toUpperCase());

        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Commande ${code} non trouvée`
            });
        }

        db.prepare(`
            UPDATE orders 
            SET status = 'cancelled', updated_at = datetime('now', 'localtime') 
            WHERE order_code = ?
        `).run(code.toUpperCase());

        console.log(`🗑️ Commande ${code} annulée`);

        res.json({
            success: true,
            message: `Commande ${code} annulée`
        });

    } catch (error) {
        console.error('❌ Erreur suppression commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'annulation de la commande'
        });
    }
});

// ============================================================
// ROUTES API - STATISTIQUES
// ============================================================

/**
 * GET /api/stats
 * Statistiques des commandes
 */
app.get('/api/stats', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const stats = {
            totalOrders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
            todayOrders: db.prepare('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?').get(today).count,
            pendingOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count,
            confirmedOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'").get().count,
            totalRevenue: db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders').get().sum,
            todayRevenue: db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE DATE(created_at) = ?').get(today).sum
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Erreur statistiques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
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
        database: 'SQLite',
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
app.get('/admin', (req, res) => {
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
        const { orderData, orderNumber } = req.body;
        
        if (!orderData) {
            return res.status(400).json({
                success: false,
                error: 'orderData requis'
            });
        }

        // Créer la commande via le nouveau système
        const orderCode = generateOrderCode();

        const stmt = db.prepare(`
            INSERT INTO orders (
                order_code, customer_name, customer_phone, customer_class,
                customer_school, delivery_date, items, total, payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            orderCode,
            orderData.delivery?.name || 'Client',
            orderData.delivery?.phone || '',
            orderData.delivery?.class || null,
            orderData.delivery?.school || null,
            orderData.delivery?.date || null,
            JSON.stringify(orderData.items || []),
            orderData.total || 0,
            orderData.payment_method || 'cash',
            orderData.delivery?.notes || null
        );

        const order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(orderCode);
        const whatsappLink = generateWhatsAppLink(order);

        console.log(`✅ Commande migrée vers le nouveau système: ${orderCode}`);

        res.json({
            success: true,
            orderNumber: orderCode,
            whatsappLink: whatsappLink,
            message: 'Commande enregistrée - Utilisez le lien WhatsApp pour notifier'
        });

    } catch (error) {
        console.error('❌ Erreur migration commande:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║       DELICORNER - SYSTÈME HYBRIDE DE COMMANDES          ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  🚀 Serveur démarré sur le port ${PORT}                      ║`);
    console.log(`║  📦 Base de données: ${dbPath.substring(dbPath.lastIndexOf('/') + 1).padEnd(30)}║`);
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

// Fermer proprement la base de données à l'arrêt
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    db.close();
    process.exit(0);
});

module.exports = app;
