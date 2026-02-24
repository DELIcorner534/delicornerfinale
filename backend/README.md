# Backend WhatsApp pour Delicorner

Ce backend permet d'envoyer automatiquement les commandes sur WhatsApp via Twilio.

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Twilio

1. **Créer un compte Twilio**
   - Allez sur [https://www.twilio.com/](https://www.twilio.com/)
   - Créez un compte gratuit (compte d'essai disponible)
   - Vérifiez votre numéro de téléphone

2. **Activer WhatsApp Sandbox (pour les tests)**
   - Dans le dashboard Twilio, allez dans "Messaging" > "Try it out" > "Send a WhatsApp message"
   - Suivez les instructions pour activer le Sandbox
   - Vous recevrez un numéro WhatsApp de test (format: `whatsapp:+14155238886`)
   - Ajoutez votre numéro WhatsApp personnel au Sandbox pour recevoir les messages

3. **Obtenir vos credentials**
   - Dans le dashboard Twilio, allez dans "Account" > "General"
   - Copiez votre **Account SID** et **Auth Token**

4. **Configurer les variables d'environnement**
   - Copiez `.env.example` vers `.env`
   - Remplissez les valeurs :
     ```env
     TWILIO_ACCOUNT_SID=votre_account_sid
     TWILIO_AUTH_TOKEN=votre_auth_token
     TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
     PORT=3000
     ```

### 3. Démarrer le serveur

```bash
# Mode production
npm start

# Mode développement (avec rechargement automatique)
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## 📡 Endpoints

### POST `/send-whatsapp`
Envoie un message WhatsApp

**Body:**
```json
{
  "to": "32488153993",
  "message": "Votre message ici",
  "orderNumber": "0001",
  "orderData": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "SM1234567890",
  "orderNumber": "0001",
  "status": "queued"
}
```

### GET `/health`
Vérifie que le serveur fonctionne

### GET `/config`
Affiche la configuration (sans exposer les secrets)

## 🌐 Déploiement

### Option 1 : Heroku (Gratuit)

1. Installez Heroku CLI
2. Créez une app :
   ```bash
   heroku create delicorner-whatsapp
   ```
3. Configurez les variables d'environnement :
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=votre_sid
   heroku config:set TWILIO_AUTH_TOKEN=votre_token
   heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. Déployez :
   ```bash
   git push heroku main
   ```

### Option 2 : Vercel

1. Installez Vercel CLI
2. Déployez :
   ```bash
   vercel
   ```
3. Configurez les variables d'environnement dans le dashboard Vercel

### Option 3 : Railway / Render

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

## 🔒 Sécurité

- ⚠️ **Ne commitez jamais le fichier `.env`**
- ✅ Utilisez des variables d'environnement pour les secrets
- ✅ Limitez l'accès à l'endpoint avec une clé API si nécessaire
- ✅ Utilisez HTTPS en production

## 📝 Notes

- Le compte Twilio gratuit (Sandbox) permet d'envoyer des messages uniquement aux numéros vérifiés
- Pour la production, vous devrez demander l'approbation de votre numéro WhatsApp Business
- Les messages WhatsApp via Twilio sont facturés (voir les tarifs Twilio)
