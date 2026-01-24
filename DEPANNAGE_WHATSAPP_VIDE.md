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
- **`templateLanguage`** doit correspondre **exactement** à la langue du template dans Meta (ex. `en_US` ou `nl_BE`).  
  **Erreur Meta `(#132001) Template name does not exist in the translation`** → la langue configurée (`META_TEMPLATE_LANGUAGE`) ne correspond pas à celle du template dans Meta. Par ex. template créé en **Dutch (Belgium)** → utilise **`nl_BE`** ; créé en **English (US)** → **`en_US`**.

---

## 2. Variables d’environnement sur Render

**Render** → ton service **delicorner-whatsapp** → **Environment**. Vérifie que **toutes** ces variables existent :

| Variable | Valeur | Rôle |
|----------|--------|------|
| `META_PHONE_NUMBER_ID` | Ton Phone Number ID Meta | Numéro d’envoi (business) |
| `META_ACCESS_TOKEN` | Ton token Meta (permanent) | Accès API |
| **`META_ORDER_TO`** | **`32451032356`** (sans +) | **Numéro qui REÇOIT les commandes** |
| `META_TEMPLATE_NAME` | `order_management_1` (ou celui que tu utilises) | Template utilisé |
| `META_TEMPLATE_LANGUAGE` | **Doit correspondre à la langue du template dans Meta** : `en_US` (English US) ou `nl_BE` (Dutch Belgium) | Langue du template |

**Important :** Si tu as l’erreur **`(#132001) Template name does not exist in the translation`** / **`order_management_1 does not exist in en_US`**, c’est que le template est dans une autre langue. Vérifie dans **Meta → Message Templates** la langue de `order_management_1` :  
- **Dutch (Belgium)** → `META_TEMPLATE_LANGUAGE=nl_BE`  
- **English (US)** → `META_TEMPLATE_LANGUAGE=en_US`  

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

**Test ciblé (envoi vers META_ORDER_TO, aucun paiement) :**

```powershell
Invoke-RestMethod -Uri "https://delicorner-whatsapp.onrender.com/api/test-whatsapp-send" -Method POST -ContentType "application/json" -Body '{}'
```

- **`success: true`** + IDs → Meta a accepté ; pas de message → vérifier **「To」** et téléphone.  
- **`success: false`** + **`meta`** → erreur Meta ; regarder **`meta`** pour le détail.

**Test direct Meta :** **API Setup** → **« Send test message »** vers **+32 451 03 23 56**. Reçu → 「To」 OK. Pas reçu → numéro pas dans 「To」 ou mauvais téléphone.

---

## 8. Erreur 132001 : « Template name does not exist in the translation »

**Logs Render :**  
`(#132001) Template name does not exist in the translation`  
`details: template name (order_management_1) does not exist in en_US`

**Cause :** La variable **`META_TEMPLATE_LANGUAGE`** sur Render (ex. `en_US`) ne correspond pas à la **langue réelle** du template dans Meta.

**À faire :**

1. Ouvre **Meta** → **WhatsApp** → **Message Templates**.
2. Trouve le template **`order_management_1`** et note sa **langue** (ex. **Dutch (Belgium)** ou **English (US)**).
3. Sur **Render** → **Environment** :
   - Si le template est en **Dutch (Belgium)** → mets **`META_TEMPLATE_LANGUAGE=nl_BE`**.
   - Si le template est en **English (US)** → **`META_TEMPLATE_LANGUAGE=en_US`** (et vérifie que le template existe bien en en_US dans Meta).
4. **Save** → **Manual Deploy**.
5. Refais un test : commande → Bancontact → **Payé**.

---

En résumé : **config Render** (dont **META_ORDER_TO**), **template Meta approuvé**, **langue du template** (`META_TEMPLATE_LANGUAGE` = langue dans Meta) et **numéro « To »** correct sont les points à contrôler en priorité.
