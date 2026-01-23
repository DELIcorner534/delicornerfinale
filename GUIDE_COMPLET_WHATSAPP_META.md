# 📱 Guide Complet - Configuration WhatsApp Business API (Meta) - Delicorner

## 🎯 Objectif

Configurer WhatsApp Business API via Meta pour envoyer automatiquement les notifications de commande aux clients.

---

## 📋 Prérequis

- ✅ Compte Facebook Business
- ✅ Application Meta créée ("Delicorner")
- ✅ Accès à Meta Developer Console

---

## 🚀 ÉTAPE 1 : Accéder à Meta Developer

1. **Allez sur** [Meta for Developers](https://developers.facebook.com/)
2. **Connectez-vous** avec votre compte Facebook
3. **Cliquez sur** "Mes applications" (My Apps)
4. **Sélectionnez** votre application "Delicorner"

---

## 🚀 ÉTAPE 2 : Ajouter WhatsApp Business Platform

### Si WhatsApp n'est pas encore ajouté :

1. **Sur le Dashboard** de votre application
2. **Cherchez** le bouton **"Add Product"** ou **"Ajouter un produit"**
   - Généralement en haut à droite ou au centre de la page
3. **Cliquez dessus**
4. **Sélectionnez** **"WhatsApp"** ou **"WhatsApp Business Platform"**
5. **Cliquez sur** "Set Up" ou "Configurer"

### Si WhatsApp est déjà ajouté :

1. **Dans la barre latérale gauche**, vous verrez **"WhatsApp"** ou **"Connectez-vous sur WhatsApp..."**
2. **Cliquez dessus** pour accéder à la configuration

---

## 🚀 ÉTAPE 3 : Sélectionner le Cas d'Utilisation

Lors de la configuration initiale, Meta vous demandera de choisir un **cas d'utilisation** :

### Options disponibles (par ordre de préférence) :

1. ⭐ **"Send notifications"** / **"Envoyer des notifications"** → **CHOISISSEZ CELUI-CI**
2. ✅ **"Customer care"** / **"Service client"** → Acceptable
3. ⚠️ **"Enter in contact with your customers"** / **"Entrer en contact avec vos clients"** → Acceptable si les autres ne sont pas disponibles
4. ❌ **"Marketing"** → À éviter

**Action :** Choisissez **"Send notifications"** ou **"Envoyer des notifications"** si disponible.

---

## 🚀 ÉTAPE 4 : Sélectionner le Portefeuille d'Entreprises

1. **Sur la page de configuration**, vous verrez un menu déroulant :
   - **"Sélectionnez un portefeuille d'entreprises"** / **"Select a business portfolio"**
2. **Sélectionnez** votre portefeuille (ex: "Amou")
3. **Cliquez sur** "Continuer" ou "Continue"

**Note :** Si vous n'avez pas de portefeuille, créez-en un via Meta Business Suite.

---

## 🚀 ÉTAPE 5 : Accéder à "Démarrage rapide"

1. **Dans la barre latérale gauche**, sous "WhatsApp", cliquez sur **"Démarrage rapide"** (Getting Started)
2. **Vous verrez** la page de configuration principale

---

## 🚀 ÉTAPE 6 : Récupérer le Phone Number ID

Sur la page "Démarrage rapide" :

1. **Faites défiler** vers le bas
2. **Cherchez** la section **"From"** ou **"De"** (numéro d'envoi)
3. **Vous verrez** un champ avec un numéro long (ex: `123456789012345`)
4. **Copiez** ce numéro → c'est votre **`META_PHONE_NUMBER_ID`**

**💡 Astuce :** Le Phone Number ID est généralement dans une boîte de texte ou un champ de formulaire.

**Si vous ne le voyez pas :**
- Allez dans **"Configuration de l'API"** (API Setup) dans la barre latérale
- Le Phone Number ID devrait être visible là aussi

---

## 🚀 ÉTAPE 7 : Récupérer l'Access Token

Sur la même page "Démarrage rapide" :

1. **Faites défiler** vers le bas
2. **Cherchez** la section **"Temporary access token"** ou **"Token d'accès temporaire"**
3. **Cliquez sur** le bouton **"Copy"** ou **"Copier"** à côté du token
4. **⚠️ Important :** Ce token est valide **24 heures seulement**
5. **Copiez** cette valeur → c'est votre **`META_ACCESS_TOKEN`** (temporaire)

**💡 Astuce :** Le token commence généralement par `EAA...` et est très long.

**Si vous ne le voyez pas :**
- Allez dans **"Configuration de l'API"** (API Setup)
- Le token devrait être visible là aussi

---

## 🚀 ÉTAPE 8 : Ajouter un Numéro de Test (Important !)

Pour pouvoir envoyer des messages, vous devez ajouter le numéro de destination :

1. **Sur la page "Démarrage rapide"**, cherchez la section **"Send test message"** ou **"Envoyer un message test"**
2. **Ajoutez** votre numéro de téléphone de destination (ex: `+32451032356`)
   - Format : `+32` suivi du numéro sans le 0 initial
   - Exemple : `+32451032356` (pour 0451 03 23 56)
3. **Cliquez sur** "Send test message" ou "Envoyer"
4. **Vérifiez** que vous recevez le message test sur WhatsApp

**⚠️ Important :** Vous ne pouvez envoyer des messages qu'aux numéros que vous avez ajoutés manuellement (maximum 5 numéros en mode test).

---

## 🚀 ÉTAPE 9 : Configurer le Fichier .env

1. **Ouvrez** le fichier `backend/.env` (ou créez-le s'il n'existe pas)

2. **Ajoutez ou modifiez** les lignes suivantes :

```env
# Meta WhatsApp Business API
META_PHONE_NUMBER_ID=votre_phone_number_id_ici
META_ACCESS_TOKEN=votre_access_token_ici
META_API_VERSION=v18.0

# Port du serveur
PORT=3000
```

3. **Remplacez** :
   - `votre_phone_number_id_ici` par le Phone Number ID que vous avez copié à l'étape 6
   - `votre_access_token_ici` par l'Access Token que vous avez copié à l'étape 7

**Exemple :**

```env
META_PHONE_NUMBER_ID=123456789012345
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_API_VERSION=v18.0
PORT=3000
```

---

## 🚀 ÉTAPE 10 : Vérifier les Dépendances

Assurez-vous que toutes les dépendances sont installées :

```bash
cd backend
npm install
```

**Dépendances nécessaires :**
- `express`
- `axios`
- `dotenv`
- `cors`

---

## 🚀 ÉTAPE 11 : Démarrer le Serveur Meta

1. **Ouvrez un terminal** dans le dossier `backend`

2. **Démarrez le serveur** :

```bash
npm run start:meta
```

Ou en mode développement (avec rechargement automatique) :

```bash
npm run dev:meta
```

3. **Vous devriez voir** :

```
🚀 Serveur WhatsApp (Meta) démarré sur le port 3000
📱 Endpoint: http://localhost:3000/send-whatsapp
💚 Health check: http://localhost:3000/health
```

---

## 🚀 ÉTAPE 12 : Tester l'Envoi d'un Message

### Option A : Test via le Site Web

1. **Ouvrez** votre site web dans le navigateur
2. **Ajoutez** des articles au panier
3. **Passez** une commande
4. **Vérifiez** que le message WhatsApp est envoyé automatiquement

### Option B : Test via curl (Terminal)

```bash
curl -X POST http://localhost:3000/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "32451032356",
    "message": "Test message depuis Meta WhatsApp API"
  }'
```

**Remplacez** `32451032356` par votre numéro de test (sans le +).

---

## 🚀 ÉTAPE 13 : Vérifier les Logs

1. **Dans le terminal** où le serveur tourne, vous devriez voir les logs :
   - ✅ Messages envoyés avec succès
   - ❌ Erreurs éventuelles

2. **Vérifiez** que vous recevez le message sur WhatsApp

---

## ✅ Checklist Complète

- [ ] Application Meta créée ("Delicorner")
- [ ] WhatsApp Business Platform ajouté à l'application
- [ ] Cas d'utilisation sélectionné ("Send notifications" de préférence)
- [ ] Portefeuille d'entreprises sélectionné
- [ ] Phone Number ID récupéré et copié
- [ ] Access Token récupéré et copié
- [ ] Numéro de test ajouté (ex: +32451032356)
- [ ] Fichier `.env` configuré avec les credentials
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur backend démarré (`npm run start:meta`)
- [ ] Test d'envoi de message réussi
- [ ] Message reçu sur WhatsApp

---

## 🆘 Dépannage

### Erreur : "Invalid OAuth access token"

**Solution :**
- Le token temporaire a expiré (valide 24h)
- Allez dans "Démarrage rapide" ou "Configuration de l'API"
- Copiez un nouveau token temporaire
- Mettez à jour `META_ACCESS_TOKEN` dans `.env`
- Redémarrez le serveur

### Erreur : "Phone number not registered"

**Solution :**
- Vérifiez que le numéro de destination est bien ajouté dans "Démarrage rapide"
- Le numéro doit être au format international avec + (ex: `+32451032356`)
- Vous ne pouvez envoyer qu'aux numéros que vous avez ajoutés manuellement

### Erreur : "Message template not found"

**Solution :**
- Pour l'instant, vous utilisez des messages libres (pas de template)
- Assurez-vous que le numéro de destination a initié une conversation dans les 24 dernières heures
- Ou créez un template approuvé (voir étape suivante)

### Le serveur ne démarre pas

**Solution :**
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Vérifiez que toutes les dépendances sont installées (`npm install`)
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs

---

## 🚀 ÉTAPE 14 : Créer un Token Permanent (Pour Production)

Le token temporaire expire après 24h. Pour la production, créez un token permanent :

1. **Allez dans** **"App settings"** (⚙️) dans la barre latérale
2. **Cliquez sur** **"Basic"**
3. **Cherchez** **"System Users"** ou **"Utilisateurs système"**
4. **Cliquez sur** **"Add"** ou **"Ajouter"**
5. **Créez** un utilisateur système avec les permissions :
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. **Générez** un token pour cet utilisateur
7. **Copiez** ce token
8. **Remplacez** `META_ACCESS_TOKEN` dans `.env` par ce token permanent

---

## 🚀 ÉTAPE 15 : Créer un Template WhatsApp (Optionnel, pour Production)

Pour envoyer des messages en dehors de la fenêtre de 24h :

1. **Allez dans** **WhatsApp** > **"Message Templates"** dans la barre latérale
2. **Cliquez sur** **"Create Template"** ou **"Créer un template"**
3. **Remplissez** :
   - **Name** : `delicorner_nouvelle_commande`
   - **Category** : `UTILITY` (pour notifications)
   - **Language** : `Dutch` (ou votre langue)
   - **Content** : Votre message avec variables `{{1}}`, `{{2}}`, etc.
4. **Soumettez** le template pour approbation
5. **Attendez** l'approbation (1-3 jours)

---

## 📚 Navigation Rapide dans Meta Developer

```
Dashboard → Add Product → WhatsApp Business Platform
↓
Sidebar → WhatsApp → Démarrage rapide
↓
Récupérer : Phone Number ID + Access Token
↓
Ajouter numéro de test
↓
Configurer backend/.env
↓
Démarrer serveur (npm run start:meta)
```

---

## ✅ Résumé

1. ✅ Ajouter WhatsApp Business Platform
2. ✅ Sélectionner cas d'utilisation ("Send notifications")
3. ✅ Récupérer Phone Number ID
4. ✅ Récupérer Access Token
5. ✅ Ajouter numéro de test
6. ✅ Configurer `.env`
7. ✅ Démarrer serveur
8. ✅ Tester l'envoi

---

**Vous êtes maintenant prêt à envoyer des notifications WhatsApp automatiquement !** 🎉
