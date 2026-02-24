# Delicorner - Système Hybride de Gestion des Commandes

## Vue d'ensemble

Ce système hybride permet de gérer les commandes de manière fiable et professionnelle, avec une architecture évolutive vers WhatsApp Business API.

### Fonctionnement

```
┌─────────────────────────────────────────────────────────────────┐
│                FLUX DE COMMANDE (avec Bancontact)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Client remplit le formulaire sur le site                    │
│         ↓                                                       │
│  2. Client choisit Bancontact comme méthode de paiement         │
│         ↓                                                       │
│  3. Le backend :                                                │
│     • Génère un code unique (ex: DC-2026-0042)                  │
│     • Enregistre la commande en base PostgreSQL (Supabase)       │
│     • Crée un paiement Mollie                                   │
│     • Redirige vers la page de paiement Bancontact              │
│         ↓                                                       │
│  4. Le client paie via Bancontact (app bancaire)                │
│         ↓                                                       │
│  5. Retour sur la page de succès                                │
│     • Code de commande affiché                                  │
│     • Commande marquée comme payée en base de données           │
│     • Bouton pour ouvrir WhatsApp (optionnel)                   │
│         ↓                                                       │
│  6. L'entreprise vérifie la commande dans le back-office        │
│     • Commandes payées visibles immédiatement                   │
│     • Statut de paiement mis à jour automatiquement             │
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
# Configuration de base
PORT=3000
WHATSAPP_PHONE=32451032356
ORDER_PREFIX=DC
ADMIN_PASSWORD=votre_mot_de_passe

# Base de données PostgreSQL (Supabase) - OBLIGATOIRE
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres

# Configuration Mollie (Bancontact) - OBLIGATOIRE pour les paiements
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOLLIE_REDIRECT_SUCCESS_URL=https://delicornerhalle.be/payment-return.html
MOLLIE_REDIRECT_FAILURE_URL=https://delicornerhalle.be/payment-failure.html
MOLLIE_WEBHOOK_URL=https://delicorner-whatsapp.onrender.com/api/mollie-webhook
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

### Paiements Mollie (Bancontact)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/create-payment` | Créer un paiement Mollie et obtenir l'URL de checkout |
| `GET` | `/api/payment-status?id=xxx` | Vérifier le statut d'un paiement |
| `GET` | `/api/payment-by-token?t=xxx` | Récupérer le payment_id à partir du token |
| `POST` | `/api/confirm-and-send-whatsapp` | Confirmer paiement et générer lien WhatsApp |
| `POST` | `/api/mollie-webhook` | Webhook pour notifications Mollie |

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

Le système utilise **PostgreSQL** (Supabase) pour une persistance fiable et gratuite.

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

#### Base de données : Supabase (gratuit)

Pour conserver les commandes sur le plan gratuit Render, utilisez **Supabase** (PostgreSQL gratuit) :

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau **projet**
3. Allez dans **Project Settings** → **Database** → copiez la **Connection string** (mode URI)
4. Dans **SQL Editor**, exécutez le contenu de `backend/scripts/init-supabase.sql` pour créer les tables
5. Sur Render, ajoutez la variable **`DATABASE_URL`** avec cette connection string

Exemple de connection string :
```
postgresql://postgres.[PROJECT_REF]:[MOT_DE_PASSE]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

> Supabase offre 500 Mo gratuits, données persistantes. Les commandes resteront même après redémarrage du serveur Render.

#### Rétention des commandes (2-3 mois)

Par défaut, les commandes de plus de **3 mois** sont supprimées au démarrage. Pour modifier :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `ORDER_RETENTION_MONTHS` | `2` ou `3` (défaut) | Nombre de mois de conservation |

### Variables d'environnement pour la production

```env
# Configuration de base
PORT=3000
WHATSAPP_PHONE=32451032356
ORDER_PREFIX=DC
ADMIN_PASSWORD=mot_de_passe_tres_securise

# Base de données (Supabase) - OBLIGATOIRE
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# Rétention (optionnel, défaut 3 mois)
ORDER_RETENTION_MONTHS=3

# Configuration Mollie (Bancontact)
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOLLIE_REDIRECT_SUCCESS_URL=https://delicornerhalle.be/payment-return.html
MOLLIE_REDIRECT_FAILURE_URL=https://delicornerhalle.be/payment-failure.html
MOLLIE_WEBHOOK_URL=https://delicorner-whatsapp.onrender.com/api/mollie-webhook
```

### Variables sur Render.com

Sur le dashboard Render, dans **Environment**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `WHATSAPP_PHONE` | `32451032356` |
| `ORDER_PREFIX` | `DC` |
| `ADMIN_PASSWORD` | Votre mot de passe admin |
| `DATABASE_URL` | Connection string Supabase (obligatoire) |
| `ORDER_RETENTION_MONTHS` | `3` (optionnel) |
| `MOLLIE_API_KEY` | Votre clé API Mollie (live_xxx ou test_xxx) |
| `MOLLIE_REDIRECT_SUCCESS_URL` | `https://delicornerhalle.be/payment-return.html` |
| `MOLLIE_REDIRECT_FAILURE_URL` | `https://delicornerhalle.be/payment-failure.html` |
| `MOLLIE_WEBHOOK_URL` | `https://delicorner-whatsapp.onrender.com/api/mollie-webhook` |

## Sécurité

- Les mots de passe ne sont pas stockés en clair
- Le back-office peut être protégé par mot de passe
- Les commandes annulées sont conservées (soft delete)
- Validation des données entrantes

## Support

Pour toute question ou problème, contactez l'équipe de développement.
