# ⚡ Configuration Twilio - Guide Rapide

## 🎯 Objectif
Configurer Twilio pour envoyer automatiquement les commandes par WhatsApp.

**Temps estimé : 20-30 minutes**

---

## 📋 Étape 1 : Créer un compte Twilio (5 min)

1. **Allez sur** [https://www.twilio.com/](https://www.twilio.com/)
2. **Cliquez sur** "Sign Up" (en haut à droite)
3. **Remplissez** :
   - Email
   - Mot de passe
   - Nom
4. **Vérifiez** votre email et téléphone
5. **✅ Compte créé !** Vous avez $15 de crédit gratuit

---

## 📱 Étape 2 : Activer WhatsApp Sandbox (10 min)

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** (menu gauche)
2. **Cliquez sur** "Try it out" > "Send a WhatsApp message"
3. **Notez** :
   - Le **numéro WhatsApp Sandbox** (ex: `whatsapp:+14155238886`)
   - Le **code d'activation** (ex: `join <code>`)
4. **Sur votre téléphone**, ouvrez WhatsApp
5. **Envoyez un message** au numéro Sandbox
6. **Envoyez le code** : `join <code>`
7. **Vous recevrez** : "Your WhatsApp number is verified!" ✅

---

## 🔑 Étape 3 : Obtenir vos identifiants (3 min)

### 3.1 Account SID et Auth Token

1. **Dans le Dashboard**, cliquez sur **"Account"** (en haut à droite)
2. **Cliquez sur** "General"
3. **Copiez** :
   - **Account SID** (commence par `AC...`)
   - **Auth Token** (cliquez sur "View" pour le voir)

### 3.2 WhatsApp Sandbox Number

1. **Retournez dans** "Messaging" > "Try it out"
2. **Copiez** le numéro WhatsApp Sandbox (ex: `whatsapp:+14155238886`)

**Vous avez maintenant** :
- ✅ Account SID
- ✅ Auth Token
- ✅ WhatsApp Sandbox Number

---

## 💻 Étape 4 : Configurer le Backend (10 min)

### 4.1 Créer le fichier .env

1. **Ouvrez** le dossier `backend` dans votre projet
2. **Créez un nouveau fichier** nommé `.env` (sans extension)
3. **Copiez-collez** ce contenu :

```env
TWILIO_ACCOUNT_SID=votre_account_sid_ici
TWILIO_AUTH_TOKEN=votre_auth_token_ici
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
PORT=3000
```

### 4.2 Remplir les valeurs

**Remplacez** :
- `votre_account_sid_ici` → Votre Account SID (Étape 3.1)
- `votre_auth_token_ici` → Votre Auth Token (Étape 3.1)
- `whatsapp:+14155238886` → Votre numéro WhatsApp Sandbox (Étape 3.2)

**Exemple** :
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
PORT=3000
```

3. **Sauvegardez** le fichier (Ctrl+S)

### 4.3 Installer les dépendances

1. **Ouvrez un terminal** (PowerShell, CMD)
2. **Naviguez vers le dossier backend** :
   ```bash
   cd backend
   ```
3. **Installez les dépendances** :
   ```bash
   npm install
   ```

### 4.4 Démarrer le serveur

1. **Toujours dans le dossier backend**, démarrez le serveur :
   ```bash
   npm start
   ```

2. **Vous devriez voir** :
   ```
   🚀 Serveur WhatsApp démarré sur le port 3000
   📱 Endpoint: http://localhost:3000/send-whatsapp
   💚 Health check: http://localhost:3000/health
   ```

3. **✅ Le serveur est démarré !** **Laissez ce terminal ouvert.**

---

## ✅ Étape 5 : Tester (5 min)

### 5.1 Vérifier le backend

1. **Ouvrez votre navigateur**
2. **Allez sur** [http://localhost:3000/health](http://localhost:3000/health)
3. **Vous devriez voir** :
   ```json
   {
     "status": "OK",
     "service": "WhatsApp Order Service",
     "timestamp": "..."
   }
   ```
4. **✅ Le backend fonctionne !**

### 5.2 Tester une commande

1. **Ouvrez votre site web** (Delicorner)
2. **Ajoutez des articles** au panier
3. **Allez au panier** et remplissez le formulaire
4. **Cliquez sur** "✅ Valider et envoyer la commande"
5. **Vérifiez** :
   - **Console du navigateur** (F12) : message "✅ Message WhatsApp envoyé via Twilio"
   - **Votre WhatsApp** : vous devriez recevoir le message ! 🎉

---

## 🔧 Dépannage Rapide

### ❌ "Configuration Twilio manquante"
- Vérifiez que le fichier `.env` existe dans `backend/`
- Vérifiez que les valeurs sont correctement remplies
- Redémarrez le serveur

### ❌ "Cannot connect to localhost:3000"
- Vérifiez que le serveur backend est démarré
- Vérifiez que le port 3000 n'est pas utilisé

### ❌ Le message ne s'envoie pas
- Vérifiez que votre numéro WhatsApp est vérifié dans le Sandbox
- Vérifiez la console du navigateur (F12)
- Vérifiez les logs du serveur backend

---

## 📝 Checklist

- [ ] Compte Twilio créé
- [ ] WhatsApp Sandbox activé
- [ ] Numéro WhatsApp vérifié
- [ ] Account SID copié
- [ ] Auth Token copié
- [ ] WhatsApp Sandbox Number copié
- [ ] Fichier `backend/.env` créé
- [ ] Variables remplies dans `.env`
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur démarré (`npm start`)
- [ ] Backend vérifié (http://localhost:3000/health)
- [ ] Commande testée sur le site

---

## 🎉 C'est fait !

Si vous recevez les messages WhatsApp, **votre configuration est complète !**

**Prochaine étape** : Tester plusieurs commandes pour vérifier que tout fonctionne correctement.

---

## 🆘 Besoin d'aide ?

Consultez le guide complet : `GUIDE_TWILIO_PAS_A_PAS.md`
