# 📱 Configuration WhatsApp Business API (Meta) - Delicorner

## 🎯 Vue d'Ensemble

Ce guide vous explique comment configurer WhatsApp Business API via Meta (Facebook) pour envoyer automatiquement les commandes.

**Avantages de Meta WhatsApp Business API :**
- ✅ **GRATUIT** (jusqu'à 1000 conversations/mois)
- ✅ Pas besoin de compte payant
- ✅ Intégration directe avec Facebook Business
- ✅ Templates WhatsApp approuvés

---

## 📋 Prérequis

1. **Compte Facebook Business**
2. **Numéro de téléphone WhatsApp Business** (ou numéro de test)
3. **Accès à Meta Business Suite** ou **Meta Developer Console**

---

## 🚀 Étapes de Configuration

### Étape 1 : Créer une Application Meta

1. **Allez sur** [Meta for Developers](https://developers.facebook.com/)
2. **Connectez-vous** avec votre compte Facebook
3. **Cliquez sur** "Mes applications" > "Créer une application"
4. **Sélectionnez** le type : **"Business"**
5. **Remplissez** les informations :
   - Nom de l'application : `Delicorner WhatsApp`
   - Email de contact : votre email
   - Objectif : **"WhatsApp"**

### Étape 2 : Configurer WhatsApp Business API

1. **Dans votre application**, allez dans **"WhatsApp"** dans le menu de gauche
2. **Cliquez sur** "Commencer" ou "Get Started"
3. **Ajoutez un numéro de téléphone** :
   - Si vous avez déjà un numéro WhatsApp Business, ajoutez-le
   - Sinon, utilisez un numéro de test (Meta fournit un numéro de test)

### Étape 3 : Obtenir les Credentials

1. **Dans WhatsApp** > **"API Setup"**, vous verrez :
   - **Phone number ID** : Copiez cette valeur
   - **Temporary access token** : Copiez cette valeur (valide 24h)
   - **Permanent access token** : Pour la production, créez un token permanent

2. **Pour créer un token permanent** :
   - Allez dans **"System Users"** > **"Add"**
   - Créez un utilisateur système avec les permissions WhatsApp
   - Générez un token pour cet utilisateur

### Étape 4 : Configurer le Backend

1. **Créez le fichier `.env`** dans le dossier `backend/` :
   ```env
   META_PHONE_NUMBER_ID=votre_phone_number_id
   META_ACCESS_TOKEN=votre_access_token
   META_API_VERSION=v18.0
   PORT=3000
   ```

2. **Remplacez** les valeurs par vos credentials Meta

### Étape 5 : Démarrer le Serveur Meta

```bash
cd backend
npm install
npm run start:meta
```

Ou en mode développement :
```bash
npm run dev:meta
```

---

## 📝 Créer un Template WhatsApp (Optionnel)

Pour envoyer des messages en dehors de la fenêtre de 24h, vous devez créer un template approuvé :

1. **Dans Meta Business Suite** > **"WhatsApp"** > **"Message Templates"**
2. **Cliquez sur** "Create Template"
3. **Remplissez** :
   - **Name** : `delicorner_nouvelle_commande`
   - **Category** : `UTILITY` (pour notifications de commande)
   - **Language** : `Dutch` (ou votre langue)
   - **Content** : Votre message avec variables `{{1}}`, `{{2}}`, etc.

4. **Soumettez** le template pour approbation
5. **Attendez** l'approbation (1-3 jours)

---

## 🔧 Variables d'Environnement

Créez un fichier `backend/.env` avec :

```env
# Meta WhatsApp Business API
META_PHONE_NUMBER_ID=123456789012345
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_API_VERSION=v18.0

# Port du serveur
PORT=3000
```

---

## 🧪 Tester l'Intégration

1. **Démarrez le serveur** :
   ```bash
   npm run start:meta
   ```

2. **Testez avec curl** :
   ```bash
   curl -X POST http://localhost:3000/send-whatsapp \
     -H "Content-Type: application/json" \
     -d '{
       "to": "32451032356",
       "message": "Test message"
     }'
   ```

3. **Vérifiez** que le message est reçu sur WhatsApp

---

## 📊 Comparaison : Meta vs Twilio

| Fonctionnalité | Meta WhatsApp | Twilio |
|----------------|---------------|--------|
| Coût | Gratuit (1000 conv/mois) | Pay-as-you-go |
| Templates | ✅ Oui | ✅ Oui |
| Sandbox | ✅ Oui (numéro test) | ✅ Oui |
| Configuration | Plus complexe | Plus simple |
| Support | Documentation Meta | Support Twilio |

---

## ⚠️ Limitations

1. **Fenêtre de 24h** : Pour les messages libres (hors template)
2. **Templates obligatoires** : Pour envoyer en dehors de 24h
3. **Vérification Meta** : Nécessite vérification du compte Business
4. **Numéro de test** : Limité aux numéros ajoutés manuellement

---

## 🚀 Production

Pour la production :

1. **Vérifiez votre compte Meta Business**
2. **Créez un token permanent** (pas temporaire)
3. **Créez et approuvez vos templates**
4. **Déployez le backend** (Heroku, Vercel, etc.)
5. **Configurez les variables d'environnement** sur votre plateforme

---

## 🆘 Dépannage

### Erreur : "Invalid OAuth access token"
- Vérifiez que votre token n'a pas expiré
- Créez un nouveau token permanent

### Erreur : "Phone number not registered"
- Vérifiez que le numéro est bien ajouté dans Meta Business Suite
- Vérifiez le format du numéro (international avec +)

### Erreur : "Message template not found"
- Vérifiez que le template est approuvé
- Vérifiez le nom exact du template

---

## 📚 Ressources

- [Meta WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Suite](https://business.facebook.com/)
- [Meta for Developers](https://developers.facebook.com/)

---

**Note** : Meta WhatsApp Business API est gratuit jusqu'à 1000 conversations par mois, puis facturé à l'utilisation.
