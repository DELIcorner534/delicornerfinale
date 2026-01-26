# Delicorner - Système Hybride de Gestion des Commandes

## Vue d'ensemble

Ce système hybride permet de gérer les commandes de manière fiable et professionnelle, avec une architecture évolutive vers WhatsApp Business API.

### Fonctionnement

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUX DE COMMANDE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Client remplit le formulaire sur le site                    │
│         ↓                                                       │
│  2. Le frontend envoie les données au backend                   │
│         ↓                                                       │
│  3. Le backend :                                                │
│     • Génère un code unique (ex: DC-2026-0042)                  │
│     • Enregistre la commande en base de données SQLite          │
│     • Retourne le code + lien WhatsApp pré-rempli               │
│         ↓                                                       │
│  4. Le client est redirigé vers la page de succès               │
│     • Code de commande affiché                                  │
│     • Bouton pour ouvrir WhatsApp                               │
│         ↓                                                       │
│  5. Le client clique et envoie le message WhatsApp              │
│     (le message peut être modifié, le code reste la référence)  │
│         ↓                                                       │
│  6. L'entreprise vérifie la commande dans le back-office        │
│     en utilisant le code reçu                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### Prérequis

- Node.js 18+ 
- npm

### Installation des dépendances

```bash
cd backend
npm install
```

### Configuration

1. Copiez le fichier d'exemple :
```bash
cp .env.hybrid.example .env
```

2. Modifiez les variables selon vos besoins :
```env
PORT=3000
WHATSAPP_PHONE=32451032356
ORDER_PREFIX=DC
ADMIN_PASSWORD=votre_mot_de_passe
```

### Démarrage

```bash
# Mode production
npm start

# Mode développement (avec rechargement automatique)
npm run dev
```

## Endpoints API

### Commandes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/orders` | Créer une nouvelle commande |
| `GET` | `/api/orders` | Liste des commandes (avec filtres) |
| `GET` | `/api/orders/:code` | Récupérer une commande par son code |
| `PATCH` | `/api/orders/:code` | Mettre à jour le statut d'une commande |
| `DELETE` | `/api/orders/:code` | Annuler une commande |

### Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/stats` | Statistiques des commandes |

### Utilitaires

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | Vérification de santé du serveur |
| `GET` | `/api/config` | Configuration publique |

### Back-office

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin` | Interface de gestion des commandes |

## Exemples d'utilisation

### Créer une commande

```javascript
const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        customerName: 'Jean Dupont',
        customerPhone: '0488123456',
        customerClass: '3A',
        customerSchool: 'Campus Parklaan',
        deliveryDate: '2026-01-30',
        items: [
            { name: 'Club Sandwich', quantity: 2, price: '5,50' }
        ],
        total: 11.00,
        paymentMethod: 'bancontact',
        notes: 'Sans oignons'
    })
});

const result = await response.json();
// {
//   success: true,
//   order: { orderCode: 'DC-2026-0042', ... },
//   whatsappLink: 'https://wa.me/32451032356?text=...'
// }
```

### Vérifier une commande

```javascript
const response = await fetch('http://localhost:3000/api/orders/DC-2026-0042');
const result = await response.json();
// { success: true, order: { ... } }
```

### Mettre à jour le statut

```javascript
const response = await fetch('http://localhost:3000/api/orders/DC-2026-0042', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' })
});
```

## Statuts de commande

| Statut | Description |
|--------|-------------|
| `pending` | En attente de confirmation |
| `confirmed` | Confirmée par la sandwicherie |
| `preparing` | En cours de préparation |
| `ready` | Prête à être récupérée/livrée |
| `delivered` | Livrée au client |
| `cancelled` | Annulée |

## Structure du code de commande

```
DC-2026-0042
│   │    │
│   │    └── Numéro séquentiel (4 chiffres)
│   └─────── Année
└─────────── Préfixe entreprise
```

## Base de données

Le système utilise SQLite, une base de données légère stockée dans un fichier `orders.db`.

### Tables

**orders**
- `id` - ID auto-incrémenté
- `order_code` - Code unique (ex: DC-2026-0042)
- `customer_name` - Nom du client
- `customer_phone` - Téléphone
- `customer_class` - Classe (optionnel)
- `customer_school` - École (optionnel)
- `delivery_date` - Date de livraison
- `items` - Articles (JSON)
- `total` - Total en euros
- `payment_method` - Méthode de paiement
- `payment_status` - Statut du paiement
- `notes` - Remarques
- `status` - Statut de la commande
- `whatsapp_sent` - WhatsApp envoyé (0/1)
- `created_at` - Date de création
- `updated_at` - Date de mise à jour

**order_counter**
- `id` - Toujours 1
- `year` - Année en cours
- `counter` - Compteur actuel

## Évolution vers WhatsApp Business API

L'architecture est prête pour l'intégration de WhatsApp Business API :

1. **Actuellement (Mode Hybride)** :
   - Commandes enregistrées en base de données
   - Client redirigé vers WhatsApp via lien `wa.me`
   - Vérification manuelle via back-office

2. **Future (Mode API)** :
   - Même base de données
   - Envoi automatique via WhatsApp Business API
   - Notifications push aux clients
   - Templates de messages approuvés par Meta

### Modifications nécessaires

Pour activer WhatsApp Business API :

1. Obtenir les credentials Meta
2. Ajouter les variables d'environnement
3. Modifier `server-hybrid.js` pour appeler l'API Meta au lieu de générer un lien `wa.me`

Le code a été pensé pour que cette transition soit simple et ne nécessite que des modifications mineures.

## Déploiement

### Render.com

1. Créez un nouveau Web Service
2. Connectez votre repository GitHub
3. Configurez :
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Ajoutez vos variables .env

### Variables d'environnement pour la production

```env
PORT=3000
WHATSAPP_PHONE=32451032356
ORDER_PREFIX=DC
ADMIN_PASSWORD=mot_de_passe_tres_securise
```

## Sécurité

- Les mots de passe ne sont pas stockés en clair
- Le back-office peut être protégé par mot de passe
- Les commandes annulées sont conservées (soft delete)
- Validation des données entrantes

## Support

Pour toute question ou problème, contactez l'équipe de développement.
