# Déploiement – Bancontact + site

## 1. Backend (Render)

Le backend tourne sur **Render** et se déploie depuis **GitHub**.

### Commandes (PowerShell, dans le dossier du projet)

```powershell
cd C:\Users\HP-PC\Desktop\delicorner-main

git add backend/.env.meta.example js/bancontact.js js/cart-page.js js/whatsapp-order.js
git status
git commit -m "Bancontact: WhatsApp puis Mollie, skipRedirect, delicornerhalle.be"
git push origin main
```

- **Render** déploie automatiquement après le `git push` (si le service est lié au dépôt).
- Ou : **Render** → ton service → **Manual Deploy** → **Deploy latest commit**.

### Variables d'environnement sur Render

Vérifier que ces variables sont définies :

| Variable | Valeur |
|----------|--------|
| `MOLLIE_API_KEY` | Ta clé test Mollie (`test_...`) |
| `MOLLIE_REDIRECT_SUCCESS_URL` | `https://delicornerhalle.be/payment-success.html` |
| `MOLLIE_REDIRECT_FAILURE_URL` | `https://delicornerhalle.be/payment-failure.html` |

(Meta/WhatsApp : déjà configurées.)

---

## 2. Frontend (Nomeo)

Le site est hébergé chez **Nomeo**. Il faut envoyer les **fichiers modifiés** dans le dossier web (celui où tu as remplacé WordPress).

### Fichiers à uploader

- `js/bancontact.js`
- `js/cart-page.js`
- `js/whatsapp-order.js`

Mettre ces fichiers dans le dossier **js/** sur le serveur (remplacer les anciens).

### Comment uploader

- **Gestionnaire de fichiers Nomeo** : aller dans le dossier du site → `js` → supprimer les anciens `bancontact.js`, `cart-page.js`, `whatsapp-order.js` → envoyer les nouveaux.
- Ou **FTP** : connecte-toi, va dans `js/`, remplace ces 3 fichiers.

---

## 3. Vérifications

1. **Backend** : `https://delicorner-whatsapp.onrender.com/health` → doit renvoyer `{"status":"OK",...}`.
2. **Backend Mollie** : `https://delicorner-whatsapp.onrender.com/api/create-payment` en POST (ex. via console) → pas de 404, pas d’erreur « config Mollie manquante ».
3. **Site** : va sur **https://delicornerhalle.be** → menu → panier → formulaire → Bancontact → Valider. Tu dois être redirigé vers Mollie.

---

## 4. En cas de problème

- **404 sur /api/create-payment** : la version déployée sur Render ne contient pas cette route. Refais un **Manual Deploy** (clear cache + deploy) et attends la fin.
- **« Config Mollie manquante »** : ajoute `MOLLIE_API_KEY` et les deux URLs de redirection dans **Render** → **Environment**.
- **Pas de redirection vers Mollie** : ouvre la console (F12) sur la page panier, refais un clic sur Valider, et note l’erreur affichée.
