// ===================================
// Mobile Menu Toggle
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignorer les liens vides, les liens externes, ou les URLs complètes
        if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }
        
        // Vérifier que c'est bien un sélecteur CSS valide (commence par #)
        if (!href.startsWith('#')) {
            return;
        }
        
        e.preventDefault();
        
        try {
            const target = document.querySelector(href);
            
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            // Si le sélecteur n'est pas valide, ignorer l'erreur
            console.warn('Sélecteur invalide pour smooth scroll:', href);
        }
    });
});

// ===================================
// Header Scroll Effect
// ===================================
let lastScroll = 0;
const header = document.querySelector('.header');

if (header) {
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// Menu Navigation Active Link
// ===================================
const menuNavLinks = document.querySelectorAll('.menu-nav-link');
const menuSections = document.querySelectorAll('.menu-section');

if (menuNavLinks.length > 0 && menuSections.length > 0) {
    function setActiveMenuLink() {
        let current = '';
        
        menuSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        menuNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveMenuLink);
    setActiveMenuLink();
}

// Contact form is now handled in contact.js

// ===================================
// Intersection Observer for Animations (AOS-like)
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with data-aos attribute
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });
    
    // Also observe elements without data-aos for backward compatibility
    const legacyElements = document.querySelectorAll('.feature-card:not([data-aos]), .category-card:not([data-aos]), .menu-item:not([data-aos]), .value-card:not([data-aos]), .certification-card:not([data-aos])');
    
    legacyElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        const legacyObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    legacyObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        legacyObserver.observe(el);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-bg-image');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px) scale(1)`;
    }
});

// ===================================
// Active Navigation Link Highlighting
// ===================================
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// ===================================
// User Profile Link in Navigation
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Load auth if available
    if (typeof window.auth === 'undefined') {
        // Try to load auth.js
        const script = document.createElement('script');
        script.src = 'js/auth.js';
        script.onload = function() {
            updateNavigationUserLink();
        };
        document.head.appendChild(script);
    } else {
        updateNavigationUserLink();
    }
});

function updateNavigationUserLink() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // Check if user link already exists
    const existingUserLink = navMenu.querySelector('.nav-user-link');
    if (existingUserLink) {
        existingUserLink.remove();
    }

    // Create user link
    const userLink = document.createElement('li');
    userLink.className = 'nav-user-link';
    
    if (window.auth && window.auth.isLoggedIn()) {
        const user = window.auth.getCurrentUser();
        userLink.innerHTML = `<a href="profile.html">👤 ${user.name}</a>`;
    } else {
        userLink.innerHTML = '<a href="login.html">👤 Connexion</a>';
    }

    // Insert before cart link
    const cartLink = navMenu.querySelector('li:last-child');
    if (cartLink) {
        navMenu.insertBefore(userLink, cartLink);
    } else {
        navMenu.appendChild(userLink);
    }
}

// ===================================
// Menu Item Hover Effects
// ===================================
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.borderLeftColor = 'var(--accent-color)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.borderLeftColor = 'var(--primary-color)';
    });
});

// ===================================
// Scroll to Top Button (Optional)
// ===================================
// Uncomment this section if you want a scroll to top button
/*
let scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 999;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
    } else {
        scrollToTopBtn.style.opacity = '0';
    }
});

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
*/

console.log('Delicorner website loaded successfully! 🥪');
