// Backend Server pour envoyer des messages WhatsApp via Meta WhatsApp Business API
// Alternative à Twilio - GRATUIT mais nécessite une vérification Meta
// Installation: npm install express axios dotenv cors

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// Token -> payment_id (pour payment-return via ?t=)
const paymentTokens = new Map();
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 min
function cleanupTokens() {
    const now = Date.now();
    for (const [k, v] of paymentTokens.entries()) {
        if (now - (v.createdAt || 0) > TOKEN_TTL_MS) paymentTokens.delete(k);
    }
}
setInterval(cleanupTokens, 5 * 60 * 1000);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Meta WhatsApp Business API (à partir des variables d'environnement)
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_API_VERSION = process.env.META_API_VERSION || 'v18.0';
const META_TEMPLATE_NAME = process.env.META_TEMPLATE_NAME; // ex: hello_world | delicorner_order
const META_TEMPLATE_LANGUAGE = process.env.META_TEMPLATE_LANGUAGE || 'nl_BE';
const META_ORDER_TO = process.env.META_ORDER_TO || ''; // Numéro WhatsApp shop (commandes)

// Configuration Mollie (Bancontact)
const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const MOLLIE_REDIRECT_SUCCESS_URL = process.env.MOLLIE_REDIRECT_SUCCESS_URL;
const MOLLIE_REDIRECT_FAILURE_URL = process.env.MOLLIE_REDIRECT_FAILURE_URL;
const MOLLIE_WEBHOOK_URL = process.env.MOLLIE_WEBHOOK_URL;

// URL de l'API Meta WhatsApp
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PHONE_NUMBER_ID}/messages`;

// Fonction pour formater la liste des articles pour le message
function formatItemsList(items) {
    return items.map((item, index) => {
        let itemText = `${index + 1}. ${item.name} x${item.quantity}`;
        
        // Ajouter les options (crudités)
        if (item.options && item.options.length > 0) {
            const optionsText = item.options.map(opt => opt.name).join(', ');
            itemText += ` (${optionsText})`;
        }
        
        // Ajouter la sauce
        if (item.sauce && item.sauce.name) {
            itemText += ` [${item.sauce.name}]`;
        }
        
        itemText += `\n   Prijs: €${item.price}`;
        
        return itemText;
    }).join('\n');
}

function generateVerificationCode(orderData, orderNumber) {
    const s = JSON.stringify({
        orderNumber,
        total: orderData.total,
        items: (orderData.items || []).map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        ts: Date.now()
    });
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h = h & h;
    }
    return Math.abs(h).toString(36).toUpperCase().substring(0, 8).padStart(8, '0');
}

// Fonction pour formater le message de commande
function formatOrderMessage(orderData, orderNumber) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
    
    const total = typeof orderData.total === 'number' 
        ? orderData.total.toFixed(2).replace('.', ',') 
        : String(orderData.total || '0').replace('.', ',');
    
    let message = `🍽️ *NIEUWE BESTELLING DELICORNER*\n\n`;
    message += `📋 *Bestelling #${orderNumber}*\n`;
    message += `📅 Datum: ${dateStr}\n\n`;
    message += `👤 *Klant:*\n`;
    message += `   Naam: ${orderData.delivery?.name || 'N/A'}\n`;
    message += `   Klas: ${orderData.delivery?.class || 'N/A'}\n`;
    message += `   School: ${orderData.delivery?.school || 'N/A'}\n`;
    message += `   Telefoon: ${orderData.delivery?.phone || 'N/A'}\n\n`;
    message += `🛒 *Artikelen:*\n${formatItemsList(orderData.items || [])}\n\n`;
    message += `💰 *Totaal: €${total}*\n`;
    message += `💳 Betaling: ${orderData.payment_method === 'bancontact' ? 'Bancontact' : (orderData.payment_method || 'N/A')}\n\n`;
    message += `🔐 Verificatiecode: ${orderData.verificationCode || 'N/A'}`;
    
    return message;
}

// Envoyer un message Meta (template ou texte)
async function sendMetaMessage(payload) {
    const res = await axios.post(META_API_URL, payload, {
        headers: {
            'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}

// Envoyer template + message texte (partagé send-whatsapp / confirm-and-send)
async function sendTemplateAndText(phoneNumber, message, orderData, orderNumber) {
    const ph = String(phoneNumber).replace(/\D/g, '');
    const templatePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: ph,
        type: 'template',
        template: { name: META_TEMPLATE_NAME, language: { code: META_TEMPLATE_LANGUAGE } }
    };
    if ((META_TEMPLATE_NAME === 'delicorner_order' || META_TEMPLATE_NAME === 'order_confirmation' || META_TEMPLATE_NAME === 'delicorner_order_full') && orderData) {
        const name = (orderData.delivery?.name || 'N/A').substring(0, 80);
        const orderNum = String(orderNumber || 'N/A');
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const dateStr = `${d.getDate()} ${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]} ${d.getFullYear()}`;
        if (META_TEMPLATE_NAME === 'delicorner_order') {
            const total = typeof orderData.total === 'number' ? orderData.total.toFixed(2).replace('.', ',') : String(orderData.total || '0').replace('.', ',').substring(0, 20);
            templatePayload.template.components = [{ type: 'body', parameters: [{ type: 'text', text: orderNum }, { type: 'text', text: name }, { type: 'text', text: total }] }];
        } else if (META_TEMPLATE_NAME === 'delicorner_order_full') {
            const total = typeof orderData.total === 'number' ? orderData.total.toFixed(2).replace('.', ',') : String(orderData.total || '0').replace('.', ',').substring(0, 20);
            let itemsText = formatItemsList(orderData.items || []);
            if (itemsText.length > 900) itemsText = itemsText.slice(0, 900) + '...';
            templatePayload.template.components = [{ type: 'body', parameters: [{ type: 'text', text: orderNum }, { type: 'text', text: name }, { type: 'text', text: orderData.delivery?.phone || 'N/A' }, { type: 'text', text: orderData.delivery?.school || 'N/A' }, { type: 'text', text: orderData.delivery?.class || 'N/A' }, { type: 'text', text: total }, { type: 'text', text: itemsText }] }];
        } else {
            templatePayload.template.components = [{ type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: orderNum }, { type: 'date_time', date_time: { fallback_value: dateStr } }] }];
        }
    }
    await sendMetaMessage(templatePayload);
    const textRes = await sendMetaMessage({ messaging_product: 'whatsapp', recipient_type: 'individual', to: ph, type: 'text', text: { body: message } });
    return textRes.messages?.[0]?.id;
}

// Route pour envoyer un message WhatsApp
app.post('/send-whatsapp', async (req, res) => {
    try {
        const { to, message, orderNumber, orderData } = req.body;

        console.log('📥 Requête reçue sur /send-whatsapp');
        console.log('   To:', to);
        console.log('   Order Number:', orderNumber);
        console.log('   Message length:', message?.length || 0);

        if (!to || !message) {
            console.error('❌ Validation échouée - to ou message manquant');
            return res.status(400).json({ 
                success: false, 
                error: 'Les champs "to" et "message" sont requis' 
            });
        }

        if (!META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN) {
            console.error('❌ Configuration Meta manquante');
            return res.status(500).json({ 
                success: false, 
                error: 'Configuration Meta WhatsApp manquante. Vérifiez vos variables d\'environnement.' 
            });
        }

        const phoneNumber = String(to).replace(/\D/g, '');
        if (!META_TEMPLATE_NAME || !META_TEMPLATE_NAME.length) {
            return res.status(400).json({
                success: false,
                error: 'Configurez META_TEMPLATE_NAME (ex: hello_world ou delicorner_order). Voir TEMPLATE_META_COMMANDES.md.'
            });
        }
        console.log('📤 Envoi template + texte Meta...');
        const textMsgId = await sendTemplateAndText(phoneNumber, message, orderData, orderNumber);
        console.log('✅ Message WhatsApp envoyé via Meta');
        console.log('   Commande:', `#${orderNumber || 'N/A'}`);
        console.log('   Message ID:', textMsgId);

        res.json({ 
            success: true, 
            messageId: textMsgId,
            orderNumber: orderNumber,
            status: 'sent'
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi WhatsApp:');
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.error('   Response status:', error.response?.status);
        console.error('   Response data:', JSON.stringify(error.response?.data, null, 2));
        
        let errorMessage = error.message || 'Erreur lors de l\'envoi du message WhatsApp';
        
        if (error.response?.data?.error) {
            const metaError = error.response.data.error;
            errorMessage = metaError.message || errorMessage;
            console.error('   Meta Error Code:', metaError.code);
            console.error('   Meta Error Type:', metaError.type);
            console.error('   Meta Error Subcode:', metaError.error_subcode);
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            code: error.response?.data?.error?.code,
            details: error.response?.data?.error
        });
    }
});

// Page d'accueil (évite "Cannot GET /" quand on visite la racine)
app.get('/', (req, res) => {
    res.type('html').send(`
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Delicorner WhatsApp API</title></head>
        <body style="font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem;">
            <h1>🍽️ Delicorner – Backend WhatsApp</h1>
            <p>Ce serveur envoie les commandes par WhatsApp. Il n'y a pas de page à consulter ici.</p>
            <ul>
                <li><a href="/health">/health</a> – Vérifier que le backend fonctionne</li>
                <li><strong>POST /send-whatsapp</strong> – Utilisé par le site pour envoyer les commandes</li>
            </ul>
            <p><a href="/health">→ Tester /health</a></p>
        </body></html>
    `);
});

// Route de santé (pour vérifier que le serveur fonctionne)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'WhatsApp Order Service (Meta)',
        timestamp: new Date().toISOString()
    });
});

// Vérifier le statut d'un paiement Mollie (pour payment-return)
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
        res.json({ status });
    } catch (e) {
        console.error('❌ Erreur payment-status:', e.response?.data || e.message);
        res.status(500).json({ error: 'Impossible de vérifier le paiement.', status: 'unknown' });
    }
});

// Récupérer payment_id à partir du token (pour payment-return?t=xxx)
app.get('/api/payment-by-token', (req, res) => {
    const t = req.query.t;
    if (!t) return res.status(400).json({ error: 'Paramètre t manquant.' });
    const entry = paymentTokens.get(t);
    if (!entry || !entry.payment_id) return res.status(404).json({ error: 'Token invalide ou expiré.' });
    res.json({ payment_id: entry.payment_id });
});

// Après paiement réussi : vérifier Mollie paid puis envoyer WhatsApp (commande uniquement après payé)
app.post('/api/confirm-and-send-whatsapp', async (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) return res.status(400).json({ error: 'Paramètre token manquant.', success: false });
        const entry = paymentTokens.get(token);
        if (!entry || !entry.payment_id || !entry.order) return res.status(404).json({ error: 'Token invalide ou expiré.', success: false });
        const { payment_id, order } = entry;
        const r = await axios.get(`https://api.mollie.com/v2/payments/${payment_id}`, {
            headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` }
        });
        const status = (r.data?.status || '').toLowerCase();
        if (status !== 'paid') return res.status(400).json({ error: 'Paiement non payé.', success: false });
        if (!META_ORDER_TO || !META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN || !META_TEMPLATE_NAME) {
            return res.status(500).json({ error: 'Config Meta / META_ORDER_TO manquante.', success: false });
        }
        const orderNumber = order.orderNumber || String(Date.now()).slice(-6);
        const orderData = {
            ...order,
            delivery: order.delivery || {},
            verificationCode: generateVerificationCode(order, orderNumber),
            payment_method: 'bancontact'
        };
        const message = formatOrderMessage(orderData, orderNumber);
        await sendTemplateAndText(META_ORDER_TO, message, orderData, orderNumber);
        console.log('✅ WhatsApp envoyé après paiement (confirm-and-send): #' + orderNumber);
        res.json({ success: true, orderNumber });
    } catch (e) {
        console.error('❌ confirm-and-send-whatsapp:', e.response?.data || e.message);
        res.status(500).json({ error: e.message || 'Erreur envoi WhatsApp après paiement.', success: false });
    }
});

// Créer un paiement Mollie (Bancontact)
app.post('/api/create-payment', async (req, res) => {
    try {
        if (!MOLLIE_API_KEY || !MOLLIE_REDIRECT_SUCCESS_URL || !MOLLIE_REDIRECT_FAILURE_URL) {
            return res.status(500).json({
                error: 'Configuration Mollie manquante (MOLLIE_API_KEY / REDIRECT URLs).'
            });
        }

        const { amount, items, delivery, orderNumber } = req.body || {};
        if (typeof amount !== 'number' || !items || !delivery) {
            return res.status(400).json({ error: 'Données de paiement invalides.' });
        }
        const order = { items, delivery, total: amount, orderNumber: orderNumber || null };

        const token = crypto.randomBytes(16).toString('hex');
        const base = MOLLIE_REDIRECT_SUCCESS_URL;
        const redirectUrl = base + (base.includes('?') ? '&' : '?') + 't=' + token;

        const paymentData = {
            amount: {
                currency: 'EUR',
                value: amount.toFixed(2)
            },
            description: `Commande Delicorner - ${items.length} article(s)`,
            redirectUrl,
            webhookUrl: MOLLIE_WEBHOOK_URL || undefined,
            method: 'bancontact',
            metadata: {
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

        paymentTokens.set(token, { payment_id: paymentId, order, createdAt: Date.now() });

        res.json({ checkout_url: checkoutUrl, payment_id: paymentId || null, return_token: token });
    } catch (error) {
        console.error('❌ Erreur Mollie:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erreur lors de la création du paiement Mollie.' });
    }
});

// Route pour obtenir les informations de configuration (sans exposer les secrets)
app.get('/config', (req, res) => {
    res.json({
        whatsappConfigured: !!(META_PHONE_NUMBER_ID && META_ACCESS_TOKEN),
        provider: 'Meta WhatsApp Business API',
        port: PORT
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur WhatsApp (Meta) démarré sur le port ${PORT}`);
    console.log(`📱 Endpoint: http://localhost:${PORT}/send-whatsapp`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
