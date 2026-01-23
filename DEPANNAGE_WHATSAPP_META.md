# 🔧 Dépannage - Messages WhatsApp Meta Non Reçus

## ✅ Checklist de Vérification

### 1. Le Serveur Backend est-il Démarré ?

**Vérifiez que le serveur Meta est bien démarré :**

```bash
cd backend
npm run start:meta
```

**⚠️ Important :** Utilisez `npm run start:meta` et **PAS** `npm start` (qui démarre Twilio).

**Vous devriez voir :**
```
🚀 Serveur WhatsApp (Meta) démarré sur le port 3000
📱 Endpoint: http://localhost:3000/send-whatsapp
💚 Health check: http://localhost:3000/health
```

---

### 2. Vérifier que le Serveur Répond

**Ouvrez un navigateur** et allez à :
```
http://localhost:3000/health
```

**Vous devriez voir :**
```json
{
  "status": "OK",
  "service": "WhatsApp Order Service (Meta)",
  "timestamp": "..."
}
```

**Si vous voyez une erreur** → Le serveur n'est pas démarré ou il y a un problème.

---

### 3. Vérifier les Logs du Serveur

**Dans le terminal où le serveur tourne**, regardez les logs :

**✅ Si vous voyez :**
```
Message WhatsApp envoyé via Meta - Commande #0001 - ID: wamid.xxx
```
→ Le message a été envoyé avec succès

**❌ Si vous voyez des erreurs :**
- Copiez l'erreur complète
- Vérifiez le message d'erreur (voir section "Erreurs Courantes" ci-dessous)

---

### 4. Vérifier la Console du Navigateur

**Ouvrez la console du navigateur** (F12) et regardez :

**✅ Si vous voyez :**
```
🚀 processWhatsAppOrder appelé avec: {...}
🚀 sendOrderViaWhatsApp appelé avec orderData: {...}
✅ Message WhatsApp envoyé avec succès
```
→ Le frontend fonctionne correctement

**❌ Si vous voyez des erreurs :**
- Copiez l'erreur complète
- Vérifiez que `whatsapp-order.js` est bien chargé

---

### 5. Vérifier le Numéro de Destination

**Le numéro doit être :**
- Format : `+32451032356` (avec le +)
- Ajouté dans Meta Developer (page "Tests d'API")
- Maximum 5 numéros en mode test

**Vérifiez dans Meta Developer :**
1. Allez dans **WhatsApp** > **"Tests d'API"**
2. Section 3 : "Ajouter un numéro de téléphone du destinataire"
3. Vérifiez que `+32 451 03 23 56` est bien listé

---

### 6. Vérifier le Token

**Le token Meta expire après 60 minutes.**

**Si le token a expiré :**
1. Allez dans Meta Developer > **WhatsApp** > **"Tests d'API"**
2. Section 1 : Cliquez sur **"Générer un jeton d'accès"**
3. Copiez le nouveau token
4. Mettez à jour `META_ACCESS_TOKEN` dans `backend/.env`
5. **Redémarrez le serveur** (`Ctrl+C` puis `npm run start:meta`)

---

## 🆘 Erreurs Courantes

### Erreur : "Invalid OAuth access token"

**Cause :** Le token a expiré (valide 60 minutes)

**Solution :**
1. Allez dans Meta Developer > **WhatsApp** > **"Tests d'API"**
2. Cliquez sur **"Générer un jeton d'accès"**
3. Copiez le nouveau token
4. Mettez à jour `META_ACCESS_TOKEN` dans `backend/.env`
5. Redémarrez le serveur

---

### Erreur : "Phone number not registered"

**Cause :** Le numéro de destination n'est pas ajouté dans Meta

**Solution :**
1. Allez dans Meta Developer > **WhatsApp** > **"Tests d'API"**
2. Section 3 : Ajoutez le numéro `+32451032356`
3. Cliquez sur "Ajouter" ou "Envoyer un message test"
4. Réessayez

---

### Erreur : "Cannot connect to server" ou "Network error"

**Cause :** Le serveur backend n'est pas démarré

**Solution :**
1. Ouvrez un terminal dans `backend`
2. Démarrez le serveur : `npm run start:meta`
3. Vérifiez que vous voyez le message de démarrage
4. Réessayez

---

### Erreur : "ECONNREFUSED" ou "Connection refused"

**Cause :** Le serveur n'écoute pas sur le port 3000

**Solution :**
1. Vérifiez qu'aucun autre processus n'utilise le port 3000
2. Vérifiez que le serveur est bien démarré avec `npm run start:meta`
3. Vérifiez le fichier `.env` : `PORT=3000`

---

## 🔍 Test Manuel

### Test 1 : Vérifier le Serveur

```bash
curl http://localhost:3000/health
```

**Résultat attendu :**
```json
{"status":"OK","service":"WhatsApp Order Service (Meta)","timestamp":"..."}
```

### Test 2 : Envoyer un Message Test

```bash
curl -X POST http://localhost:3000/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "32451032356",
    "message": "Test message depuis Meta WhatsApp API"
  }'
```

**Résultat attendu :**
```json
{"success":true,"messageId":"wamid.xxx","status":"sent"}
```

**Si vous voyez une erreur :**
- Copiez l'erreur complète
- Vérifiez les logs du serveur

---

## 📋 Checklist Complète

- [ ] Serveur démarré avec `npm run start:meta` (PAS `npm start`)
- [ ] Serveur répond sur `http://localhost:3000/health`
- [ ] Token Meta valide (généré il y a moins de 60 minutes)
- [ ] Phone Number ID correct dans `.env` : `946074821930483`
- [ ] Access Token correct dans `.env` (votre nouveau token)
- [ ] Numéro de destination ajouté dans Meta Developer (`+32 451 03 23 56`)
- [ ] Console navigateur ne montre pas d'erreurs
- [ ] Logs serveur montrent l'envoi du message
- [ ] Test manuel avec curl fonctionne

---

## 🎯 Action Immédiate

**Faites ceci maintenant :**

1. **Vérifiez que le serveur est démarré** :
   ```bash
   cd backend
   npm run start:meta
   ```

2. **Vérifiez les logs** dans le terminal

3. **Ouvrez la console du navigateur** (F12) et regardez les erreurs

4. **Testez manuellement** avec curl (voir section "Test Manuel")

5. **Vérifiez le token** dans Meta Developer (générez-en un nouveau si nécessaire)

---

**Dites-moi ce que vous voyez dans les logs du serveur et dans la console du navigateur, et je vous aiderai à résoudre le problème !** 🔍
