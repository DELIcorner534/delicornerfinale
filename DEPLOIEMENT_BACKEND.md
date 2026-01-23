# Déployer le backend Delicorner (sans base de données)

## Pas besoin de base de données

Les commandes sont **envoyées par WhatsApp** à la sandwicherie. C’est la trace officielle.  
Le backend ne fait que :
- recevoir la commande du site,
- l’envoyer via Meta WhatsApp API,
- répondre succès/erreur.

Aucune sauvegarde en BDD nécessaire pour ce flux.

---

## Où déployer (gratuit)

**Render** est adapté : gratuit, simple, supporte Node.js et Express.

- Site : [https://render.com](https://render.com)
- Créer un compte (GitHub ou email)

---

## Prérequis

1. **Projet sur GitHub**  
   - Le dépôt `delicorner-main` (ou équivalent) doit être sur GitHub.  
   - Si ce n’est pas fait : créez un dépôt, puis `git init` + `git add .` + `git commit` + `git remote add origin ...` + `git push`.

2. **Variables d’environnement**  
   Vous en aurez besoin pour Render. Elles sont dans `backend/.env` :
   - `META_PHONE_NUMBER_ID`
   - `META_ACCESS_TOKEN`
   - `META_API_VERSION` (optionnel, défaut `v18.0`)
   - `PORT` : **ne pas mettre** – Render le définit.

---

## Étapes sur Render

### 1. Nouveau Web Service

1. Render → **Dashboard** → **New +** → **Web Service**.
2. Connectez **GitHub** si ce n’est pas déjà fait.
3. Choisissez le dépôt du projet (ex. `delicorner-main`).

### 2. Configurer le service

| Champ | Valeur |
|--------|--------|
| **Name** | `delicorner-whatsapp` (ou autre) |
| **Region** | Choisir la plus proche (ex. Frankfurt) |
| **Branch** | `main` (ou la branche où vous poussez) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

`npm start` lance déjà le serveur Meta (`server-meta-whatsapp.js`).

### 3. Variables d’environnement

Dans **Environment** (Environment Variables), ajoutez :

| Key | Value |
|-----|--------|
| `META_PHONE_NUMBER_ID` | `946074821930483` |
| `META_ACCESS_TOKEN` | Votre token permanent (celui dans `.env`) |
| `META_API_VERSION` | `v18.0` |

Ne pas ajouter `PORT` ; Render s’en charge.

### 4. Créer le service

- Cliquez **Create Web Service**.
- Render installe les deps, lance `npm start`, puis expose une URL du type :
  - `https://delicorner-whatsapp.onrender.com`

### 5. Tester le backend

- **Health check :**  
  `https://votre-service.onrender.com/health`  
  Vous devez voir du JSON avec `"status":"OK"` et `"service":"WhatsApp Order Service (Meta)"`.

- **Envoi WhatsApp :**  
  C’est le frontend qui appelle `POST /send-whatsapp`. Une fois l’URL mise dans le frontend (étape suivante), un passage de commande fera le test.

---

## Mettre à jour le frontend

Une fois le backend déployé, il faut que le site appelle l’URL **HTTPS** du backend, plus `localhost`.

1. Ouvrez `js/whatsapp-order.js`.
2. Repérez la ligne avec `WHATSAPP_API_URL`.
3. Remplacez par l’URL Render :

```javascript
const WHATSAPP_API_URL = 'https://votre-service.onrender.com/send-whatsapp';
```

Remplacez `votre-service` par le **nom** donné au Web Service sur Render (ex. `delicorner-whatsapp`).

---

## Résumé

| Étape | Action |
|--------|--------|
| 1 | Projet sur GitHub |
| 2 | Render → New Web Service → repo + Root `backend` |
| 3 | Build : `npm install`, Start : `npm start` |
| 4 | Env : `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_API_VERSION` |
| 5 | Déployer, récupérer l’URL du service |
| 6 | Dans `js/whatsapp-order.js`, mettre `WHATSAPP_API_URL` = `https://...onrender.com/send-whatsapp` |

---

## Alternative : Railway

1. [railway.app](https://railway.app) → Login with GitHub.
2. **New Project** → **Deploy from GitHub** → choisir le dépôt.
3. **Settings** du service :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
4. **Variables** : ajouter `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_API_VERSION`.
5. **Generate Domain** pour obtenir une URL.
6. Dans `whatsapp-order.js`, mettre `WHATSAPP_API_URL` = `https://votre-domaine.railway.app/send-whatsapp`.

---

## Important

- **Pas de BDD** : les commandes ne sont pas stockées côté backend ; tout passe par WhatsApp.
- **CORS** : le backend autorise déjà les requêtes depuis un autre domaine (frontend hébergé ailleurs).
- **Token** : gardez le token Meta secret (uniquement dans les variables d’environnement, jamais dans le code).

Une fois ces étapes faites, le backend est déployé et le site peut envoyer les commandes par WhatsApp sans base de données.
