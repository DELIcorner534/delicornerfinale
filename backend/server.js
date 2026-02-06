// Backend Server pour envoyer des messages WhatsApp via Twilio
// Installation: npm install express twilio dotenv cors

const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Twilio (à partir des variables d'environnement)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
const contentSid = process.env.TWILIO_CONTENT_SID; // Content SID du template WhatsApp

// Initialiser le client Twilio
const client = twilio(accountSid, authToken);

// Fonction pour formater la liste des articles pour le template
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
        
        itemText += `\n   Prix: €${item.price}`;
        
        return itemText;
    }).join('\n');
}

// Route pour envoyer un message WhatsApp
app.post('/send-whatsapp', async (req, res) => {
    try {
        const { to, message, orderNumber, orderData } = req.body;

        // Validation
        if (!to) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le champ "to" est requis' 
            });
        }

        // Vérifier que Twilio est configuré
        if (!accountSid || !authToken || !twilioWhatsAppNumber) {
            return res.status(500).json({ 
                success: false, 
                error: 'Configuration Twilio manquante. Vérifiez vos variables d\'environnement.' 
            });
        }

        // Formater le numéro de destination
        const formattedTo = `whatsapp:+${to.replace(/^\+/, '')}`;
        
        console.log(`📤 Tentative d'envoi WhatsApp:`);
        console.log(`   De: ${twilioWhatsAppNumber}`);
        console.log(`   À: ${formattedTo}`);
        console.log(`   Commande: #${orderNumber || 'N/A'}`);

        // Utiliser le template si disponible, sinon utiliser le message libre
        let result;
        
        if (contentSid && orderData) {
            // Utiliser le template WhatsApp
            console.log(`📋 Utilisation du template WhatsApp (Content SID: ${contentSid})`);
            
            // Formater la date (format DD/MM/YYYY HH:MM)
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
            
            // Préparer les variables du template
            const contentVariables = {
                '1': orderNumber || '0001',
                '2': dateStr,
                '3': orderData.delivery?.name || 'N/A',
                '4': orderData.delivery?.class || 'N/A',
                '5': orderData.delivery?.school || 'N/A',
                '6': orderData.delivery?.phone || 'N/A',
                '7': formatItemsList(orderData.items || []),
                '8': (typeof orderData.total === 'number' ? orderData.total.toFixed(2) : String(orderData.total || '0')).replace('.', ','),
                '9': orderData.payment_method === 'bancontact' ? 'Bancontact' : (orderData.payment_method || 'N/A'),
                '10': orderData.verificationCode || 'N/A'
            };
            
            console.log(`📋 Variables du template:`, contentVariables);
            
            try {
                result = await client.messages.create({
                    from: twilioWhatsAppNumber,
                    to: formattedTo,
                    contentSid: contentSid,
                    contentVariables: JSON.stringify(contentVariables)
                });
            } catch (templateError) {
                // Si le template n'est pas approuvé ou erreur, utiliser le fallback
                console.warn(`⚠️ Erreur avec le template (${templateError.code}):`, templateError.message);
                console.log(`📝 Passage au message libre (fallback)...`);
                
                if (message) {
                    result = await client.messages.create({
                        from: twilioWhatsAppNumber,
                        to: formattedTo,
                        body: message
                    });
                } else {
                    throw templateError; // Si pas de message de fallback, propager l'erreur
                }
            }
        } else if (message) {
            // Fallback: utiliser le message libre (pour compatibilité)
            console.log(`📝 Utilisation du message libre (fallback)`);
            console.log(`   Message (premiers 100 caractères): ${message.substring(0, 100)}...`);
            
            result = await client.messages.create({
                from: twilioWhatsAppNumber,
                to: formattedTo,
                body: message
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: 'Soit "message" soit "orderData" avec Content SID doit être fourni' 
            });
        }

        console.log(`✅ Message WhatsApp envoyé avec succès!`);
        console.log(`   SID: ${result.sid}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Commande: #${orderNumber || 'N/A'}`);

        res.json({ 
            success: true, 
            messageId: result.sid,
            orderNumber: orderNumber,
            status: result.status,
            to: formattedTo
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi WhatsApp:', error);
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.error('   More info:', error.moreInfo);
        
        // Messages d'erreur plus explicites
        let errorMessage = error.message || 'Erreur lors de l\'envoi du message WhatsApp';
        
        if (error.code === 21608) {
            errorMessage = 'Le numéro de destination n\'est pas vérifié dans le Sandbox Twilio. Le destinataire doit d\'abord envoyer un message au Sandbox.';
        } else if (error.code === 21211) {
            errorMessage = 'Numéro de téléphone invalide. Vérifiez le format du numéro.';
        } else if (error.code === 21614) {
            errorMessage = 'Ce numéro WhatsApp n\'est pas autorisé. Vérifiez que le numéro est ajouté au Sandbox.';
        } else if (error.code === 63055) {
            errorMessage = 'Erreur 63055: Seuls les messages marketing (templates) sont supportés sur MM Lite API. Pour le Sandbox, assurez-vous que le numéro de destination est bien ajouté au Sandbox et qu\'il a initié une conversation dans les 24 dernières heures.';
        } else if (error.code === 63016) {
            errorMessage = 'Erreur 63016: Vous êtes en dehors de la fenêtre autorisée pour les messages libres. Le destinataire doit d\'abord envoyer un message au Sandbox pour ouvrir une fenêtre de 24h.';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            code: error.code,
            moreInfo: error.moreInfo
        });
    }
});

// Route de santé (pour vérifier que le serveur fonctionne)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'WhatsApp Order Service',
        timestamp: new Date().toISOString()
    });
});

// Route pour obtenir les informations de configuration (sans exposer les secrets)
app.get('/config', (req, res) => {
    res.json({
        whatsappConfigured: !!(accountSid && authToken && twilioWhatsAppNumber),
        port: PORT
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur WhatsApp démarré sur le port ${PORT}`);
    console.log(`📱 Endpoint: http://localhost:${PORT}/send-whatsapp`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
