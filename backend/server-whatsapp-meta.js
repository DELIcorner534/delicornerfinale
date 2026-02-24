// Backend Server pour envoyer des messages WhatsApp via WhatsApp Business API (Meta)
// Alternative à Twilio - 100% Gratuit mais plus complexe à configurer
// Installation: npm install express axios dotenv cors

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration WhatsApp Business API (Meta)
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // Ex: '123456789012345'
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; // Token d'accès Meta
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0'; // Version de l'API
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

// Route pour envoyer un message WhatsApp
app.post('/send-whatsapp', async (req, res) => {
    try {
        const { to, message, orderNumber, orderData } = req.body;

        // Validation
        if (!to || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Les champs "to" et "message" sont requis' 
            });
        }

        // Vérifier que WhatsApp Business API est configuré
        if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
            return res.status(500).json({ 
                success: false, 
                error: 'Configuration WhatsApp Business API manquante. Vérifiez vos variables d\'environnement.' 
            });
        }

        // Envoyer le message WhatsApp via Meta API
        const response = await axios.post(API_URL, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.startsWith('+') ? to.substring(1) : to, // Format: 32488153993 (sans +)
            type: 'text',
            text: {
                body: message
            }
        }, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Message WhatsApp envoyé - Commande #${orderNumber || 'N/A'} - ID: ${response.data.messages[0].id}`);

        res.json({ 
            success: true, 
            messageId: response.data.messages[0].id,
            orderNumber: orderNumber,
            status: 'sent'
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi WhatsApp:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data?.error?.message || error.message || 'Erreur lors de l\'envoi du message WhatsApp' 
        });
    }
});

// Route pour vérifier le webhook (requis par Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token_here';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook vérifié');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Route pour recevoir les statuts des messages (webhook)
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach((entry) => {
            const changes = entry.changes;
            changes?.forEach((change) => {
                if (change.field === 'messages') {
                    const value = change.value;
                    // Traiter les statuts des messages (sent, delivered, read, etc.)
                    console.log('Statut message:', value.statuses);
                }
            });
        });
    }

    res.sendStatus(200);
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'WhatsApp Business API Service (Meta)',
        configured: !!(PHONE_NUMBER_ID && ACCESS_TOKEN),
        timestamp: new Date().toISOString()
    });
});

// Route pour obtenir les informations de configuration (sans exposer les secrets)
app.get('/config', (req, res) => {
    res.json({
        whatsappConfigured: !!(PHONE_NUMBER_ID && ACCESS_TOKEN),
        apiVersion: API_VERSION,
        port: PORT
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur WhatsApp Business API démarré sur le port ${PORT}`);
    console.log(`📱 Endpoint: http://localhost:${PORT}/send-whatsapp`);
    console.log(`🔗 Webhook: http://localhost:${PORT}/webhook`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`⚠️  Note: Pour la production, vous devez configurer HTTPS et le webhook dans Meta Business Suite`);
});
