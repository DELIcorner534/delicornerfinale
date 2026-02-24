// Payment Success Page
const API_BASE = 'https://delicorner-whatsapp.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('whatsapp_failed') === '1') {
        var fallback = 'Uw bestelling is geregistreerd, maar de WhatsApp-melding kon niet naar de broodjeszaak worden gestuurd. Bel 0488/153.993 om te bevestigen.';
        var msg = (typeof t === 'function' && t('paymentSuccess.whatsappFailed') && t('paymentSuccess.whatsappFailed') !== 'paymentSuccess.whatsappFailed')
            ? t('paymentSuccess.whatsappFailed') : fallback;
        alert(msg);
        history.replaceState({}, '', window.location.pathname);
    }
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

            // Préparer le bouton WhatsApp avec le code localStorage
            setupWhatsappButton(order.orderNumber, order.delivery?.name || null);
            
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
            orderSummary.innerHTML = '<p>Bedankt voor uw bestelling!</p>';
        }
    } else {
        orderSummary.innerHTML = '<p>Bedankt voor uw bestelling!</p>';
    }
});

async function fetchOrderFromApi(orderCode, container) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderCode}`);
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
            orderNumberEl.textContent = `Bestelling #${apiOrder.orderNumber}`;
            orderNumberEl.style.display = 'block';
        }

        renderOrderSummary(apiOrder, container);

        // Configurer le bouton WhatsApp avec les infos de l'API
        setupWhatsappButton(apiOrder.orderNumber, apiOrder.delivery?.name || null);
    } catch (e) {
        console.error('Erreur lors du chargement de la commande depuis l’API:', e);
    }
}

async function setupWhatsappButton(orderCode, customerName) {
    try {
        const btn = document.getElementById('whatsappButton');
        if (!btn || !orderCode) return;

        const res = await fetch(`${API_BASE}/api/config`);
        if (!res.ok) throw new Error('Impossible de charger la configuration WhatsApp');
        const cfg = await res.json();
        const whatsappPhone = cfg.whatsappPhone || '32488153993';

        const namePart = customerName ? `\nNom: ${customerName}` : '';
        const text = encodeURIComponent(
            `Bonjour, voici mon code de commande Delicorner: ${orderCode}.${namePart ? namePart : ''}`
        );

        btn.href = `https://wa.me/${whatsappPhone}?text=${text}`;
        btn.style.display = 'inline-flex';
    } catch (e) {
        console.error('Erreur configuration bouton WhatsApp:', e);
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

    const orderSummaryLabel = t('paymentSuccess.orderSummary') || 'Samenvatting van uw bestelling';
    const deliveryToLabel = t('paymentSuccess.deliveryTo') || 'Leveringsgegevens:';
    const totalLabel = t('cart.total') || 'Totaal:';
    
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
                    <h4>${deliveryToLabel}</h4>
                    <p>${order.delivery.name}<br>
                    Klas: ${order.delivery.class || 'N/A'}<br>
                    School: ${order.delivery.school || 'N/A'}<br>
                    Tel: ${order.delivery.phone}${order.delivery.notes ? `<br>Opmerkingen: ${order.delivery.notes}` : ''}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Styles are now in css/style.css
