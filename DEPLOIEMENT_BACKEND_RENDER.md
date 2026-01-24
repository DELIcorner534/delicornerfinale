# Déploiement backend sur Render

## 1. Préparer le dépôt Git (PowerShell)

Ouvre **PowerShell** et va dans le dossier du projet :

```powershell
cd C:\Users\HP-PC\Desktop\delicorner-main
```

### Fichiers backend à committer

```powershell
git add backend/server-meta-whatsapp.js backend/.env.meta.example
git status
```

Tu dois voir `backend/server-meta-whatsapp.js` et `backend/.env.meta.example` en "Changes to be committed".

### Commit et push

```powershell
git commit -m "Backend: WhatsApp après paiement, confirm-and-send, META_ORDER_TO"
git push origin main
```

Si `git push` demande un identifiant, utilise ton compte GitHub (DELIcorner534).

---

## 2. Configuration Render

### 2.1 Accéder au service

1. Va sur **https://dashboard.render.com**
2. Clique sur ton service **delicorner-whatsapp** (ou le nom du backend)

### 2.2 Root Directory

- Onglet **Settings** → **Build & Deploy**
- **Root Directory** : `backend`  
  *(Si vide, Render cherche à la racine ; ton `package.json` et `server-meta-whatsapp.js` sont dans `backend`.)*

### 2.3 Build & Start

- **Build Command** : `npm install` (ou vide, Render le fait par défaut)
- **Start Command** : `npm start`  
  *(`package.json` doit avoir `"start": "node server-meta-whatsapp.js"`.)*

### 2.4 Variables d'environnement

Onglet **Environment** → **Environment Variables**. Vérifie que **toutes** ces variables existent :

| Clé | Valeur |
|-----|--------|
| `META_PHONE_NUMBER_ID` | Ton Phone Number ID Meta |
| `META_ACCESS_TOKEN` | Ton token Meta (permanent) |
| `META_TEMPLATE_NAME` | `hello_world` ou `order_confirmation` |
| `META_TEMPLATE_LANGUAGE` | `nl_BE` ou `en_US` |
| **`META_ORDER_TO`** | **`32451032356`** (numéro WhatsApp du shop, sans +) |
| `MOLLIE_API_KEY` | Ta clé Mollie `test_...` |
| `MOLLIE_REDIRECT_SUCCESS_URL` | `https://delicornerhalle.be/payment-return.html` |
| `MOLLIE_REDIRECT_FAILURE_URL` | `https://delicornerhalle.be/payment-failure.html` |

**Important :** `META_ORDER_TO` est **obligatoire** pour l’envoi des commandes sur WhatsApp **après** paiement Bancontact.

Clique sur **Save Changes** si tu modifies des variables.

---

## 3. Déployer

### Déploiement automatique

Dès que tu fais `git push origin main`, Render déclenche un nouveau déploiement si le service est relié au dépôt GitHub.

### Déploiement manuel

1. Onglet **Manual Deploy** → **Deploy latest commit**
2. Optionnel : **Clear build cache & deploy** si tu as des soucis de cache

### Suivi du déploiement

- Onglet **Logs** : tu vois le build puis le démarrage du serveur.
- Quand tu vois `Serveur WhatsApp (Meta) démarré sur le port XXXX`, c’est bon.

---

## 4. Vérifier que le backend répond

- **Health** :  
  https://delicorner-whatsapp.onrender.com/health  
  → tu dois avoir `{"status":"OK",...}`

- **Config** :  
  https://delicorner-whatsapp.onrender.com/config  
  → `whatsappConfigured: true`, etc.

- **Payment by token** (test) :  
  https://delicorner-whatsapp.onrender.com/api/payment-by-token?t=test  
  → `{"error":"Token invalide ou expiré."}` = normal, la route existe.

---

## 5. En cas de problème

| Problème | Action |
|----------|--------|
| **404** sur `/api/...` ou `/send-whatsapp` | Vérifier **Root Directory** = `backend`, puis **Manual Deploy** → **Clear build cache & deploy** |
| **« Config Mollie / Meta manquante »** | Vérifier **Environment** : toutes les variables ci‑dessus, puis **Save** et redéployer |
| **Push refusé** | `git pull origin main --rebase` puis `git push origin main` |
| **Logs** | Onglet **Logs** sur Render pour voir les erreurs au démarrage ou lors des requêtes |

---

## Récapitulatif commandes (copier-coller)

```powershell
cd C:\Users\HP-PC\Desktop\delicorner-main
git add backend/server-meta-whatsapp.js backend/.env.meta.example
git status
git commit -m "Backend: WhatsApp après paiement, confirm-and-send, META_ORDER_TO"
git push origin main
```

Puis **Render** → **Logs** pour suivre le déploiement, et vérifier **Environment** (dont `META_ORDER_TO`).
