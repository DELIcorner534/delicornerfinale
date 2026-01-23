// Menu Cart Integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if not already done
    if (!window.delicornerCart) {
        window.delicornerCart = new ShoppingCart();
    }

    // Crudités options data
    const cruditesOptions = {
        'alle-groenten': { name: 'Alle groenten', price: 0.50 },
        'wortel': { name: 'Wortel', price: 0.20 },
        'sla': { name: 'Sla', price: 0.20 },
        'komkommer': { name: 'Komkommer', price: 0.20 },
        'tomaten': { name: 'Tomaten', price: 0.20 }
    };

    // Sauce options data (free, no price)
    const sauceOptions = {
        'geen-saus': { name: 'Geen saus' },
        'andalouse': { name: 'Andalouse' },
        'brasil': { name: 'Brasil' },
        'mayonaise': { name: 'Mayonaise' },
        'ketchup': { name: 'Ketchup' },
        'samourai': { name: 'Samourai' },
        'curry-ketchup': { name: 'Curry ketchup' },
        'looksaus': { name: 'Looksaus' }
    };

    // Modal elements for crudités
    const cruditesModal = document.getElementById('cruditesModal');
    const cruditesModalClose = document.getElementById('cruditesModalClose');
    const cruditesModalCancel = document.getElementById('cruditesModalCancel');
    const cruditesModalAdd = document.getElementById('cruditesModalAdd');
    const cruditesBasePrice = document.getElementById('cruditesBasePrice');
    const cruditesOptionsPrice = document.getElementById('cruditesOptionsPrice');
    const cruditesTotalPrice = document.getElementById('cruditesTotalPrice');
    const cruditesCheckboxes = document.querySelectorAll('#cruditesModal .crudites-option input[type="checkbox"]');

    // Modal elements for sauce
    const sauceModal = document.getElementById('sauceModal');
    const sauceModalClose = document.getElementById('sauceModalClose');
    const sauceModalCancel = document.getElementById('sauceModalCancel');
    const sauceModalAdd = document.getElementById('sauceModalAdd');
    const sauceRadios = document.querySelectorAll('#sauceModal input[type="radio"][name="sauce"]');

    let currentItemData = null;
    let currentQuantity = 1;

    // Function to open crudités modal
    function openCruditesModal(itemData, quantity) {
        currentItemData = itemData;
        currentQuantity = quantity;
        
        // Reset checkboxes
        cruditesCheckboxes.forEach(cb => cb.checked = false);
        
        // Update modal title
        const modalTitle = document.getElementById('cruditesModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Ajouter ${itemData.name}`;
        }
        
        // Update base price
        const basePrice = parseFloat(itemData.price.replace(',', '.'));
        cruditesBasePrice.textContent = `€${basePrice.toFixed(2).replace('.', ',')}`;
        
        // Update prices
        updateCruditesPrices();
        
        // Show modal
        cruditesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to close modal
    function closeCruditesModal() {
        cruditesModal.classList.remove('active');
        document.body.style.overflow = '';
        currentItemData = null;
    }

    // Function to open sauce modal
    function openSauceModal(itemData, quantity) {
        currentItemData = itemData;
        currentQuantity = quantity;
        
        // Set default to "geen saus"
        const geenSausRadio = document.querySelector('#sauceModal input[value="geen-saus"]');
        if (geenSausRadio) {
            geenSausRadio.checked = true;
        }
        
        // Update modal title
        const modalTitle = document.getElementById('sauceModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Ajouter ${itemData.name}`;
        }
        
        // Show modal
        sauceModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to close sauce modal
    function closeSauceModal() {
        sauceModal.classList.remove('active');
        document.body.style.overflow = '';
        currentItemData = null;
    }

    // Function to update prices in modal
    function updateCruditesPrices() {
        if (!currentItemData) return;
        
        const basePrice = parseFloat(currentItemData.price.replace(',', '.'));
        let optionsPrice = 0;
        const selectedOptions = [];
        
        cruditesCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const optionValue = checkbox.value;
                if (cruditesOptions[optionValue]) {
                    optionsPrice += cruditesOptions[optionValue].price;
                    selectedOptions.push(cruditesOptions[optionValue]);
                }
            }
        });
        
        const totalPrice = basePrice + optionsPrice;
        
        cruditesOptionsPrice.textContent = `€${optionsPrice.toFixed(2).replace('.', ',')}`;
        cruditesTotalPrice.textContent = `€${totalPrice.toFixed(2).replace('.', ',')}`;
    }

    // Event listeners for checkboxes
    cruditesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCruditesPrices);
    });

    // Close crudités modal events
    if (cruditesModalClose) {
        cruditesModalClose.addEventListener('click', closeCruditesModal);
    }
    
    if (cruditesModalCancel) {
        cruditesModalCancel.addEventListener('click', closeCruditesModal);
    }

    // Close crudités modal when clicking outside
    if (cruditesModal) {
        cruditesModal.addEventListener('click', function(e) {
            if (e.target === cruditesModal) {
                closeCruditesModal();
            }
        });
    }

    // Close sauce modal events
    if (sauceModalClose) {
        sauceModalClose.addEventListener('click', closeSauceModal);
    }
    
    if (sauceModalCancel) {
        sauceModalCancel.addEventListener('click', closeSauceModal);
    }

    // Close sauce modal when clicking outside
    if (sauceModal) {
        sauceModal.addEventListener('click', function(e) {
            if (e.target === sauceModal) {
                closeSauceModal();
            }
        });
    }

    // Add to cart from sauce modal
    if (sauceModalAdd) {
        sauceModalAdd.addEventListener('click', function() {
            if (!currentItemData) return;
            
            // Get selected sauce
            const selectedSauceRadio = document.querySelector('#sauceModal input[name="sauce"]:checked');
            const selectedSauceValue = selectedSauceRadio ? selectedSauceRadio.value : 'geen-saus';
            const selectedSauce = sauceOptions[selectedSauceValue];
            
            // Save item ID before closing modal (which sets currentItemData to null)
            const itemId = currentItemData.id;
            
            // Create item name with sauce
            let itemName = currentItemData.name;
            if (selectedSauce && selectedSauceValue !== 'geen-saus') {
                itemName += ` (${selectedSauce.name})`;
            }
            
            // Add item multiple times based on quantity
            for (let i = 0; i < currentQuantity; i++) {
                // Generate unique ID for each item (especially if sauce is selected)
                const uniqueId = selectedSauceValue !== 'geen-saus' 
                    ? itemId + '-sauce-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 9)
                    : itemId;
                
                const item = {
                    id: uniqueId,
                    name: itemName,
                    price: currentItemData.price,
                    sauce: selectedSauceValue !== 'geen-saus' ? selectedSauce : null,
                    originalId: itemId
                };
                window.delicornerCart.addItem(item);
            }
            
            closeSauceModal();
            
            // Visual feedback on original button
            const originalButton = document.querySelector(`[data-id="${itemId}"]`);
            if (originalButton) {
                originalButton.classList.add('added');
                const originalText = originalButton.textContent;
                const addedText = t('menuPage.added') || '✓ Ajouté !';
                originalButton.textContent = addedText;
                
                setTimeout(() => {
                    originalButton.classList.remove('added');
                    originalButton.textContent = originalText;
                }, 2000);
            }
        });
    }

    // Add to cart from crudités modal
    if (cruditesModalAdd) {
        cruditesModalAdd.addEventListener('click', function() {
            if (!currentItemData) return;
            
            const basePrice = parseFloat(currentItemData.price.replace(',', '.'));
            let optionsPrice = 0;
            const selectedOptions = [];
            
            cruditesCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const optionValue = checkbox.value;
                    if (cruditesOptions[optionValue]) {
                        optionsPrice += cruditesOptions[optionValue].price;
                        selectedOptions.push(cruditesOptions[optionValue]);
                    }
                }
            });
            
            const totalPrice = basePrice + optionsPrice;
            const finalPrice = totalPrice.toFixed(2).replace('.', ',');
            
            // Create item name with options
            let itemName = currentItemData.name;
            if (selectedOptions.length > 0) {
                const optionsText = selectedOptions.map(opt => opt.name).join(', ');
                itemName += ` (${optionsText})`;
            }
            
            // Save item ID before closing modal (which sets currentItemData to null)
            const itemId = currentItemData.id;
            
            // Add item multiple times based on quantity
            for (let i = 0; i < currentQuantity; i++) {
                // Generate unique ID for each item (especially if options are selected)
                const uniqueId = selectedOptions.length > 0 
                    ? itemId + '-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 9)
                    : itemId;
                
                const item = {
                    id: uniqueId,
                    name: itemName,
                    price: finalPrice,
                    basePrice: currentItemData.price,
                    options: selectedOptions.length > 0 ? selectedOptions : null,
                    originalId: itemId
                };
                window.delicornerCart.addItem(item);
            }
            
            closeCruditesModal();
            
            // Visual feedback on original button
            const originalButton = document.querySelector(`[data-id="${itemId}"]`);
            if (originalButton) {
                originalButton.classList.add('added');
                const originalText = originalButton.textContent;
                const addedText = t('menuPage.added') || '✓ Ajouté !';
                originalButton.textContent = addedText;
                
                setTimeout(() => {
                    originalButton.classList.remove('added');
                    originalButton.textContent = originalText;
                }, 2000);
            }
        });
    }

    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const itemId = this.getAttribute('data-id');
            const itemName = this.getAttribute('data-name');
            const itemPrice = this.getAttribute('data-price');
            const category = this.getAttribute('data-category');
            
            // Get quantity from input
            const quantityInput = document.getElementById(`qty-${itemId}`);
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            if (!itemId || !itemName || !itemPrice) {
                console.error('Missing item data');
                return;
            }
            
            const itemData = {
                id: itemId,
                name: itemName,
                price: itemPrice
            };
            
            // If it's a "basics" item, open the crudités modal
            if (category === 'basics') {
                openCruditesModal(itemData, quantity);
            } else if (category === 'panini-sauce') {
                // If it's a "panini-sauce" item, open the sauce modal
                openSauceModal(itemData, quantity);
            } else {
                // For other items, add directly to cart
                for (let i = 0; i < quantity; i++) {
                    window.delicornerCart.addItem(itemData);
                }
                
                // Visual feedback
                this.classList.add('added');
                const originalText = this.textContent;
                const addedText = t('menuPage.added') || '✓ Ajouté !';
                this.textContent = addedText;
                
                setTimeout(() => {
                    this.classList.remove('added');
                    this.textContent = originalText;
                }, 2000);
            }
        });
    });
});
