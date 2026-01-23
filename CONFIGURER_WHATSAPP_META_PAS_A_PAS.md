# 📱 Configuration WhatsApp Business API (Meta) - Guide Pas à Pas

## 🎯 Où Aller dans Meta Developer

Vous êtes actuellement sur le **Dashboard** de votre application "Delicorner". Voici exactement où aller :

---

## 📍 Étape 1 : Ajouter le Produit WhatsApp Business Platform

### Option A : Depuis le Dashboard

1. **Sur votre Dashboard** (où vous êtes actuellement)
2. **Cherchez** un bouton **"Add Product"** ou **"Ajouter un produit"** (généralement en haut à droite ou au centre)
3. **Cliquez dessus**
4. **Sélectionnez** **"WhatsApp"** ou **"WhatsApp Business Platform"**
5. **Cliquez sur** "Set Up" ou "Configurer"

### Option B : Depuis le Menu de Navigation

1. **Dans la barre latérale gauche**, cherchez une section **"Products"** ou **"Produits"**
2. **Si vous ne la voyez pas**, cliquez sur **"App settings"** (⚙️) pour l'étendre
3. **Cherchez** **"WhatsApp"** dans la liste
4. **Si WhatsApp n'est pas là**, vous devez d'abord l'ajouter via le Dashboard

---

## 📍 Étape 2 : Accéder à la Configuration WhatsApp

Une fois WhatsApp Business Platform ajouté :

1. **Dans la barre latérale gauche**, vous verrez maintenant une section **"WhatsApp"** (ou sous "Products" > "WhatsApp")
2. **Cliquez sur** **"WhatsApp"**
3. **Vous verrez** plusieurs sous-sections :
   - **Getting Started** (Commencer)
   - **API Setup** (Configuration API)
   - **Message Templates** (Templates de messages)
   - **Phone Numbers** (Numéros de téléphone)

---

## 📍 Étape 3 : Obtenir les Informations Nécessaires

### A. Phone Number ID

1. **Allez dans** **WhatsApp** > **"Getting Started"** ou **"API Setup"**
2. **Cherchez** la section **"From"** ou **"Phone number"**
3. **Vous verrez** un **"Phone number ID"** (ex: `123456789012345`)
4. **Copiez** cette valeur → c'est votre `META_PHONE_NUMBER_ID`

### B. Access Token (Temporaire pour Test)

1. **Dans la même page** (Getting Started ou API Setup)
2. **Cherchez** **"Temporary access token"** ou **"Token d'accès temporaire"**
3. **Cliquez sur** **"Copy"** ou **"Copier"**
4. **⚠️ Important** : Ce token est valide **24 heures seulement**
5. **Copiez** cette valeur → c'est votre `META_ACCESS_TOKEN` (temporaire)

### C. Access Token Permanent (Pour Production)

Pour créer un token permanent :

1. **Allez dans** **"App settings"** (⚙️) > **"Basic"**
2. **Cherchez** **"System Users"** ou **"Utilisateurs système"**
3. **Cliquez sur** **"Add"** ou **"Ajouter"**
4. **Créez** un utilisateur système avec les permissions :
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. **Générez** un token pour cet utilisateur
6. **Copiez** ce token → c'est votre `META_ACCESS_TOKEN` (permanent)

---

## 📍 Étape 4 : Configurer le Numéro WhatsApp

### Si vous avez déjà un numéro WhatsApp Business :

1. **Allez dans** **WhatsApp** > **"Phone Numbers"**
2. **Cliquez sur** **"Add phone number"** ou **"Ajouter un numéro"**
3. **Suivez** les instructions pour vérifier votre numéro

### Si vous n'avez pas de numéro (Test) :

1. **Meta fournit** un numéro de test automatiquement
2. **Ce numéro** est visible dans **WhatsApp** > **"Getting Started"**
3. **Vous pouvez** envoyer des messages uniquement aux numéros que vous avez ajoutés manuellement

---

## 📍 Étape 5 : Ajouter un Numéro de Test

Pour tester, vous devez ajouter votre numéro de destination :

1. **Allez dans** **WhatsApp** > **"Getting Started"**
2. **Cherchez** la section **"Send test message"** ou **"Envoyer un message test"**
3. **Ajoutez** votre numéro de téléphone (ex: `+32451032356`)
4. **Envoyez** un message test pour vérifier

---

## 📝 Configuration du Backend

Une fois que vous avez récupéré les informations :

1. **Créez ou modifiez** le fichier `backend/.env` :

```env
# Meta WhatsApp Business API
META_PHONE_NUMBER_ID=votre_phone_number_id_ici
META_ACCESS_TOKEN=votre_access_token_ici
META_API_VERSION=v18.0

# Port du serveur
PORT=3000
```

2. **Remplacez** :
   - `votre_phone_number_id_ici` par votre Phone Number ID
   - `votre_access_token_ici` par votre Access Token

---

## 🚀 Démarrer le Serveur Meta

```bash
cd backend
npm run start:meta
```

Ou en mode développement :
```bash
npm run dev:meta
```

---

## 📋 Checklist de Configuration

- [ ] WhatsApp Business Platform ajouté à l'application
- [ ] Phone Number ID récupéré
- [ ] Access Token récupéré (temporaire ou permanent)
- [ ] Numéro de test ajouté (si nécessaire)
- [ ] Fichier `.env` configuré avec les credentials
- [ ] Serveur backend démarré (`npm run start:meta`)
- [ ] Test d'envoi de message réussi

---

## 🆘 Si Vous Ne Trouvez Pas WhatsApp

Si vous ne voyez pas la section "WhatsApp" :

1. **Retournez** au **Dashboard** principal
2. **Cherchez** un bouton **"Add Product"** ou **"Ajouter un produit"**
3. **Sélectionnez** **"WhatsApp"** ou **"WhatsApp Business Platform"**
4. **Suivez** les instructions pour l'ajouter

---

## 📚 Navigation Rapide

**Chemin complet dans Meta Developer :**

```
Dashboard → Add Product → WhatsApp Business Platform
OU
Sidebar → Products → WhatsApp
OU
Sidebar → App settings → WhatsApp (si déjà ajouté)
```

**Pour obtenir les credentials :**

```
WhatsApp → Getting Started → Phone Number ID + Access Token
OU
WhatsApp → API Setup → Phone Number ID + Access Token
```

---

## ✅ Prochaines Étapes

Une fois configuré :

1. ✅ Testez l'envoi d'un message
2. ✅ Créez un template WhatsApp (optionnel, pour production)
3. ✅ Configurez le frontend pour utiliser Meta au lieu de Twilio

---

**Note** : Le token temporaire expire après 24h. Pour la production, créez un token permanent via System Users.
