// Cart Page Management
document.addEventListener('DOMContentLoaded', function() {
    if (!window.delicornerCart) {
        window.delicornerCart = new ShoppingCart();
    }

    const cart = window.delicornerCart;

    // Custom Alert Function
    function showAlert(message, icon = '⚠️') {
        const alertOverlay = document.getElementById('customAlert');
        const alertMessage = document.getElementById('customAlertMessage');
        const alertBtn = document.getElementById('customAlertBtn');
        const alertIcon = alertOverlay?.querySelector('.custom-alert-icon');
        
        if (alertOverlay && alertMessage) {
            alertMessage.textContent = message;
            if (alertIcon) alertIcon.textContent = icon;
            alertOverlay.style.display = 'flex';
            
            // Close on button click
            const closeAlert = () => {
                alertOverlay.style.display = 'none';
                alertBtn?.removeEventListener('click', closeAlert);
            };
            alertBtn?.addEventListener('click', closeAlert);
            
            // Close on overlay click
            alertOverlay.addEventListener('click', (e) => {
                if (e.target === alertOverlay) closeAlert();
            });
            
            // Close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeAlert();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        } else {
            // Fallback to native alert
            alert(message);
        }
    }
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

    // Setup date picker for advance orders (only Thursday and Friday)
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        // Get today's date
        const today = new Date();
        
        // Function to get next valid order day (Thursday=4 or Friday=5)
        function getNextOrderDay(date) {
            const day = date.getDay();
            // Find next Thursday or Friday
            if (day === 0) { // Sunday -> Thursday (+4)
                date.setDate(date.getDate() + 4);
            } else if (day === 1) { // Monday -> Thursday (+3)
                date.setDate(date.getDate() + 3);
            } else if (day === 2) { // Tuesday -> Thursday (+2)
                date.setDate(date.getDate() + 2);
            } else if (day === 3) { // Wednesday -> Thursday (+1)
                date.setDate(date.getDate() + 1);
            } else if (day === 4) { // Thursday -> OK
                // Already Thursday, keep it
            } else if (day === 5) { // Friday -> OK
                // Already Friday, keep it
            } else if (day === 6) { // Saturday -> Thursday (+5)
                date.setDate(date.getDate() + 5);
            }
            return date;
        }
        
        // Set minimum date to next Thursday or Friday
        const minDate = getNextOrderDay(new Date(today));
        
        // Set maximum date to 1 month from now
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 30); // 1 month
        
        // Format dates for input
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        deliveryDateInput.min = formatDate(minDate);
        deliveryDateInput.max = formatDate(maxDate);
        deliveryDateInput.value = formatDate(minDate); // Default to next Thursday/Friday
        
        // Validate that selected date is Thursday or Friday only
        deliveryDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const dayOfWeek = selectedDate.getDay();
            
            // Only allow Thursday (4) and Friday (5)
            if (dayOfWeek !== 4 && dayOfWeek !== 5) {
                showAlert('Bestellingen zijn alleen mogelijk op donderdag en vrijdag.', '📅');
                this.value = formatDate(minDate);
            }
        });
    }

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
                const emptyCartMsg = t('cart.emptyCart') || 'Uw winkelwagen is leeg';
                showAlert(emptyCartMsg, '🛒');
                return;
            }

            const timeCheck = isOrderTimeAllowed();
            if (!timeCheck.allowed) {
                showAlert(timeCheck.message, '⏰');
                return;
            }
            
            const deliveryName = document.getElementById('deliveryName');
            const deliveryClass = document.getElementById('deliveryClass');
            const deliverySchool = document.getElementById('deliverySchool');
            const deliveryDate = document.getElementById('deliveryDate');
            const deliveryPhone = document.getElementById('deliveryPhone');
            const deliveryNotes = document.getElementById('deliveryNotes');
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            
            if (!deliveryName || !deliveryName.value.trim()) {
                showAlert('Vul uw naam in.', '✏️');
                deliveryName?.focus();
                return;
            }
            if (!deliveryPhone || !deliveryPhone.value.trim()) {
                showAlert('Vul uw telefoonnummer in.', '📱');
                deliveryPhone?.focus();
                return;
            }
            if (!deliveryDate || !deliveryDate.value) {
                showAlert('Selecteer een datum voor uw bestelling.', '📅');
                deliveryDate?.focus();
                return;
            }
            if (!paymentMethod) {
                showAlert('Selecteer een betaalmethode.', '💳');
                return;
            }
            
            // Format the date for display (DD/MM/YYYY)
            const dateObj = new Date(deliveryDate.value);
            const formattedDate = dateObj.toLocaleDateString('nl-BE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const formData = {
                items: cart.cart,
                total: cart.getTotal(),
                delivery: {
                    name: deliveryName.value.trim(),
                    class: deliveryClass?.value.trim() || '',
                    school: deliverySchool?.value || '',
                    date: deliveryDate.value,
                    dateFormatted: formattedDate,
                    phone: deliveryPhone.value.trim(),
                    address: '',
                    postal: '',
                    city: '',
                    notes: deliveryNotes?.value.trim() || ''
                },
                payment_method: paymentMethod.value
            };

            if (!formData.delivery.name || !formData.delivery.phone) {
                showAlert('Vul alle verplichte velden in (Naam en Telefoon).', '⚠️');
                return;
            }

            const isBancontact = paymentMethod.value === 'bancontact';

            if (isBancontact) {
                if (typeof processBancontactPayment !== 'function') {
                    showAlert('Bancontact betaling is niet geconfigureerd. Herlaad de pagina.', '❌');
                    return;
                }
                formData.orderNumber = (window.orderNumberManager && typeof window.orderNumberManager.getNextOrderNumber === 'function')
                    ? window.orderNumberManager.getNextOrderNumber()
                    : String(Date.now()).slice(-6);
                
                // Show loading overlay
                const loadingOverlay = document.getElementById('loadingOverlay');
                const checkoutBtn = document.getElementById('checkoutBtn');
                if (loadingOverlay) loadingOverlay.style.display = 'flex';
                if (checkoutBtn) {
                    checkoutBtn.disabled = true;
                    checkoutBtn.innerHTML = '<span>⏳ Even geduld...</span>';
                }
                
                try {
                    await processBancontactPayment(formData, { skipStoreOrder: false });
                } catch (err) {
                    console.error('Erreur Bancontact:', err);
                    // Hide loading overlay on error
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    if (checkoutBtn) { 
                        checkoutBtn.disabled = false; 
                        checkoutBtn.innerHTML = '<span>Bestelling bevestigen</span><span class="checkout-total">€' + formData.total.toFixed(2).replace('.', ',') + '</span>'; 
                    }
                    showAlert('Kan niet doorverwijzen naar Bancontact. ' + (err.message || 'Probeer opnieuw.'), '❌');
                }
                return;
            }

            if (typeof processWhatsAppOrder !== 'function') {
                showAlert('Het bestelsysteem is niet geconfigureerd. Herlaad de pagina.', '❌');
                return;
            }
            processWhatsAppOrder(formData).catch(function(error) {
                console.error('❌ Erreur envoi commande:', error);
                showAlert('Er is een fout opgetreden. Probeer opnieuw. ' + (error.message || ''), '❌');
            });
        });
    }
});
