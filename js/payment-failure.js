// Payment Failure Page - Get actual failure reason from Mollie
document.addEventListener('DOMContentLoaded', async function() {
    const failureReasonBox = document.getElementById('failureReasonBox');
    const failureReasonText = document.getElementById('failureReason');
    const checkingStatus = document.getElementById('checkingStatus');
    const genericReasons = document.getElementById('genericReasons');
    
    // Always hide checking status first, show generic reasons
    if (checkingStatus) checkingStatus.style.display = 'none';
    if (genericReasons) genericReasons.style.display = 'block';
    
    // Try to get payment ID from various sources
    let paymentId = null;
    
    // 1. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    paymentId = urlParams.get('payment_id') || urlParams.get('id');
    
    // 2. Check sessionStorage
    if (!paymentId) {
        try {
            paymentId = sessionStorage.getItem('mollie_payment_id');
        } catch (e) {}
    }
    
    // 3. Check cookie
    if (!paymentId) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'mollie_payment_id') {
                paymentId = decodeURIComponent(value);
                break;
            }
        }
    }
    
    if (paymentId) {
        try {
            // Query backend for payment status
            const response = await fetch(`https://delicorner-whatsapp.onrender.com/api/payment-status?id=${paymentId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status && data.status !== 'paid') {
                    // Map Mollie status to user-friendly message
                    const statusMessages = {
                        'canceled': 'U heeft de betaling geannuleerd.',
                        'expired': 'De betaling is verlopen. Probeer het opnieuw.',
                        'failed': 'De betaling is mislukt door uw bank of kaartuitgever.',
                        'open': 'De betaling is nog niet afgerond.',
                        'pending': 'De betaling wordt nog verwerkt.'
                    };
                    
                    let message = statusMessages[data.status] || `Betalingsstatus: ${data.status}`;
                    
                    // Add failure reason if available from Mollie
                    if (data.failureReason) {
                        const failureReasons = {
                            'insufficient_funds': 'Onvoldoende saldo op uw rekening.',
                            'card_declined': 'Uw kaart is geweigerd door de bank.',
                            'card_expired': 'Uw kaart is verlopen.',
                            'invalid_card': 'Ongeldige kaartgegevens.',
                            'authentication_failed': 'Authenticatie mislukt (3D Secure).',
                            'refused': 'Transactie geweigerd door de bank.',
                            'canceled_by_user': 'U heeft de betaling geannuleerd.'
                        };
                        message = failureReasons[data.failureReason] || data.failureReason;
                    }
                    
                    // Display the actual reason above generic reasons
                    if (failureReasonBox && failureReasonText) {
                        failureReasonText.textContent = message;
                        failureReasonBox.style.display = 'block';
                    }
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            // Keep showing generic reasons on error
        }
    }
    
    // Clean up stored payment ID
    try {
        sessionStorage.removeItem('mollie_payment_id');
        document.cookie = 'mollie_payment_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {}
});
