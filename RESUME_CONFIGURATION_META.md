# 📋 Résumé Rapide - Configuration WhatsApp Meta

## 🎯 Étapes Essentielles (5 minutes)

### 1️⃣ Ajouter WhatsApp
```
Meta Developer → Application "Delicorner" → Add Product → WhatsApp
```

### 2️⃣ Choisir Cas d'Utilisation
```
"Send notifications" ou "Envoyer des notifications" ⭐
```

### 3️⃣ Récupérer les Credentials
```
WhatsApp → Démarrage rapide → 
  - Phone Number ID (copier)
  - Access Token (copier)
```

### 4️⃣ Ajouter Numéro de Test
```
Démarrage rapide → Send test message → 
  Ajouter: +32451032356
```

### 5️⃣ Configurer .env
```env
META_PHONE_NUMBER_ID=votre_id
META_ACCESS_TOKEN=votre_token
META_API_VERSION=v18.0
PORT=3000
```

### 6️⃣ Démarrer Serveur
```bash
cd backend
npm run start:meta
```

### 7️⃣ Tester
```
Passer une commande sur le site → 
Vérifier réception WhatsApp ✅
```

---

## 📍 Où Trouver les Infos dans Meta

| Information | Où le trouver |
|-------------|---------------|
| Phone Number ID | WhatsApp → Démarrage rapide → Section "From" |
| Access Token | WhatsApp → Démarrage rapide → "Temporary access token" |
| Ajouter numéro test | WhatsApp → Démarrage rapide → "Send test message" |

---

## ⚠️ Points Importants

- ✅ Token temporaire = **24h seulement**
- ✅ Maximum **5 numéros** en mode test
- ✅ Format numéro : `+32451032356` (avec +)
- ✅ Redémarrer serveur après modification `.env`

---

## 🆘 Problèmes Courants

| Problème | Solution |
|----------|----------|
| Token expiré | Récupérer nouveau token dans "Démarrage rapide" |
| Numéro non enregistré | Ajouter le numéro dans "Send test message" |
| Serveur ne démarre pas | Vérifier `.env` et `npm install` |

---

**Guide complet :** Voir `GUIDE_COMPLET_WHATSAPP_META.md`
