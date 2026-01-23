// Internationalization System
let currentLanguage = localStorage.getItem('language') || 'fr';

// Initialize translations
document.addEventListener('DOMContentLoaded', function() {
    // Set initial flag and code
    const langIcon = document.getElementById('langIcon');
    const langCode = document.getElementById('langCode');
    if (langIcon) {
        const flagMap = {
            'fr': 'images/flags/fr.svg',
            'nl': 'images/flags/nl.svg',
            'en': 'images/flags/gb.svg'
        };
        langIcon.src = flagMap[currentLanguage] || 'images/flags/fr.svg';
    }
    if (langCode) {
        const codeMap = {
            'fr': 'FR',
            'nl': 'NL',
            'en': 'EN'
        };
        langCode.textContent = codeMap[currentLanguage] || 'FR';
    }
    
    // Update language after a small delay to ensure all elements are loaded
    setTimeout(() => {
        updateLanguage(currentLanguage);
    }, 100);
    
    // Language selector event listeners
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = langDropdown.classList.contains('active');
            langDropdown.classList.toggle('active');
            langBtn.classList.toggle('active', !isActive);
        });
        
        langOptions.forEach((option, index) => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                changeLanguage(lang);
                
                // Close dropdown with delay for smooth animation
                setTimeout(() => {
                    langDropdown.classList.remove('active');
                    langBtn.classList.remove('active');
                }, 200);
            });
            
            // Add hover sound effect (optional - can be removed)
            option.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove('active');
                langBtn.classList.remove('active');
            }
        });
    }
});

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateLanguage(lang);
    updateHtmlLang(lang);
}

function updateLanguage(lang) {
    if (!translations[lang]) return;
    
    const t = translations[lang];
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const placeholderKey = element.getAttribute('data-i18n-placeholder');
        
        // Handle regular translations
        if (key) {
            const keys = key.split('.');
            let value = t;
            
            for (let k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (value !== null) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = value;
                } else if (element.tagName === 'OPTION') {
                    // Handle option elements in select
                    element.textContent = value;
                } else if (element.tagName === 'TEXTAREA' && !placeholderKey) {
                    // Only update textarea content if no placeholder key
                    element.textContent = value;
                } else if (!placeholderKey) {
                    element.textContent = value;
                }
            }
        }
        
        // Handle placeholder translations
        if (placeholderKey) {
            const keys = placeholderKey.split('.');
            let value = t;
            
            for (let k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (value !== null) {
                element.placeholder = value;
            }
        }
    });
    
    // Also handle select options separately (they might not be found by querySelectorAll)
    // This is important because options inside select might not be in the DOM when querySelectorAll runs
    const selectOptions = document.querySelectorAll('select option[data-i18n]');
    selectOptions.forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (key) {
            const keys = key.split('.');
            let value = t;
            
            for (let k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (value !== null) {
                option.textContent = value;
            }
        }
    });
    
    // Force update of select elements to refresh their display
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        // Trigger a change event to ensure the select displays correctly
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
    });
    
    // Update language selector display with flag and code
    const langIcon = document.getElementById('langIcon');
    const langCode = document.getElementById('langCode');
    if (langIcon) {
        const flagMap = {
            'fr': 'images/flags/fr.svg',
            'nl': 'images/flags/be.svg',
            'en': 'images/flags/gb.svg'
        };
        langIcon.src = flagMap[lang] || 'images/flags/fr.svg';
    }
    if (langCode) {
        const codeMap = {
            'fr': 'FR',
            'nl': 'NL',
            'en': 'EN'
        };
        langCode.textContent = codeMap[lang] || 'FR';
    }
}

function updateHtmlLang(lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
}

// Get translation function for use in JavaScript
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (let k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key;
        }
    }
    
    return value || key;
}
