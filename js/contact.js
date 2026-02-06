// Contact Form and Google Maps Integration

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Remplacez par votre Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Remplacez par votre Template ID

// Google Maps Configuration
const MAP_CENTER = { lat: 50.7333, lng: 4.2347 }; // Coordonnées de Halle (Cypriaan Verhavertstraat 156, 1500 Halle)
const MAP_ZOOM = 15;

let map;

// Initialize Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#c9c9c9"}]
            }
        ]
    });

    // Add marker
    const marker = new google.maps.Marker({
        position: MAP_CENTER,
        map: map,
        title: 'Delicorner',
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: '<div style="padding: 10px;"><h3 style="margin: 0 0 5px 0; color: #8b4513;">Delicorner</h3><p style="margin: 0;">Cypriaan Verhavertstraat 156<br>1500 Halle</p></div>'
    });

    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
}

// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide previous messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';

            // Get form data
            const formData = {
                user_name: document.getElementById('name').value,
                user_email: document.getElementById('email').value,
                user_phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Send email using EmailJS
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    formSuccess.style.display = 'block';
                    contactForm.reset();
                    
                    // Scroll to success message
                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, function(error) {
                    console.log('FAILED...', error);
                    formError.style.display = 'block';
                    
                    // Scroll to error message
                    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
        });
    }
});

// Fallback if Google Maps API fails
if (typeof google === 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 15px;">
                    <div style="text-align: center; padding: 2rem;">
                        <p style="font-size: 3rem; margin: 0 0 1rem 0;">🗺️</p>
                        <p style="font-weight: 600; color: #2c2c2c; margin-bottom: 0.5rem;">Carte interactive</p>
                        <p style="color: #666; font-size: 0.9rem;">Ajoutez votre clé API Google Maps pour afficher la carte</p>
                        <p style="color: #999; font-size: 0.8rem; margin-top: 1rem;">Cypriaan Verhavertstraat 156, 1500 Halle</p>
                    </div>
                </div>
            `;
        }
    });
}
