# Delicorner - Site Web de Sandwicherie 🥪

Site web moderne, multilingue et e-commerce pour la sandwicherie **Delicorner**, avec système de commande en ligne et paiement Bancontact.

## ✨ Caractéristiques Principales

### 🌍 Multilingue
- **3 langues** : Français, Nederlands (Néerlandais), English (Anglais)
- Sélecteur de langue dans le header
- Traductions complètes de toutes les pages
- Sauvegarde de la langue préférée

### 🛒 E-commerce Complet
- **Système de panier** avec localStorage
- **Boutons "Ajouter"** sur chaque item du menu
- **Page panier/checkout** avec récapitulatif
- **Paiement Bancontact** via Mollie API
- **Indicateur de panier** dans le header
- **Images réelles** pour chaque produit

### 🎨 Design "WOW"
- Images réelles depuis Unsplash
- Effets parallax et animations au scroll
- Design moderne et responsive

### 📧 Formulaire de Contact avec Backend
- EmailJS intégré pour l'envoi d'emails
- Validation côté client
- Messages de succès/erreur

### 🗺️ Google Maps
- Carte interactive intégrée
- Marqueur personnalisé
- Style personnalisé

---

## ⚙️ Configuration Requise

### 1. Configuration EmailJS (Formulaire de Contact)

#### Étapes :
1. **Créer un compte EmailJS**
   - Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
   - Créez un compte gratuit (200 emails/mois gratuits)

2. **Configurer un service email**
   - Dans le dashboard, allez dans "Email Services"
   - Ajoutez votre service (Gmail, Outlook, etc.)
   - Suivez les instructions pour connecter votre compte email

3. **Créer un template email**
   - Allez dans "Email Templates"
   - Créez un nouveau template
   - Utilisez ces variables dans le template :
     ```
     {{user_name}}
     {{user_email}}
     {{user_phone}}
     {{subject}}
     {{message}}
     ```

4. **Obtenir vos clés**
   - Allez dans "Account" > "General"
   - Copiez votre "Public Key"

5. **Configurer dans le code**
   - **Dans `contact.html`** (ligne ~16) :
     ```javascript
     emailjs.init("VOTRE_PUBLIC_KEY_ICI");
     ```
   
   - **Dans `js/contact.js`** (lignes 7-8) :
     ```javascript
     const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID';
     const EMAILJS_TEMPLATE_ID = 'VOTRE_TEMPLATE_ID';
     ```
     > Vous trouverez le Service ID dans "Email Services" et le Template ID dans "Email Templates"

---

### 2. Configuration Google Maps

#### Étapes :
1. **Obtenir une clé API Google Maps**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un projet ou sélectionnez un projet existant
   - Activez l'API "Maps JavaScript API"
   - Créez des identifiants (clé API)
   - **IMPORTANT** : Configurez les restrictions d'application (limitez aux domaines autorisés)

2. **Configurer dans le code**
   - **Dans `contact.html`** (ligne ~19) :
     ```html
     <script async defer src="https://maps.googleapis.com/maps/api/js?key=VOTRE_CLE_API_ICI&callback=initMap"></script>
     ```

3. **Définir les coordonnées de votre adresse**
   - **Dans `js/contact.js`** (ligne ~11) :
     ```javascript
     const MAP_CENTER = { lat: 50.8503, lng: 4.3517 }; // Remplacez par vos coordonnées
     ```
   - Pour obtenir vos coordonnées : [Google Maps Coordinate Tool](https://www.google.com/maps) ou cherchez votre adresse sur Google Maps et copiez les coordonnées

---

### 3. Configuration Bancontact (Paiement)

#### Option A : Via Mollie (Recommandé pour production)

**Étapes :**

1. **Créer un compte Mollie**
   - Allez sur [https://www.mollie.com/](https://www.mollie.com/)
   - Créez un compte (test gratuit disponible)
   - Complétez la vérification de votre entreprise (pour les clés live)

2. **Obtenir vos clés API**
   - Dans le dashboard Mollie, allez dans "Developers" > "API Keys"
   - **Pour les tests** : Utilisez une clé de test (commence par `test_`)
   - **Pour la production** : Utilisez une clé live (commence par `live_`)

3. **Configurer dans le code**
   - **Dans `js/bancontact.js`** (ligne ~6) :
     ```javascript
     const MOLLIE_API_KEY = 'test_VOTRE_CLE_API_ICI';
     ```
   
   - **URLs de redirection** (lignes 7-8) :
     ```javascript
     const PAYMENT_SUCCESS_URL = window.location.origin + '/payment-success.html';
     const PAYMENT_FAILURE_URL = window.location.origin + '/payment-failure.html';
     ```
     > Assurez-vous que ces URLs correspondent à vos pages

4. **⚠️ IMPORTANT - Sécurité en production**
   - **Ne jamais** utiliser la clé API Mollie directement dans le JavaScript côté client
   - Créez un **backend API** qui :
     - Reçoit les données de commande depuis le frontend
     - Crée le paiement Mollie côté serveur
     - Retourne l'URL de checkout au frontend
   - **Exemple de backend** : Node.js, PHP, Python, etc.

5. **Configuration webhook (optionnel mais recommandé)**
   - Dans le dashboard Mollie, configurez un webhook URL
   - Ce webhook recevra les notifications de statut de paiement
   - **Dans `js/bancontact.js`** (ligne ~37) :
     ```javascript
     webhookUrl: 'https://votredomaine.com/api/webhook',
     ```

#### Option B : Mode Démo (Pour tester)

Le mode démo est activé par défaut dans `js/bancontact.js`. Il simule le processus de paiement sans connexion réelle.

Pour l'utiliser :
- Aucune configuration nécessaire
- Le paiement est simulé
- Utile pour tester l'interface sans clé API

**Pour désactiver le mode démo**, dans `js/bancontact.js` (dernière ligne) :
```javascript
// Remplacez :
window.processBancontactPayment = processBancontactPaymentDemo;

// Par :
window.processBancontactPayment = processBancontactPayment; // Utilise l'API Mollie réelle
```

---

### 4. Configuration des Informations de Contact

#### Modifier les informations de l'entreprise

1. **Dans `contact.html`** (section contact-info, lignes ~55-81) :
   ```html
   <p>Votre adresse complète<br>Code postal, Ville<br>Belgique</p>
   <p><a href="tel:+32XXXXXXXXX">+32 XX XXX XX XX</a></p>
   <p><a href="mailto:sisidelicorner@gmail.com">sisidelicorner@gmail.com</a></p>
   ```

2. **Dans le footer de toutes les pages** :
   - Cherchez la section "Contact" dans le footer
   - Remplacez :
     - 📍 Votre adresse
     - 📞 Votre téléphone
     - ✉️ Votre email

3. **Horaires d'ouverture** :
   - Modifiez dans la section "Horaires" du footer et de la page contact

---

### 5. Configuration des Images

#### Images du Menu

Les images utilisent actuellement Unsplash. Pour optimiser :

1. **Télécharger les images localement** :
   - Créez un dossier `images/menu/`
   - Téléchargez les images depuis Unsplash
   - Renommez-les selon les IDs des items (ex: `basics-kaas-mayonaise.jpg`)

2. **Mettre à jour les chemins** :
   - Dans `menu.html`, remplacez les URLs Unsplash par :
     ```html
     <img src="images/menu/basics-kaas-mayonaise.jpg" alt="Kaas met Mayonaise">
     ```

#### Images du Hero

L'image du hero est dans `index.html`. Pour la changer :
- Remplacez l'URL Unsplash par votre propre image
- Ou téléchargez l'image et utilisez un chemin local

---

### 6. Configuration des Traductions

#### Ajouter/modifier des traductions

1. **Ouvrir `js/translations.js`**
2. **Modifier les textes** dans les objets `fr`, `nl`, `en`
3. **Pour ajouter une nouvelle traduction** :
   - Ajoutez la clé dans les trois langues
   - Utilisez `data-i18n="votre.clé"` dans le HTML

---

## 📁 Structure du Projet

```
Delicorner/
├── index.html              # Page d'accueil
├── menu.html               # Menu avec images et panier
├── cart.html               # Page panier/checkout
├── payment-success.html    # Page de succès paiement
├── about.html              # À propos
├── contact.html            # Contact avec formulaire et carte
├── css/
│   └── style.css          # Styles CSS principaux
├── js/
│   ├── main.js            # JavaScript principal
│   ├── cart.js            # Système de panier
│   ├── menu-cart.js       # Intégration panier menu
│   ├── cart-page.js       # Gestion page panier
│   ├── bancontact.js      # Paiement Bancontact
│   ├── contact.js         # Formulaire contact + Maps
│   ├── payment-success.js # Page succès paiement
│   ├── translations.js    # Traductions FR/NL/EN
│   └── i18n.js            # Système multilingue
└── README.md              # Ce fichier
```

---

## 🚀 Déploiement

### Préparation

1. **Configurer toutes les clés API** (voir sections ci-dessus)
2. **Tester localement** avec un serveur local :
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

### Hébergement

#### Netlify (Recommandé pour sites statiques)
1. Drag & drop du dossier sur [Netlify](https://www.netlify.com/)
2. Ou connectez via Git (GitHub, GitLab, etc.)
3. Configurez les variables d'environnement si nécessaire

#### Vercel
```bash
npm i -g vercel
vercel
```

#### GitHub Pages
1. Push vers un repo GitHub
2. Activez GitHub Pages dans les settings du repo
3. Le site sera disponible sur `username.github.io/repo-name`

#### Hébergement traditionnel
1. Uploadez tous les fichiers via FTP
2. Assurez-vous que `index.html` est dans le dossier racine
3. Testez toutes les fonctionnalités après déploiement

---

## 🔒 Sécurité en Production

### ⚠️ Points Critiques

1. **Clés API Mollie**
   - ❌ Ne jamais exposer dans le JavaScript client
   - ✅ Créer un backend API pour gérer les paiements
   - ✅ Utiliser HTTPS pour toutes les communications

2. **Google Maps API**
   - ✅ Configurer les restrictions de domaine
   - ✅ Limiter aux domaines autorisés uniquement

3. **EmailJS**
   - ✅ La clé publique est sécurisée (publique par design)
   - ✅ Configurez des limites de taux si nécessaire

---

## 🧪 Tests

### Tester le Panier
1. Ajoutez des articles depuis le menu
2. Vérifiez que le compteur se met à jour
3. Allez au panier et vérifiez les quantités
4. Testez l'augmentation/diminution
5. Testez la suppression

### Tester le Paiement (Mode Démo)
1. Ajoutez des articles au panier
2. Remplissez le formulaire de livraison
3. Cliquez sur "Payer avec Bancontact"
4. Confirmez dans la popup
5. Vérifiez la redirection vers la page de succès

### Tester le Formulaire de Contact
1. Remplissez le formulaire
2. Soumettez
3. Vérifiez la réception de l'email (dans votre boîte mail)

### Tester Google Maps
1. Allez sur la page contact
2. Vérifiez que la carte s'affiche
3. Testez le clic sur le marqueur

---

## 📞 Support et Maintenance

### Logs de Debug

Pour déboguer les problèmes :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez les appels API dans l'onglet Network

### Problèmes Courants

**Le panier ne se met pas à jour**
- Vérifiez que `js/cart.js` est chargé
- Vérifiez la console pour les erreurs
- Videz le localStorage : `localStorage.clear()`

**Les images ne s'affichent pas**
- Vérifiez les URLs des images
- Vérifiez la connexion internet (images Unsplash)
- Téléchargez les images localement si nécessaire

**Le paiement ne fonctionne pas**
- Vérifiez que la clé API Mollie est correcte
- Vérifiez que le mode démo est désactivé si vous utilisez l'API réelle
- Vérifiez les URLs de redirection

**Le formulaire de contact ne fonctionne pas**
- Vérifiez les clés EmailJS
- Vérifiez que le service email est actif
- Vérifiez les variables du template

---

## 📝 Checklist de Configuration

- [ ] EmailJS configuré (Public Key, Service ID, Template ID)
- [ ] Google Maps configuré (Clé API, Coordonnées)
- [ ] Bancontact/Mollie configuré (Clé API, URLs)
- [ ] Informations de contact mises à jour
- [ ] Horaires d'ouverture mis à jour
- [ ] Images téléchargées localement (optionnel)
- [ ] Traductions vérifiées (FR/NL/EN)
- [ ] Tous les tests passés
- [ ] Site déployé et fonctionnel

---

## 🎯 Prochaines Étapes (Optionnel)

### Améliorations Possibles

1. **Backend API pour les paiements**
   - Créer une API Node.js/PHP/Python
   - Gérer les commandes en base de données
   - Webhooks Mollie pour les notifications

2. **Système de gestion des commandes**
   - Dashboard admin pour voir les commandes
   - Statuts de commande (en cours, préparé, livré)
   - Notifications par email

3. **Optimisation SEO**
   - Métadonnées optimisées
   - Sitemap XML
   - Schema.org markup

4. **Analytics**
   - Google Analytics
   - Suivi des conversions
   - Statistiques de commandes

---

**Delicorner** - Sandwicherie artisanale certifiée Halal 🥪✨

*Créé avec passion pour une expérience utilisateur exceptionnelle*

---

## 📚 Ressources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Mollie API Documentation](https://docs.mollie.com/)
- [Bancontact Documentation](https://www.mollie.com/en/payments/bancontact)
