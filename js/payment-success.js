// Payment Success Page
document.addEventListener('DOMContentLoaded', function() {
    const orderData = localStorage.getItem('completed_order') || localStorage.getItem('pending_order');
    const orderSummary = document.getElementById('orderSummary');
    
    if (orderData) {
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
