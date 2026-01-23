# 🔍 Guide de Débogage - Messages WhatsApp Non Reçus

## ✅ Checklist de Vérification

### 1. Vérifier que le serveur backend fonctionne

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
4. **Si vous ne voyez pas cela** → Le serveur n'est pas démarré. Démarrez-le avec `npm start` dans le dossier `backend`.

---

### 2. Vérifier la configuration Twilio

1. **Allez sur** [http://localhost:3000/config](http://localhost:3000/config)
2. **Vous devriez voir** :
   ```json
   {
     "whatsappConfigured": true,
     "port": "3000"
   }
   ```
3. **Si `whatsappConfigured` est `false`** → Vérifiez votre fichier `backend/.env`

---

### 3. Vérifier que le numéro est ajouté au Sandbox Twilio

**⚠️ IMPORTANT :** Pour recevoir des messages via le Sandbox Twilio, le numéro de destination **DOIT** être ajouté au Sandbox.

#### Comment vérifier :

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Try it out"** > **"Send a WhatsApp message"**
2. **Vérifiez** que votre numéro de destination (`+32451032356`) apparaît dans la liste des numéros vérifiés

#### Si le numéro n'est pas ajouté :

1. **Sur votre téléphone** avec le numéro `+32 451 03 23 56`, ouvrez WhatsApp
2. **Envoyez un message** au numéro Sandbox : `+14155238886`
3. **Envoyez le code d'activation** : `join <code>` (remplacez `<code>` par le code de votre Sandbox)
4. **Vous devriez recevoir** : "Your WhatsApp number is verified!"

---

### 4. Vérifier les logs du serveur backend

Quand vous passez une commande, **regardez le terminal où le serveur backend tourne**. Vous devriez voir :

```
📤 Tentative d'envoi WhatsApp:
   De: whatsapp:+14155238886
   À: whatsapp:+32451032356
   Commande: #0001
   Message (premiers 100 caractères): ...
```

**Si vous voyez une erreur**, notez le code d'erreur :

- **Code 21608** : Le numéro n'est pas vérifié dans le Sandbox
- **Code 21211** : Numéro de téléphone invalide
- **Code 21614** : Ce numéro WhatsApp n'est pas autorisé

---

### 5. Vérifier la console du navigateur

1. **Ouvrez votre site** et passez une commande
2. **Ouvrez la console** (F12 > Console)
3. **Cherchez** les messages :
   - `✅ Message WhatsApp envoyé via API backend:` → Succès
   - `❌ Erreur API backend:` → Erreur

**Si vous voyez une erreur**, copiez le message d'erreur complet.

---

### 6. Tester manuellement l'envoi

Vous pouvez tester l'envoi directement depuis le Dashboard Twilio :

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Try it out"** > **"Send a WhatsApp message"**
2. **Remplissez** :
   - **To** : `whatsapp:+32451032356`
   - **From** : `whatsapp:+14155238886`
   - **Message** : "Test message"
3. **Cliquez sur** "Send Message"
4. **Vérifiez** si vous recevez le message

**Si ça fonctionne ici mais pas depuis votre site** → Le problème vient du code frontend/backend
**Si ça ne fonctionne pas ici non plus** → Le problème vient de la configuration Twilio (numéro non ajouté au Sandbox)

---

## 🔧 Solutions aux Problèmes Courants

### Problème 1 : "Le numéro n'est pas vérifié dans le Sandbox"

**Solution** :
1. Ajoutez le numéro au Sandbox (voir étape 3 ci-dessus)
2. Attendez quelques secondes
3. Réessayez

---

### Problème 2 : "Erreur de connexion au backend"

**Solution** :
1. Vérifiez que le serveur backend est démarré
2. Vérifiez que le port 3000 n'est pas utilisé par un autre programme
3. Vérifiez l'URL dans `js/whatsapp-order.js` : `WHATSAPP_API_URL = 'http://localhost:3000/send-whatsapp'`

---

### Problème 3 : "Configuration Twilio manquante"

**Solution** :
1. Vérifiez que le fichier `backend/.env` existe
2. Vérifiez que les variables sont correctement remplies :
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   PORT=3000
   ```
3. Redémarrez le serveur backend

---

### Problème 4 : "Le message est envoyé mais je ne le reçois pas"

**Solutions possibles** :
1. Vérifiez que le numéro est bien ajouté au Sandbox
2. Vérifiez que vous utilisez le bon numéro WhatsApp (celui qui est dans le Sandbox)
3. Vérifiez les logs du serveur pour voir le statut du message
4. Vérifiez dans le Dashboard Twilio > "Monitor" > "Logs" pour voir l'état du message

---

## 📝 Informations à Collecter pour le Débogage

Si le problème persiste, collectez ces informations :

1. **Logs du serveur backend** (terminal où tourne le serveur)
2. **Console du navigateur** (F12 > Console)
3. **Code d'erreur Twilio** (si présent)
4. **Statut du message** dans Twilio Dashboard > Monitor > Logs
5. **Vérification** : Le numéro est-il bien ajouté au Sandbox ?

---

## 🆘 Besoin d'Aide ?

Si après avoir suivi toutes ces étapes le problème persiste :
1. Vérifiez les logs du serveur backend
2. Vérifiez la console du navigateur
3. Vérifiez le Dashboard Twilio > Monitor > Logs
4. Notez tous les messages d'erreur

**Le problème le plus courant** : Le numéro de destination n'est pas ajouté au Sandbox Twilio.
