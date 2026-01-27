// Payment Success Page
document.addEventListener('DOMContentLoaded', function() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('whatsapp_failed') === '1') {
        var fallback = 'Votre commande est bien enregistrée, mais la notification WhatsApp n\'a pas pu être envoyée à la sandwicherie. Contactez le 0488/153.993 pour confirmer.';
        var msg = (typeof t === 'function' && t('paymentSuccess.whatsappFailed') && t('paymentSuccess.whatsappFailed') !== 'paymentSuccess.whatsappFailed')
            ? t('paymentSuccess.whatsappFailed') : fallback;
        alert(msg);
        history.replaceState({}, '', window.location.pathname);
    }
    const q = new URLSearchParams(window.location.search);
    const orderCode = q.get('code') || q.get('order_code') || null;
    const orderData = localStorage.getItem('completed_order') || localStorage.getItem('pending_order');
    const orderSummary = document.getElementById('orderSummary');
    
    if (orderCode) {
        // Version fiable: recharger la dernière commande depuis l'API
        fetchOrderFromApi(orderCode, orderSummary);
    } else if (orderData) {
        try {
            const order = JSON.parse(orderData);
            
            // Afficher le numéro de commande si disponible
            if (order.orderNumber) {
                const orderNumberEl = document.getElementById('orderNumber');
                if (orderNumberEl) {
                    orderNumberEl.textContent = `Commande #${order.orderNumber}`;
                    orderNumberEl.style.display = 'block';
                }
            }
            
            renderOrderSummary(order, orderSummary);
            
            // Le message WhatsApp est maintenant envoyé automatiquement via Twilio
            // Plus besoin d'afficher la section pour que le client copie/envoye le message
            
            // Save order to user history if logged in (if auth is loaded)
            if (window.auth && window.auth.isLoggedIn() && order.items) {
                window.auth.saveOrder({
                    items: order.items,
                    total: order.total || 0,
                    deliveryInfo: order.delivery || {},
                    orderNumber: order.orderNumber
                });
            }
            
            // Ne pas supprimer la commande tout de suite, on la garde pour référence
            // localStorage.removeItem('pending_order');
        } catch (e) {
            console.error('Error parsing order data:', e);
            orderSummary.innerHTML = '<p>Merci pour votre commande !</p>';
        }
    } else {
        orderSummary.innerHTML = '<p>Merci pour votre commande !</p>';
    }
});

async function fetchOrderFromApi(orderCode, container) {
    try {
        const response = await fetch(`/api/orders/${orderCode}`);
        if (!response.ok) {
            throw new Error('Impossible de récupérer la commande');
        }
        const data = await response.json();
        if (!data.success || !data.order) {
            throw new Error('Commande non trouvée');
        }

        const apiOrder = {
            orderNumber: data.order.orderCode,
            items: data.order.items.map(item => ({
                name: item.name,
                quantity: item.quantity || 1,
                price: String(item.price).replace('.', ','),
                options: item.options || [],
                sauce: item.sauce || null
            })),
            delivery: {
                name: data.order.customer.name,
                class: data.order.customer.class,
                school: data.order.customer.school,
                phone: data.order.customer.phone,
                notes: data.order.notes
            },
            total: data.order.total
        };

        const orderNumberEl = document.getElementById('orderNumber');
        if (orderNumberEl) {
            orderNumberEl.textContent = `Commande #${apiOrder.orderNumber}`;
            orderNumberEl.style.display = 'block';
        }

        renderOrderSummary(apiOrder, container);
    } catch (e) {
        console.error('Erreur lors du chargement de la commande depuis l’API:', e);
    }
}

// Fonction supprimée : Le message WhatsApp est maintenant envoyé automatiquement via Twilio
// Plus besoin d'afficher la section pour que le client copie/envoye le message

function renderOrderSummary(order, container) {
    const itemsHtml = order.items.map(item => {
        let itemDetails = item.name;
        
        // Ajouter les options (crudités)
        if (item.options && item.options.length > 0) {
            const optionsText = item.options.map(opt => opt.name).join(', ');
            itemDetails += ` (+ ${optionsText})`;
        }
        
        // Ajouter la sauce
        if (item.sauce && item.sauce.name) {
            itemDetails += ` [${item.sauce.name}]`;
        }
        
        return `
        <div class="order-item">
            <span>${item.quantity}x ${itemDetails}</span>
            <span>€${(parseFloat(item.price.replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    }).join('');

    const total = order.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price.replace(',', '.')) * item.quantity);
    }, 0);

    const orderSummaryLabel = t('paymentSuccess.orderSummary') || 'Récapitulatif de votre commande';
    const deliveryToLabel = t('paymentSuccess.deliveryTo') || 'Livraison à:';
    const totalLabel = t('cart.total') || 'Total:';
    
    container.innerHTML = `
        <div class="order-details">
            <h3>${orderSummaryLabel}</h3>
            <div class="order-items">
                ${itemsHtml}
            </div>
            <div class="order-total">
                <strong>${totalLabel} €${total.toFixed(2).replace('.', ',')}</strong>
            </div>
            ${order.delivery ? `
                <div class="delivery-info">
                    <h4>Informations de livraison:</h4>
                    <p>${order.delivery.name}<br>
                    Classe: ${order.delivery.class || 'N/A'}<br>
                    École: ${order.delivery.school || 'N/A'}<br>
                    Tél: ${order.delivery.phone}${order.delivery.notes ? `<br>Remarques: ${order.delivery.notes}` : ''}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Styles are now in css/style.css
