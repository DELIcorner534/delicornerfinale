// WhatsApp Order Integration
// Envoie automatiquement les commandes par WhatsApp avec numérotation automatique

// Configuration WhatsApp
const WHATSAPP_PHONE = '32451032356'; // Numéro WhatsApp de la sandwicherie (format international sans +) - +32 451 03 23 56

// SOLUTION RECOMMANDÉE : Twilio WhatsApp Business API (via backend)
// ⚠️ ChatAPI a fermé - Utilisez maintenant Twilio via le backend
// Développement local: 'http://localhost:3000/send-whatsapp'
// Production (Render): backend hébergé sur Render
const WHATSAPP_API_URL = 'https://delicorner-whatsapp.onrender.com/send-whatsapp';

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
        let apiErrorMsg = null;
        const apiConfigured = WHATSAPP_API_URL && WHATSAPP_API_URL !== 'YOUR_WHATSAPP_API_ENDPOINT' && WHATSAPP_API_URL.includes('http');
        
        if (apiConfigured) {
            console.log('✅ Envoi via API backend...');
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 s (Render spin-up)
                const response = await fetch(WHATSAPP_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: WHATSAPP_PHONE,
                        message: message,
                        orderNumber: orderNumber,
                        orderData: orderWithNumber
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        messageSent = true;
                        console.log('✅ Message WhatsApp envoyé:', result.messageId || result.orderNumber);
                    } else {
                        apiErrorMsg = result.error || 'Erreur backend';
                    }
                } else {
                    const err = await response.json().catch(() => ({}));
                    apiErrorMsg = err.error || 'Erreur ' + response.status;
                }
            } catch (e) {
                apiErrorMsg = e.name === 'AbortError'
                    ? 'Délai dépassé (90 s). Le backend Render peut être en réveil. Réessayez.'
                    : (e.message || 'Erreur réseau.');
                console.error('❌ Erreur envoi API:', apiErrorMsg);
            }
        }
        
        if (!messageSent && apiConfigured && apiErrorMsg) {
            return { success: false, error: apiErrorMsg };
        }
        
        if (!messageSent && apiConfigured) {
            return { success: false, error: 'Envoi WhatsApp échoué. Réessayez ou ouvrez le site via Live Server / npx serve (pas file://).' };
        }
        
        if (!messageSent) {
            await sendOrderViaWhatsAppFallback(message, orderWithNumber);
        }
        
        localStorage.setItem('pending_order', JSON.stringify(orderWithNumber));
        localStorage.setItem('completed_order', JSON.stringify(orderWithNumber));
        
        if (window.auth && window.auth.isLoggedIn()) {
            window.auth.saveOrder({
                items: orderData.items,
                total: orderData.total,
                deliveryInfo: orderData.delivery,
                orderNumber: orderNumber
            });
        }
        
        return { success: true, orderNumber: orderNumber };
        
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
// opts: { skipRedirect: bool } — si true, ne redirige pas (ex. avant Bancontact)
async function processWhatsAppOrder(orderData, opts = {}) {
    const skipRedirect = !!opts.skipRedirect;
    console.log('🚀 processWhatsAppOrder appelé avec:', orderData, skipRedirect ? '(skipRedirect)' : '');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn ? checkoutBtn.innerHTML : '';
    try {
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<span>⏳ Envoi de la commande...</span>';
        }
        
        console.log('📤 Envoi de la commande...');
        const result = await sendOrderViaWhatsApp(orderData);
        console.log('📥 Résultat de l\'envoi:', result);
        
        if (result.success) {
            if (!skipRedirect) {
                if (window.delicornerCart) window.delicornerCart.clearCart();
                console.log('✅ Commande réussie, redirection vers payment-success.html');
                window.location.href = 'payment-success.html';
                return result;
            }
            if (checkoutBtn) checkoutBtn.innerHTML = '<span>⏳ Redirection vers Bancontact...</span>';
            return result;
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = originalText;
        }
        const errorMsg = result.error || 'Une erreur est survenue lors de l\'envoi de la commande. Veuillez réessayer.';
        alert(errorMsg);
        return result;
    } catch (error) {
        console.error('❌ Erreur lors du traitement de la commande:', error);
        const btn = document.getElementById('checkoutBtn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText || '<span>✅ Valider et envoyer la commande</span><span class="checkout-total">€0,00</span>';
        }
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
