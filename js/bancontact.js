// Bancontact Payment Integration
// This integrates with Mollie API which supports Bancontact payments

const MOLLIE_API_KEY = 'YOUR_MOLLIE_API_KEY'; // Deprecated: use backend API instead
const PAYMENT_SUCCESS_URL = window.location.origin + '/payment-success.html';
const PAYMENT_FAILURE_URL = window.location.origin + '/payment-failure.html';
const MOLLIE_BACKEND_URL = 'https://delicorner-whatsapp.onrender.com/api/create-payment';

// Process Bancontact payment via Mollie API
async function processBancontactPayment(orderData) {
    try {
        // Show loading state
        const checkoutBtn = document.getElementById('checkoutBtn');
        const originalText = checkoutBtn.innerHTML;
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span>⏳ Traitement en cours...</span>';

        // Create payment request
        const paymentData = {
            amount: {
                currency: 'EUR',
                value: orderData.total.toFixed(2)
            },
            description: `Commande Delicorner - ${orderData.items.length} article(s)`,
            redirectUrl: PAYMENT_SUCCESS_URL,
            webhookUrl: window.location.origin + '/api/webhook', // Your backend webhook URL
            method: 'bancontact',
            metadata: {
                order_id: 'DELI-' + Date.now(),
                customer_name: orderData.delivery.name,
                customer_phone: orderData.delivery.phone,
                delivery_address: `${orderData.delivery.address}, ${orderData.delivery.postal} ${orderData.delivery.city}`,
                items: JSON.stringify(orderData.items)
            }
        };

        // Create payment with Mollie API
        // Note: This requires a backend API to securely handle the Mollie API key
        // For security reasons, API calls should be made from your backend server
        
        // Option 1: Direct API call (only for testing - move to backend in production)
        const response = await fetch('https://api.mollie.com/v2/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MOLLIE_API_KEY}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            throw new Error('Payment creation failed');
        }

        const payment = await response.json();

        // Store order data in localStorage for success page
        localStorage.setItem('pending_order', JSON.stringify(orderData));

        // Redirect to Mollie checkout
        if (payment._links && payment._links.checkout) {
            window.location.href = payment._links.checkout.href;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Payment error:', error);
        alert('Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.');
        
        // Reset button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = originalText;
    }
}

// Alternative: Simple redirect to Mollie (backend creates payment)
// opts: { skipStoreOrder: bool } — si true, ne pas écraser pending_order (WhatsApp déjà stocké)
async function processBancontactPaymentSimple(orderData, opts = {}) {
    if (!opts.skipStoreOrder) {
        localStorage.setItem('pending_order', JSON.stringify(orderData));
    }
    
    const res = await fetch(MOLLIE_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: orderData.total,
            items: orderData.items,
            delivery: orderData.delivery
        })
    });
    const data = await res.json().catch(() => ({}));
    
    if (data.checkout_url) {
        if (window.delicornerCart) window.delicornerCart.clearCart();
        window.location.href = data.checkout_url;
        return;
    }
    throw new Error(data.error || 'Pas d\'URL de paiement reçue.');
}

// Fallback function for demo/testing without actual payment processing
function processBancontactPaymentDemo(orderData) {
    // Show demo message
    const proceed = confirm(
        `Démo - Paiement Bancontact\n\n` +
        `Total: €${orderData.total.toFixed(2)}\n` +
        `Articles: ${orderData.items.length}\n\n` +
        `Dans un environnement réel, vous seriez redirigé vers la page de paiement Bancontact.\n\n` +
        `Voulez-vous simuler une commande réussie ?`
    );

    if (proceed) {
        // Store order as completed (demo)
        const completedOrder = {
            ...orderData,
            order_id: 'DELI-DEMO-' + Date.now(),
            status: 'completed',
            payment_method: 'bancontact',
            date: new Date().toISOString()
        };
        
        localStorage.setItem('completed_order', JSON.stringify(completedOrder));

        // Save order to user history if logged in
        if (window.auth && window.auth.isLoggedIn()) {
            window.auth.saveOrder({
                items: orderData.items,
                total: orderData.total,
                deliveryInfo: orderData.delivery
            });
        }

        // Clear cart
        if (window.delicornerCart) {
            window.delicornerCart.clearCart();
        }

        // Redirect to success page
        window.location.href = 'payment-success.html';
    }
}

// Use backend Mollie flow by default
window.processBancontactPayment = processBancontactPaymentSimple;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processBancontactPayment, processBancontactPaymentDemo };
}
