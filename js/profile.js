// Profile Page Handler
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!window.auth || !window.auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = window.auth.getCurrentUser();
    
    // Display user info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone;
    
    const createdAt = new Date(user.createdAt);
    document.getElementById('profileDate').textContent = createdAt.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load order history
    loadOrderHistory();

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const confirmMessage = t('profile.logoutConfirm') || 'Êtes-vous sûr de vouloir vous déconnecter ?';
            if (confirm(confirmMessage)) {
                window.auth.logout();
            }
        });
    }
});

function loadOrderHistory() {
    const orders = window.auth.getUserOrders();
    const orderHistory = document.getElementById('orderHistory');
    const orderEmpty = document.getElementById('orderEmpty');

    if (orders.length === 0) {
        orderEmpty.style.display = 'block';
        return;
    }

    orderEmpty.style.display = 'none';
    orderHistory.innerHTML = '';

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        orderHistory.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = order.items.map(item => `
            <div class="order-item">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">x${item.quantity || 1}</span>
                <span class="order-item-price">€${item.price}</span>
            </div>
        `).join('');
    } else {
        itemsHtml = '<p class="order-no-items">Aucun détail disponible</p>';
    }

    const orderNumberLabel = t('profile.orderNumber') || 'Commande #';
    const deliveryLabel = t('profile.delivery') || 'Livraison :';
    const totalLabel = t('profile.total') || 'Total :';
    
    card.innerHTML = `
        <div class="order-card-header">
            <div>
                <h3>${orderNumberLabel}${order.id.slice(-6)}</h3>
                <p class="order-date">${formattedDate}</p>
            </div>
            <div class="order-status order-status-${order.status}">
                ${getStatusLabel(order.status)}
            </div>
        </div>
        <div class="order-card-body">
            <div class="order-items">
                ${itemsHtml}
            </div>
            ${order.deliveryInfo && order.deliveryInfo.address ? `
                <div class="order-delivery">
                    <strong>${deliveryLabel}</strong>
                    <p>${order.deliveryInfo.address}, ${order.deliveryInfo.postal} ${order.deliveryInfo.city}</p>
                </div>
            ` : ''}
        </div>
        <div class="order-card-footer">
            <div class="order-total">
                <strong>${totalLabel} €${parseFloat(order.total).toFixed(2)}</strong>
            </div>
        </div>
    `;

    return card;
}

function getStatusLabel(status) {
    const statusMap = {
        'pending': t('profile.statusPending') || 'En attente',
        'preparing': t('profile.statusPreparing') || 'En préparation',
        'ready': t('profile.statusReady') || 'Prête',
        'completed': t('profile.statusCompleted') || 'Terminée',
        'cancelled': t('profile.statusCancelled') || 'Annulée'
    };
    return statusMap[status] || status;
}
