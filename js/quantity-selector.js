// Quantity Selector for Menu Items
(function() {
    'use strict';
    
    function initQuantitySelectors() {
        // Add quantity selectors to all menu items that don't already have one
        const addCartButtons = document.querySelectorAll('.btn-add-cart');
        
        addCartButtons.forEach(button => {
            const itemId = button.getAttribute('data-id');
            
            // Check if quantity selector already exists
            const existingQty = document.getElementById(`qty-${itemId}`);
            if (existingQty) {
                return; // Skip if already exists
            }
            
            // Check if actions container already exists
            let actionsContainer = button.parentNode.querySelector('.menu-item-actions');
            
            if (!actionsContainer) {
                // Create actions container
                actionsContainer = document.createElement('div');
                actionsContainer.className = 'menu-item-actions';
                
                // Move button into actions container
                button.parentNode.insertBefore(actionsContainer, button);
                actionsContainer.appendChild(button);
            }
            
            // Create quantity selector
            const quantityContainer = document.createElement('div');
            quantityContainer.className = 'menu-item-quantity';
            quantityContainer.innerHTML = `
                <button class="qty-btn qty-minus" data-id="${itemId}" type="button">−</button>
                <input type="number" class="qty-input" id="qty-${itemId}" value="1" min="1" max="99" readonly>
                <button class="qty-btn qty-plus" data-id="${itemId}" type="button">+</button>
            `;
            
            // Insert quantity selector before the add button in actions container
            actionsContainer.insertBefore(quantityContainer, button);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuantitySelectors);
    } else {
        initQuantitySelectors();
    }
    
    // Use event delegation for quantity buttons (works for dynamically created elements)
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle plus button
        if (target.classList.contains('qty-plus') || target.closest('.qty-plus')) {
            e.preventDefault();
            e.stopPropagation();
            
            const btn = target.classList.contains('qty-plus') ? target : target.closest('.qty-plus');
            const itemId = btn.getAttribute('data-id');
            const input = document.getElementById(`qty-${itemId}`);
            
            if (input) {
                let value = parseInt(input.value) || 1;
                if (value < 99) {
                    input.value = value + 1;
                    // Trigger input event for any listeners
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            return false;
        }
        
        // Handle minus button
        if (target.classList.contains('qty-minus') || target.closest('.qty-minus')) {
            e.preventDefault();
            e.stopPropagation();
            
            const btn = target.classList.contains('qty-minus') ? target : target.closest('.qty-minus');
            const itemId = btn.getAttribute('data-id');
            const input = document.getElementById(`qty-${itemId}`);
            
            if (input) {
                let value = parseInt(input.value) || 1;
                if (value > 1) {
                    input.value = value - 1;
                    // Trigger input event for any listeners
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            return false;
        }
    });
})();
