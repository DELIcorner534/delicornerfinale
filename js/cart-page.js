// Cart Page Management
document.addEventListener('DOMContentLoaded', function() {
    if (!window.delicornerCart) {
        window.delicornerCart = new ShoppingCart();
    }

    const cart = window.delicornerCart;
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const checkoutTotalEl = document.querySelector('.checkout-total');

    function renderCart() {
        const items = cart.cart;
        
        if (items.length === 0) {
            cartEmpty.style.display = 'block';
            checkoutSummary.style.display = 'none';
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.appendChild(cartEmpty);
            return;
        }

        cartEmpty.style.display = 'none';
        checkoutSummary.style.display = 'block';

        cartItemsContainer.innerHTML = '';
        
        items.forEach(item => {
            const itemEl = createCartItemElement(item);
            cartItemsContainer.appendChild(itemEl);
        });

        updateTotals();
    }

    function createCartItemElement(item) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        // Extract base name (remove options from name if present)
        let baseName = item.name;
        if (item.name.includes(' (')) {
            baseName = item.name.split(' (')[0];
        }
        
        // Build options display if they exist (crudités)
        let optionsHtml = '';
        if (item.options && item.options.length > 0) {
            const optionsText = item.options.map(opt => opt.name).join(', ');
            optionsHtml = `<div class="cart-item-options"><small>+ ${optionsText}</small></div>`;
        }
        
        // Build sauce display if it exists
        if (item.sauce && item.sauce.name) {
            optionsHtml += `<div class="cart-item-options"><small>${item.sauce.name}</small></div>`;
        }
        
        div.innerHTML = `
            <div class="cart-item-info">
                <h3>${baseName}</h3>
                ${optionsHtml}
                <span class="cart-item-price">€${item.price}</span>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">−</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Supprimer">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 5l10 10M15 5l-10 10"/>
                    </svg>
                </button>
            </div>
            <div class="cart-item-total">
                €${(parseFloat(item.price.replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}
            </div>
        `;

        // Add event listeners
        const decreaseBtn = div.querySelector('[data-action="decrease"]');
        const increaseBtn = div.querySelector('[data-action="increase"]');
        const removeBtn = div.querySelector('.remove-item-btn');

        decreaseBtn.addEventListener('click', () => {
            const newQuantity = item.quantity - 1;
            cart.updateQuantity(item.id, newQuantity);
            renderCart();
        });

        increaseBtn.addEventListener('click', () => {
            cart.updateQuantity(item.id, item.quantity + 1);
            renderCart();
        });

        removeBtn.addEventListener('click', () => {
            cart.removeItem(item.id);
            renderCart();
        });

        return div;
    }

    function updateTotals() {
        const total = cart.getTotal();
        const formattedTotal = total.toFixed(2).replace('.', ',');
        
        subtotalEl.textContent = `€${formattedTotal}`;
        totalEl.textContent = `€${formattedTotal}`;
        
        if (checkoutTotalEl) {
            checkoutTotalEl.textContent = `€${formattedTotal}`;
        }
    }

    // Order time restriction configuration (déclaré AVANT son utilisation)
    const ORDER_CONFIG = {
        // Set to true to allow orders at any time (for simulation/testing)
        SIMULATION_MODE: true,
        // Allowed days: 4 = Thursday, 5 = Friday
        ALLOWED_DAYS: [4, 5],
        // Allowed hours: 00:00 to 08:30
        START_HOUR: 0,
        START_MINUTE: 0,
        END_HOUR: 8,
        END_MINUTE: 30
    };

    // Initial render
    renderCart();

    // Display order time notice and simulation mode
    const orderTimeNotice = document.getElementById('orderTimeNotice');
    if (orderTimeNotice) {
        const simulationNotice = orderTimeNotice.querySelector('.simulation-notice');
        if (ORDER_CONFIG.SIMULATION_MODE && simulationNotice) {
            simulationNotice.style.display = 'block';
        }
    }

    // Function to check if orders are currently allowed
    function isOrderTimeAllowed() {
        // If simulation mode is enabled, always allow orders
        if (ORDER_CONFIG.SIMULATION_MODE) {
            return { allowed: true, message: '' };
        }

        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
        const startTime = ORDER_CONFIG.START_HOUR * 60 + ORDER_CONFIG.START_MINUTE; // 00:00 = 0
        const endTime = ORDER_CONFIG.END_HOUR * 60 + ORDER_CONFIG.END_MINUTE; // 08:30 = 510

        // Check if current day is allowed (Thursday = 4, Friday = 5)
        if (!ORDER_CONFIG.ALLOWED_DAYS.includes(currentDay)) {
            const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
            return {
                allowed: false,
                message: `Les commandes ne sont acceptées que le jeudi et vendredi de 00h à 8h30. Aujourd'hui est ${dayNames[currentDay]}.`
            };
        }

        // Check if current time is within allowed hours
        if (currentTime < startTime || currentTime > endTime) {
            return {
                allowed: false,
                message: `Les commandes ne sont acceptées que le jeudi et vendredi de 00h à 8h30. Il est actuellement ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}.`
            };
        }

        return { allowed: true, message: '' };
    }

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        console.log('✅ Formulaire de checkout trouvé, ajout de l\'événement submit...');
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Formulaire soumis !');
            
            if (cart.cart.length === 0) {
                const emptyCartMsg = t('cart.emptyCart') || 'Votre panier est vide';
                alert(emptyCartMsg);
                return;
            }

            const timeCheck = isOrderTimeAllowed();
            if (!timeCheck.allowed) {
                alert(timeCheck.message);
                return;
            }
            
            const deliveryName = document.getElementById('deliveryName');
            const deliveryClass = document.getElementById('deliveryClass');
            const deliverySchool = document.getElementById('deliverySchool');
            const deliveryPhone = document.getElementById('deliveryPhone');
            const deliveryNotes = document.getElementById('deliveryNotes');
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            
            if (!deliveryName || !deliveryName.value.trim()) {
                alert('Veuillez entrer votre nom.');
                deliveryName?.focus();
                return;
            }
            if (!deliveryPhone || !deliveryPhone.value.trim()) {
                alert('Veuillez entrer votre numéro de téléphone.');
                deliveryPhone?.focus();
                return;
            }
            if (!paymentMethod) {
                alert('Veuillez sélectionner une méthode de paiement.');
                return;
            }
            
            const formData = {
                items: cart.cart,
                total: cart.getTotal(),
                delivery: {
                    name: deliveryName.value.trim(),
                    class: deliveryClass?.value.trim() || '',
                    school: deliverySchool?.value || '',
                    phone: deliveryPhone.value.trim(),
                    address: '',
                    postal: '',
                    city: '',
                    notes: deliveryNotes?.value.trim() || ''
                },
                payment_method: paymentMethod.value
            };

            if (!formData.delivery.name || !formData.delivery.phone) {
                alert('Veuillez remplir tous les champs obligatoires (Nom et Téléphone).');
                return;
            }

            if (typeof processWhatsAppOrder !== 'function') {
                alert('Le système de commande n\'est pas configuré. Veuillez recharger la page.');
                return;
            }

            const isBancontact = paymentMethod.value === 'bancontact';

            if (isBancontact) {
                const result = await processWhatsAppOrder(formData, { skipRedirect: true });
                if (!result.success) return;
                try {
                    await processBancontactPayment(formData, { skipStoreOrder: true });
                } catch (err) {
                    console.error('Erreur Bancontact:', err);
                    const btn = document.getElementById('checkoutBtn');
                    if (btn) { btn.disabled = false; btn.innerHTML = '<span>✅ Valider et envoyer la commande</span><span class="checkout-total">€' + formData.total.toFixed(2).replace('.', ',') + '</span>'; }
                    alert('Impossible de rediriger vers Bancontact. ' + (err.message || 'Veuillez réessayer.'));
                }
                return;
            }

            processWhatsAppOrder(formData).catch(function(error) {
                console.error('❌ Erreur envoi commande:', error);
                alert('Une erreur est survenue. Veuillez réessayer.\n\n' + (error.message || ''));
            });
        });
    }
});
