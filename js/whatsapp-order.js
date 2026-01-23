// WhatsApp Order Integration
// Envoie automatiquement les commandes par WhatsApp avec numérotation automatique

// Configuration WhatsApp
const WHATSAPP_PHONE = '32451032356'; // Numéro WhatsApp de la sandwicherie (format international sans +) - +32 451 03 23 56

// SOLUTION RECOMMANDÉE : Twilio WhatsApp Business API (via backend)
// ⚠️ ChatAPI a fermé - Utilisez maintenant Twilio via le backend
// Pour le développement local: 'http://localhost:3000/send-whatsapp'
// Pour la production: 'https://votre-backend.herokuapp.com/send-whatsapp'
const WHATSAPP_API_URL = 'http://localhost:3000/send-whatsapp'; // URL de votre backend Twilio
// ⚠️ Changez cette URL après avoir déployé votre backend en production

// Option 2: Webhook (Zapier, Make.com, etc.)
const WHATSAPP_WEBHOOK_URL = 'YOUR_WEBHOOK_URL'; // URL de votre webhook

const WHATSAPP_MESSAGE_PREFIX = '🍽️ *NIEUWE BESTELLING DELICORNER*\n\n';

// Gestion des numéros de commande
class OrderNumberManager {
    constructor() {
        this.storageKey = 'delicorner_order_counter';
        this.initCounter();
    }

    initCounter() {
        // Si le compteur n'existe pas, initialiser à 1
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, '1');
        }
    }

    getNextOrderNumber() {
        const currentNumber = parseInt(localStorage.getItem(this.storageKey)) || 1;
        const orderNumber = currentNumber.toString().padStart(4, '0'); // Format: 0001, 0002, etc.
        
        // Incrémenter pour la prochaine commande
        localStorage.setItem(this.storageKey, (currentNumber + 1).toString());
        
        return orderNumber;
    }

    getCurrentOrderNumber() {
        const currentNumber = parseInt(localStorage.getItem(this.storageKey)) || 1;
        return (currentNumber - 1).toString().padStart(4, '0');
    }

    resetCounter() {
        localStorage.setItem(this.storageKey, '1');
    }
}

// Instance globale
const orderNumberManager = new OrderNumberManager();

// Générer un code de vérification unique pour sécuriser le message
function generateVerificationCode(orderData, orderNumber) {
    // Créer une chaîne unique basée sur la commande
    const orderString = JSON.stringify({
        orderNumber: orderNumber,
        total: orderData.total,
        items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            options: item.options || [],
            sauce: item.sauce || null
        })),
        timestamp: new Date().toISOString()
    });
    
    // Générer un hash simple (pour la sécurité, on utilise un hash basique)
    // En production, vous pourriez utiliser crypto.subtle pour un hash plus sécurisé
    let hash = 0;
    for (let i = 0; i < orderString.length; i++) {
        const char = orderString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convertir en code alphanumérique de 8 caractères
    const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 8).padStart(8, '0');
    return code;
}

// Formater le message WhatsApp avec code de vérification
function formatWhatsAppMessage(orderData, orderNumber, verificationCode = null) {
    const date = new Date();
    const dateStr = date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Générer le code de vérification si non fourni
    if (!verificationCode) {
        verificationCode = generateVerificationCode(orderData, orderNumber);
    }

    let message = WHATSAPP_MESSAGE_PREFIX;
    message += `📋 *Bestelling #${orderNumber}*\n`;
    message += `🕐 ${dateStr}\n\n`;
    
    // Informations client
    message += `👤 *KLANTGEGEVENS*\n`;
    message += `Naam: ${orderData.delivery.name}\n`;
    message += `Klas: ${orderData.delivery.class}\n`;
    message += `School: ${orderData.delivery.school}\n`;
    message += `Telefoon: ${orderData.delivery.phone}\n`;
    
    if (orderData.delivery.notes && orderData.delivery.notes.trim()) {
        message += `Opmerkingen: ${orderData.delivery.notes}\n`;
    }
    
    message += `\n🛒 *ARTIKELEN*\n`;
    
    // Détails des articles
    orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity}\n`;
        message += `   Eenheidsprijs: €${item.price}\n`;
        message += `   Subtotaal: €${(parseFloat(item.price.replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}\n`;
        
        // Afficher les options (crudités)
        if (item.options && item.options.length > 0) {
            const optionsText = item.options.map(opt => opt.name).join(', ');
            message += `   + ${optionsText}\n`;
        }
        
        // Afficher la sauce
        if (item.sauce && item.sauce.name) {
            message += `   Saus: ${item.sauce.name}\n`;
        }
        
        message += `\n`;
    });
    
    message += `💰 *TOTAAL: €${orderData.total.toFixed(2).replace('.', ',')}*\n\n`;
    message += `💳 Betaalmethode: ${orderData.payment_method === 'bancontact' ? 'Bancontact' : orderData.payment_method}\n\n`;
    message += `🔐 *Verificatiecode: ${verificationCode}*\n`;
    message += `\n✅ Bedankt voor uw bestelling!`;
    
    return { message, verificationCode };
}

// Envoyer automatiquement la commande par WhatsApp via API
async function sendOrderViaWhatsApp(orderData) {
    console.log('🚀 sendOrderViaWhatsApp appelé avec orderData:', orderData);
    try {
        // Obtenir le numéro de commande
        const orderNumber = orderNumberManager.getNextOrderNumber();
        console.log('📋 Numéro de commande généré:', orderNumber);
        
        // Formater le message avec code de vérification
        const { message, verificationCode } = formatWhatsAppMessage(orderData, orderNumber);
        
        // Sauvegarder la commande avec le numéro et le code de vérification
        const orderWithNumber = {
            ...orderData,
            orderNumber: orderNumber,
            verificationCode: verificationCode,
            date: new Date().toISOString(),
            status: 'pending',
            whatsappMessage: message // Sauvegarder le message formaté
        };
        
        let messageSent = false;
        
        // Option 1: Envoyer via API backend Twilio (RECOMMANDÉ)
        console.log('🔍 Vérification de WHATSAPP_API_URL:', WHATSAPP_API_URL);
        if (WHATSAPP_API_URL && WHATSAPP_API_URL !== 'YOUR_WHATSAPP_API_ENDPOINT' && WHATSAPP_API_URL.includes('http')) {
            console.log('✅ Envoi via API backend Twilio...');
            try {
                console.log('📤 Envoi de la requête à:', WHATSAPP_API_URL);
                console.log('📤 Données envoyées:', { to: WHATSAPP_PHONE, message: message.substring(0, 100) + '...', orderNumber });
                const response = await fetch(WHATSAPP_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: WHATSAPP_PHONE,
                        message: message,
                        orderNumber: orderNumber,
                        orderData: orderWithNumber
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Message WhatsApp envoyé via API backend:', result);
                    messageSent = true;
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                    console.error('❌ Erreur API backend - Status:', response.status);
                    console.error('❌ Erreur API backend - Détails:', errorData);
                    throw new Error(errorData.error || 'Erreur lors de l\'envoi via API');
                }
            } catch (apiError) {
                console.error('❌ Erreur API backend:', apiError);
                console.error('❌ Détails de l\'erreur:', {
                    message: apiError.message,
                    stack: apiError.stack,
                    name: apiError.name
                });
            }
        }
        
        // Option 3: Si aucune API n'est configurée, utiliser webhook ou sauvegarder
        if (!messageSent) {
            console.log('⚠️ Aucune API configurée, utilisation du fallback...');
            await sendOrderViaWhatsAppFallback(message, orderWithNumber);
        } else {
            console.log('✅ Message envoyé avec succès via API backend');
        }
        
        // Sauvegarder dans localStorage pour la page de succès
        localStorage.setItem('pending_order', JSON.stringify(orderWithNumber));
        localStorage.setItem('completed_order', JSON.stringify(orderWithNumber)); // Pour la page de succès
        
        console.log('💾 Commande sauvegardée dans localStorage:', {
            orderNumber: orderWithNumber.orderNumber,
            verificationCode: orderWithNumber.verificationCode,
            total: orderWithNumber.total,
            messageLength: message.length
        });
        
        // Sauvegarder dans l'historique des commandes si l'utilisateur est connecté
        if (window.auth && window.auth.isLoggedIn()) {
            window.auth.saveOrder({
                items: orderData.items,
                total: orderData.total,
                deliveryInfo: orderData.delivery,
                orderNumber: orderNumber
            });
        }
        
        return {
            success: true,
            orderNumber: orderNumber
        };
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi WhatsApp:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Méthode alternative pour envoyer WhatsApp (webhook, service tiers, etc.)
async function sendOrderViaWhatsAppFallback(message, orderWithNumber) {
    let messageSent = false;
    
    // Option A: Utiliser un service webhook (comme Zapier, Make.com, etc.)
    if (WHATSAPP_WEBHOOK_URL && WHATSAPP_WEBHOOK_URL !== 'YOUR_WEBHOOK_URL') {
        try {
            const response = await fetch(WHATSAPP_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: WHATSAPP_PHONE,
                    message: message,
                    order: orderWithNumber
                })
            });
            
            if (response.ok) {
                console.log('Message envoyé via webhook');
                messageSent = true;
            }
        } catch (err) {
            console.error('Erreur webhook:', err);
        }
    }
    
    // Option B: Si ChatAPI n'est pas configuré, essayer de sauvegarder la commande
    // La commande sera sauvegardée dans localStorage pour envoi manuel
    
    // Si aucun service configuré, on sauvegarde quand même la commande
    // et on peut l'envoyer manuellement via un dashboard admin
    if (!messageSent) {
        console.warn('⚠️ Aucun service WhatsApp configuré. Commande sauvegardée pour envoi manuel.');
        console.log('📋 Message WhatsApp à envoyer:', message);
        console.log('🔢 Numéro de commande:', orderWithNumber.orderNumber);
        
        // Sauvegarder dans un tableau de commandes en attente
        const pendingOrders = JSON.parse(localStorage.getItem('pending_whatsapp_orders') || '[]');
        pendingOrders.push({
            orderNumber: orderWithNumber.orderNumber,
            message: message,
            date: new Date().toISOString(),
            sent: false,
            orderData: orderWithNumber
        });
        localStorage.setItem('pending_whatsapp_orders', JSON.stringify(pendingOrders));
        
        // Ne pas bloquer avec une alerte - la commande sera affichée sur la page de succès
        // Le message sera disponible sur payment-success.html avec les boutons pour copier/envoyer
    }
    
    return messageSent;
}

// Fonction principale pour traiter la commande
async function processWhatsAppOrder(orderData) {
    console.log('🚀 processWhatsAppOrder appelé avec:', orderData);
    
    try {
        // Afficher un message de chargement
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<span>⏳ Envoi de la commande...</span>';
            
            // Envoyer la commande
            console.log('📤 Envoi de la commande...');
            const result = await sendOrderViaWhatsApp(orderData);
            console.log('📥 Résultat de l\'envoi:', result);
            
            if (result.success) {
                // Vider le panier
                if (window.delicornerCart) {
                    window.delicornerCart.clearCart();
                }
                
                // Rediriger vers la page de succès
                console.log('✅ Commande réussie, redirection vers payment-success.html');
                window.location.href = 'payment-success.html';
            } else {
                // Réactiver le bouton en cas d'erreur
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = originalText;
                const errorMsg = result.error || 'Une erreur est survenue lors de l\'envoi de la commande. Veuillez réessayer.';
                alert(errorMsg);
            }
            
            return result;
        } else {
            console.warn('⚠️ Bouton checkoutBtn non trouvé, envoi quand même...');
            // Si le bouton n'existe pas, envoyer quand même
            const result = await sendOrderViaWhatsApp(orderData);
            if (result.success) {
                if (window.delicornerCart) {
                    window.delicornerCart.clearCart();
                }
                window.location.href = 'payment-success.html';
            }
            return result;
        }
    } catch (error) {
        console.error('❌ Erreur lors du traitement de la commande:', error);
        console.error('Stack trace:', error.stack);
        alert('Une erreur est survenue. Veuillez réessayer. Erreur: ' + error.message);
        return { success: false, error: error.message };
    }
}

// Export pour utilisation dans d'autres fichiers
if (typeof window !== 'undefined') {
    window.processWhatsAppOrder = processWhatsAppOrder;
    window.orderNumberManager = orderNumberManager;
    window.formatWhatsAppMessage = formatWhatsAppMessage;
    window.generateVerificationCode = generateVerificationCode;
    window.sendOrderViaWhatsApp = sendOrderViaWhatsApp;
    console.log('✅ whatsapp-order.js chargé - Fonctions exportées:', {
        processWhatsAppOrder: typeof processWhatsAppOrder,
        sendOrderViaWhatsApp: typeof sendOrderViaWhatsApp,
        WHATSAPP_API_URL: WHATSAPP_API_URL,
        WHATSAPP_PHONE: WHATSAPP_PHONE
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processWhatsAppOrder, orderNumberManager, formatWhatsAppMessage, generateVerificationCode };
}
