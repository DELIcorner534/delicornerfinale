# Pas de message WhatsApp reçu – Dépannage

## 1. Vérifier la config backend (Render)

Ouvre **directement dans le navigateur** (nouvel onglet, pas via un script) :

**https://delicorner-whatsapp.onrender.com/api/whatsapp-status**

- Si tu obtiens **404** ou **« Impossible d'obtenir »** : la version déployée sur Render **n'inclut peut-être pas encore** cette route. → Pousse les derniers changements backend et refais un **Manual Deploy** (voir ci‑dessous).
- Tu peux d'abord tester **https://delicorner-whatsapp.onrender.com/health** : si ça répond `{"status":"OK",...}`, le backend tourne ; si **/api/whatsapp-status** renvoie 404, c'est que le déploiement n'a pas la nouvelle route.

**Déployer la route /api/whatsapp-status (PowerShell, dossier du projet) :**

```powershell
git add backend/server-meta-whatsapp.js DEPANNAGE_WHATSAPP_VIDE.md
git status
git commit -m "Backend: /api/whatsapp-status, liens racine, depannage"
git push origin main
```

Puis **Render** → ton service → **Manual Deploy** → **Deploy latest commit**. Attends la fin du déploiement, puis réessaie **/api/whatsapp-status**.

Tu dois voir un JSON du type :

```json
{
  "metaOk": true,
  "orderToSet": true,
  "templateName": "order_management_1",
  "templateLanguage": "en_US",
  "hint": "..."
}
```

- **`metaOk: false`** → Il manque `META_PHONE_NUMBER_ID` ou `META_ACCESS_TOKEN` dans Render → **Environment**.
- **`orderToSet: false`** → Il manque **`META_ORDER_TO`** (numéro WhatsApp du shop, ex. `32451032356`). C’est le numéro qui **reçoit** les commandes.
- **`templateName`** doit correspondre **exactement** au nom du template dans Meta (ex. `order_management_1`).
- **`templateLanguage`** doit correspondre à la langue du template (ex. `en_US` ou `nl_BE`).

---

## 2. Variables d’environnement sur Render

**Render** → ton service **delicorner-whatsapp** → **Environment**. Vérifie que **toutes** ces variables existent :

| Variable | Valeur | Rôle |
|----------|--------|------|
| `META_PHONE_NUMBER_ID` | Ton Phone Number ID Meta | Numéro d’envoi (business) |
| `META_ACCESS_TOKEN` | Ton token Meta (permanent) | Accès API |
| **`META_ORDER_TO`** | **`32451032356`** (sans +) | **Numéro qui REÇOIT les commandes** |
| `META_TEMPLATE_NAME` | `order_management_1` (ou celui que tu utilises) | Template utilisé |
| `META_TEMPLATE_LANGUAGE` | `en_US` ou `nl_BE` | Langue du template |

**Clique sur Save** si tu modifies, puis **Manual Deploy** si besoin.

---

## 3. Meta – Template et numéros de test

### Template

1. **Meta** → **WhatsApp** → **Message Templates**.
2. Trouve le template `order_management_1` (ou celui configuré).
3. Son statut doit être **Approuvé** (Approved).  
   S’il est **En attente** ou **Refusé**, les messages ne partent pas.

### Numéro « To » (qui reçoit)

1. **Meta** → **WhatsApp** → **API Setup**.
2. Section **「To」** (numéros de test).
3. Le numéro qui **reçoit** les commandes (**`META_ORDER_TO`**, ex. +32 451 03 23 56) doit être **ajouté** ici.  
   En mode développement, seuls les numéros de cette liste peuvent recevoir des messages.

---

## 4. Logs Render (après une commande Bancontact)

1. **Render** → ton service → **Logs**.
2. Fais une commande test : **site** → **panier** → **Bancontact** → **Payé** sur Mollie.
3. Dans les logs, cherche :
   - **`✅ WhatsApp envoyé après paiement (confirm-and-send): #...`** → envoi OK.
   - **`❌ confirm-and-send-whatsapp: ...`** → erreur (souvent Meta ou config).

Si tu vois l’erreur, copie le message complet (sans token) pour analyser.

---

## 5. Console navigateur (F12) sur payment-return

Après **Payé** sur Mollie, tu passes par **payment-return.html** puis **payment-success**.

1. Ouvre **F12** → **Console** **avant** de cliquer « Payé » sur Mollie.
2. Une fois sur **payment-return**, regarde les logs :
   - **`[payment-return] WhatsApp envoyé`** → requête OK.
   - **`[payment-return] Erreur confirm-and-send: ...`** → l’API a échoué.

Si tu arrives sur **payment-success** avec **`?whatsapp_failed=1`** dans l’URL (ou une alerte « notification WhatsApp n’a pas pu être envoyée »), c’est que **confirm-and-send** a échoué. Vérifie alors **config** (étape 1) et **logs Render** (étape 4).

---

## 6. Checklist rapide

- [ ] **`/api/whatsapp-status`** : `metaOk` et `orderToSet` à `true`, `templateName` correct.
- [ ] **Render Environment** : `META_ORDER_TO`, `META_TEMPLATE_NAME`, `META_TEMPLATE_LANGUAGE` présents et cohérents.
- [ ] **Meta** : template **approuvé**, **nom** et **langue** identiques à la config.
- [ ] **Meta API Setup** : numéro **`META_ORDER_TO`** ajouté dans **「To」** (numéros de test).
- [ ] **Logs Render** : pas d’erreur `confirm-and-send-whatsapp` après un paiement test.

---

## 7. Test manuel de l’API (PowerShell)

Pour vérifier que le backend envoie bien vers Meta (sans faire un vrai paiement), tu peux appeler **confirm-and-send** seulement si tu as un **token** valide (renvoyé après un paiement). Sinon, utilise **send-whatsapp** avec un message de test :

```powershell
Invoke-RestMethod -Uri "https://delicorner-whatsapp.onrender.com/send-whatsapp" -Method POST -ContentType "application/json" -Body '{"to":"32451032356","message":"Test Delicorner","orderNumber":"0000","orderData":{"delivery":{"name":"Test","phone":"000","school":"","class":""},"total":0,"items":[]}}'
```

Remplace `32451032356` par ton **META_ORDER_TO**.  
Si la réponse contient **`success: true`** et que tu ne reçois rien sur WhatsApp, le blocage est côté **Meta** (template, numéro « To », etc.).

---

En résumé : **config Render** (dont **META_ORDER_TO**), **template Meta approuvé** et **numéro « To »** correct sont les trois points à contrôler en priorité.
