# Déploiement – Bancontact + site

## 1. Backend (Render)

Le backend tourne sur **Render** et se déploie depuis **GitHub**.

### Commandes (PowerShell, dans le dossier du projet)

```powershell
cd C:\Users\HP-PC\Desktop\delicorner-main

git add backend/.env.meta.example backend/server-meta-whatsapp.js js/bancontact.js js/cart-page.js js/whatsapp-order.js js/payment-return.js
git status
git commit -m "Bancontact: token ?t= dans redirectUrl, payment-by-token, Payé → success"
git push origin main
```

- **Render** déploie automatiquement après le `git push` (si le service est lié au dépôt).
- Ou : **Render** → ton service → **Manual Deploy** → **Deploy latest commit**.

### Variables d'environnement sur Render

Vérifier que ces variables sont définies :

| Variable | Valeur |
|----------|--------|
| `MOLLIE_API_KEY` | Ta clé test Mollie (`test_...`) |
| `MOLLIE_REDIRECT_SUCCESS_URL` | `https://delicornerhalle.be/payment-return.html` *(page de retour unique)* |
| `MOLLIE_REDIRECT_FAILURE_URL` | `https://delicornerhalle.be/payment-failure.html` |
| `META_ORDER_TO` | Numéro WhatsApp du shop, format `32451032356` *(commandes envoyées **après** paiement Bancontact)* |

(Meta/WhatsApp : META_PHONE_NUMBER_ID, META_ACCESS_TOKEN, META_TEMPLATE_NAME, etc. déjà configurées.)

---

## 2. Frontend (Nomeo)

Le site est hébergé chez **Nomeo**. Il faut envoyer les **fichiers modifiés** dans le dossier web (celui où tu as remplacé WordPress).

### Fichiers à uploader

- `payment-return.html` (à la racine du site)
- `js/bancontact.js`
- `js/cart-page.js`
- `js/whatsapp-order.js`
- `js/payment-return.js`

Mettre `payment-return.html` à la racine et les fichiers `js/*` dans le dossier **js/** (remplacer les anciens).

### Comment uploader

- **Gestionnaire de fichiers Nomeo** : aller dans le dossier du site → `js` → supprimer les anciens `bancontact.js`, `cart-page.js`, `whatsapp-order.js` → envoyer les nouveaux.
- Ou **FTP** : connecte-toi, va dans `js/`, remplace ces 3 fichiers.

---

## 3. Vérifications

1. **Backend** : `https://delicorner-whatsapp.onrender.com/health` → doit renvoyer `{"status":"OK",...}`.
2. **Backend Mollie** : `https://delicorner-whatsapp.onrender.com/api/create-payment` en POST (ex. via console) → pas de 404, pas d’erreur « config Mollie manquante ».
3. **Site** : va sur **https://delicornerhalle.be** → menu → panier → formulaire → Bancontact → Valider. Tu dois être redirigé vers Mollie. Après paiement : **Payé** → page succès ; **Échoué / Annulé / Expiré / Ouvert** → page échec.

---

## 4. En cas de problème

- **404 sur /api/create-payment** : la version déployée sur Render ne contient pas cette route. Refais un **Manual Deploy** (clear cache + deploy) et attends la fin.
- **« Config Mollie manquante »** : ajoute `MOLLIE_API_KEY` et les deux URLs de redirection dans **Render** → **Environment**.
- **Pas de redirection vers Mollie** : ouvre la console (F12) sur la page panier, refais un clic sur Valider, et note l’erreur affichée.
- **« Payé » ne mène pas à la page succès** : ouvre F12 sur `payment-return.html` après retour de Mollie. Regarde les logs `[payment-return]` : `payment_id: MANQUANT` → problème www/non-www ou cookies ; `status: ...` → ce que l’API a renvoyé ; `Erreur API` → backend (Render) ou timeout. Mollie redirige vers `payment-return.html?t=TOKEN`. Ouvre F12 : logs `[payment-return]`. Si `payment-by-token` ou `payment-status` échoue, redéploie le **backend** (route `payment-by-token`).
