# 📋 Copier les Credentials Meta - Guide Visuel

## ✅ Parfait ! Vous avez toutes les informations !

Sur la page **"Envoyer des messages de test"** (Tests d'API), vous voyez exactement ce dont vous avez besoin.

---

## 🔑 ÉTAPE 1 : Copier l'Access Token

**Section 1 : "Générer un jeton d'accès temporaire"**

1. **Vous voyez** un long token : `EAAWHAidJ6c0BQv10gBIfCSZAO7ZALRU0E0xLjLCmtZBqDJeJ`
2. **Cliquez sur** le bouton **"Copie"** à côté du token
3. **⚠️ Important** : Ce token est valide **60 minutes seulement** (pas 24h comme mentionné ailleurs)
4. **Copiez** cette valeur → c'est votre **`META_ACCESS_TOKEN`**

**💡 Note** : Si le token expire, cliquez sur **"Générer un jeton d'accès"** pour en créer un nouveau.

---

## 📱 ÉTAPE 2 : Copier le Phone Number ID

**Section 2 : "Sélectionnez un numéro de téléphone « De »"**

1. **Vous voyez** : **"Numéro de téléphone :"** suivi de `946074821930483`
2. **Cliquez sur** l'icône **"Copie"** (icône de copie) à côté de ce numéro
3. **Copiez** cette valeur → c'est votre **`META_PHONE_NUMBER_ID`**

**💡 Note** : Vous voyez aussi "Identifiant du compte WhatsApp Business :" `1295730639052827` - vous n'en avez pas besoin pour l'instant.

---

## ✅ ÉTAPE 3 : Vérifier le Numéro de Test

**Section 3 : "Ajouter un numéro de téléphone du destinataire"**

1. **Vous voyez** que le numéro `+32 451 03 23 56` est déjà ajouté ✅
2. **C'est parfait !** Vous pouvez déjà recevoir des messages sur ce numéro

---

## 📝 ÉTAPE 4 : Configurer le Fichier .env

Maintenant, configurez votre fichier `backend/.env` :

1. **Ouvrez** le fichier `backend/.env` (ou créez-le s'il n'existe pas)

2. **Ajoutez ou modifiez** ces lignes :

```env
# Meta WhatsApp Business API
META_PHONE_NUMBER_ID=946074821930483
META_ACCESS_TOKEN=EAAWHAidJ6c0BQv10gBIfCSZAO7ZALRU0E0xLjLCmtZBqDJeJ
META_API_VERSION=v18.0

# Port du serveur
PORT=3000
```

3. **Remplacez** :
   - `946074821930483` par votre Phone Number ID (si différent)
   - `EAAWHAidJ6c0BQv10gBIfCSZAO7ZALRU0E0xLjLCmtZBqDJeJ` par votre Access Token (si différent)

**⚠️ Important** : Si vous générez un nouveau token, mettez à jour `META_ACCESS_TOKEN` dans `.env`.

---

## 🚀 ÉTAPE 5 : Démarrer le Serveur

1. **Ouvrez un terminal** dans le dossier `backend`

2. **Démarrez le serveur** :

```bash
npm run start:meta
```

Ou en mode développement :

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

## ✅ Résumé des Valeurs à Copier

| Information | Où le trouver | Valeur à copier |
|-------------|---------------|-----------------|
| **Access Token** | Section 1, bouton "Copie" | `EAAWHAidJ6c0BQv10gBIfCSZAO7ZALRU0E0xLjLCmtZBqDJeJ` |
| **Phone Number ID** | Section 2, icône copie à côté de "Numéro de téléphone" | `946074821930483` |
| **Numéro de test** | Section 3 | `+32 451 03 23 56` (déjà ajouté ✅) |

---

## ⚠️ Notes Importantes

1. **Token temporaire** : Valide **60 minutes seulement**
   - Si le token expire, retournez sur cette page
   - Cliquez sur **"Générer un jeton d'accès"**
   - Copiez le nouveau token
   - Mettez à jour `META_ACCESS_TOKEN` dans `.env`
   - Redémarrez le serveur

2. **Numéro de test** : Maximum **5 numéros** en mode test
   - Votre numéro `+32 451 03 23 56` est déjà ajouté ✅

3. **Période de test** : **90 jours** de messages gratuits

---

## 🎯 Prochaines Étapes

1. ✅ Copier l'Access Token
2. ✅ Copier le Phone Number ID
3. ✅ Configurer `backend/.env`
4. ✅ Démarrer le serveur (`npm run start:meta`)
5. ✅ Tester une commande sur le site

---

**Vous avez maintenant toutes les informations ! Configurez le `.env` et démarrez le serveur !** 🚀
