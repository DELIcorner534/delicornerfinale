# 🔧 Dépannage : pas de message WhatsApp après commande

## 1. Comment ouvrez-vous le site ?

**❌ Si vous ouvrez les fichiers en double-cliquant** (`file:///C:/.../index.html`) :  
Le navigateur **bloque** souvent les appels vers le backend Render (sécurité).  
→ **Il faut utiliser un serveur local** (voir ci‑dessous).

**✅ Utiliser un serveur local :**

- **Option A – VS Code / Cursor :** extension **Live Server** → clic droit sur `index.html` → **Open with Live Server**. L'URL sera du type `http://127.0.0.1:5500/...`
- **Option B – Terminal :** à la racine du projet :
  ```bash
  npx serve .
  ```
  Puis ouvrir `http://localhost:3000` (ou le port indiqué).

Testez à nouveau une commande **après** avoir ouvert le site via `http://...` (pas `file://`).

---

## 2. Vérifier la console du navigateur (F12)

1. Ouvrir le site (via Live Server ou `npx serve`).
2. **F12** → onglet **Console**.
3. Passer une commande (panier → formulaire → Valider).

**Si vous voyez :**
- **CORS / blocage "cross-origin"** → vous utilisez encore `file://` ; passer par un serveur local (étape 1).
- **Failed to fetch / Network error** → le backend Render ne répond pas (spin-down, URL mauvaise, etc.).
- **Erreur 500** → le backend reçoit la requête mais échoue (souvent variables d'environnement Meta manquantes ou incorrectes).

Notez le **message exact** affiché.

---

## 3. Template Meta (obligatoire pour recevoir les messages)

Sans template, **Meta ne livre pas** les messages (règle des 24 h). Il faut configurer un template.

1. Suivre **TEMPLATE_META_COMMANDES.md** pour créer `hello_world` (test) ou `delicorner_order` (commandes).
2. Sur **Render** → **Environment**, ajouter :
   - `META_TEMPLATE_NAME` = `hello_world` ou `delicorner_order`
   - `META_TEMPLATE_LANGUAGE` = `en_US` ou `nl_BE`
3. **Manual Deploy** après modification.

---

## 4. Vérifier les variables d'environnement sur Render

Sans ces variables, **aucun message WhatsApp** ne part.

1. **Render** → service **delicorner-whatsapp** → **Environment**.
2. Vérifier la présence de :

| Key | Value |
|-----|--------|
| `META_PHONE_NUMBER_ID` | (votre Phone Number ID) |
| `META_ACCESS_TOKEN` | Votre **token permanent** |
| `META_API_VERSION` | `v18.0` |
| `META_TEMPLATE_NAME` | `hello_world` ou `delicorner_order` |
| `META_TEMPLATE_LANGUAGE` | `en_US` ou `nl_BE` |

3. Si une variable manque ou est incorrecte : **Add** / **Edit**, enregistrer, puis **Manual Deploy** → **Clear build cache & deploy**.

---

## 5. Vérifier les logs Render

1. **Render** → **delicorner-whatsapp** → **Logs**.
2. Passer une commande sur le site.
3. Regarder les logs au même moment.

**Si vous voyez :**
- **"📥 Requête reçue sur /send-whatsapp"** → le frontend appelle bien le backend.
- **"❌ Configuration Meta manquante"** → variables d'environnement absentes ou mal nommées.
- **"❌ Erreur lors de l'envoi WhatsApp"** + détail → problème Meta (token, numéro, etc.).

Copiez le **message d'erreur complet** des logs.

---

## 6. Tester le backend à la main (sans le site)

Dans **PowerShell** :

```powershell
curl.exe -X POST "https://delicorner-whatsapp.onrender.com/send-whatsapp" -H "Content-Type: application/json" -d "{\"to\": \"32451032356\", \"message\": \"Test manuel\"}"
```

- **Réponse JSON avec `"success": true`** → le backend + Meta fonctionnent ; le souci vient du **frontend** (souvent `file://` ou erreur dans l'appel).
- **Réponse avec `"success": false`** ou erreur 500 → regarder le corps de la réponse et les **logs Render** (souvent token ou variables Meta).

---

## 7. Récapitulatif des causes fréquentes

| Cause | Action |
|-------|--------|
| **Pas de template configuré** | Ajouter `META_TEMPLATE_NAME` → **TEMPLATE_META_COMMANDES.md** |
| Site ouvert en `file://` | Utiliser **Live Server** ou **npx serve** |
| Variables Meta manquantes sur Render | Les ajouter, redéployer |
| Token Meta expiré ou invalide | Mettre à jour `META_ACCESS_TOKEN` sur Render |
| Numéro pas dans la liste Meta (mode test) | Ajouter le numéro dans Meta > WhatsApp > Tests d'API |
| Backend Render en "spin-down" | Attendre 30–60 s après 1ère requête, réessayer |

---

## 8. Ordre des vérifications

1. Configurer un **template** Meta → **TEMPLATE_META_COMMANDES.md**.
2. Ouvrir le site via **http** (Live Server ou `npx serve`).
3. Vérifier **Environment** sur Render (Meta + template).
4. Regarder **Console** (F12) et **Logs** Render lors d'une commande.
5. Si besoin, faire le **test curl** (étape 6).

Indiquez ce que vous voyez à l'étape qui bloque (console, logs, résultat du curl), et on pourra cibler la suite.
