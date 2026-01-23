// Bancontact Payment Integration
// This integrates with Mollie API which supports Bancontact payments

const MOLLIE_API_KEY = 'YOUR_MOLLIE_API_KEY'; // Test key: test_xxx or Live key: live_xxx
const PAYMENT_SUCCESS_URL = window.location.origin + '/payment-success.html';
const PAYMENT_FAILURE_URL = window.location.origin + '/payment-failure.html';

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

// Alternative: Simple redirect to payment page (if using Mollie Checkout)
function processBancontactPaymentSimple(orderData) {
    // Store order data
    localStorage.setItem('pending_order', JSON.stringify(orderData));
    
    // Create payment session on your backend
    // This should call your backend API which then creates a Mollie payment
    fetch('/api/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: orderData.total,
            items: orderData.items,
            delivery: orderData.delivery
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        } else {
            throw new Error('No checkout URL received');
        }
    })
    .catch(error => {
        console.error('Payment error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    });
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

// Use demo mode by default (replace with real function in production)
window.processBancontactPayment = processBancontactPaymentDemo;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processBancontactPayment, processBancontactPaymentDemo };
}
