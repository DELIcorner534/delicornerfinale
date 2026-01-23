// Backend Server pour envoyer des messages WhatsApp via Meta WhatsApp Business API
// Alternative à Twilio - GRATUIT mais nécessite une vérification Meta
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

// Configuration Meta WhatsApp Business API (à partir des variables d'environnement)
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID; // ID de votre numéro WhatsApp Business
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN; // Token d'accès Meta
const META_API_VERSION = process.env.META_API_VERSION || 'v18.0'; // Version de l'API Meta
const META_TEMPLATE_NAME = process.env.META_TEMPLATE_NAME; // Nom du template (optionnel)

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

// Route pour envoyer un message WhatsApp
app.post('/send-whatsapp', async (req, res) => {
    try {
        const { to, message, orderNumber, orderData } = req.body;

        console.log('📥 Requête reçue sur /send-whatsapp');
        console.log('   To:', to);
        console.log('   Order Number:', orderNumber);
        console.log('   Message length:', message?.length || 0);

        // Validation
        if (!to || !message) {
            console.error('❌ Validation échouée - to ou message manquant');
            return res.status(400).json({ 
                success: false, 
                error: 'Les champs "to" et "message" sont requis' 
            });
        }

        // Vérifier que Meta est configuré
        if (!META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN) {
            console.error('❌ Configuration Meta manquante');
            console.error('   META_PHONE_NUMBER_ID:', META_PHONE_NUMBER_ID ? '✅' : '❌');
            console.error('   META_ACCESS_TOKEN:', META_ACCESS_TOKEN ? '✅' : '❌');
            return res.status(500).json({ 
                success: false, 
                error: 'Configuration Meta WhatsApp manquante. Vérifiez vos variables d\'environnement.' 
            });
        }

        // Formater le numéro (Meta nécessite le format international avec +)
        const phoneNumber = to.startsWith('+') ? to : `+${to}`;
        console.log('📱 Numéro formaté:', phoneNumber);
        console.log('📱 Phone Number ID:', META_PHONE_NUMBER_ID);
        console.log('📱 API URL:', META_API_URL);

        // Envoyer le message WhatsApp via Meta API
        console.log('📤 Envoi du message via Meta API...');
        const response = await axios.post(
            META_API_URL,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: message
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Message WhatsApp envoyé via Meta avec succès!');
        console.log('   Commande:', `#${orderNumber || 'N/A'}`);
        console.log('   Message ID:', response.data.messages[0].id);
        console.log('   Status:', response.data.messages[0].status || 'sent');

        res.json({ 
            success: true, 
            messageId: response.data.messages[0].id,
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

// Route de santé (pour vérifier que le serveur fonctionne)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'WhatsApp Order Service (Meta)',
        timestamp: new Date().toISOString()
    });
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
