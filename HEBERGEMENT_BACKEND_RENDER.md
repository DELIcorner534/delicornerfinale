# Héberger le backend sur Render – Guide pas à pas

Suivez ces étapes **dans l’ordre**.

---

## Étape 1 : Projet sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous.
2. **New repository** → Nom : `delicorner` (ou `delicorner-main`).
3. Ne cochez pas "Add README" (le projet existe déjà).
4. Cliquez **Create repository**.

5. Sur votre PC, ouvrez un terminal dans le dossier **racine** du projet (`delicorner-main`), puis :

```bash
git init
git add .
git commit -m "Projet Delicorner - backend WhatsApp"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/delicorner.git
git push -u origin main
```

Remplacez `VOTRE-USERNAME` et `delicorner` par votre compte GitHub et le nom du dépôt.

---

## Étape 2 : Compte Render

1. Allez sur [render.com](https://render.com).
2. **Get Started** → **Sign up with GitHub**.
3. Autorisez Render à accéder à vos dépôts GitHub.

---

## Étape 3 : Créer le Web Service

1. Dans le **Dashboard** Render → **New +** → **Web Service**.
2. Dans la liste, sélectionnez votre dépôt (ex. `delicorner`).
3. Cliquez **Connect**.

---

## Étape 4 : Configuration du service

Remplissez **exactement** comme ci-dessous :

| Champ | Valeur |
|-------|--------|
| **Name** | `delicorner-whatsapp` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

Ne changez pas **Instance Type** (gardez Free).

---

## Étape 5 : Variables d’environnement

1. Cliquez sur **Advanced** pour afficher les options.
2. Dans **Environment Variables**, cliquez **Add Environment Variable**.
3. Ajoutez **une par une** :

| Key | Value |
|-----|--------|
| `META_PHONE_NUMBER_ID` | `946074821930483` |
| `META_ACCESS_TOKEN` | Collez votre **token permanent** (depuis `backend/.env`) |
| `META_API_VERSION` | `v18.0` |

**Ne pas** ajouter `PORT` : Render le définit tout seul.

---

## Étape 6 : Déployer

1. Cliquez **Create Web Service**.
2. Attendez 2 à 5 minutes (build + démarrage).
3. Quand le statut est **Live** (vert), votre backend est en ligne.

---

## Étape 7 : Récupérer l’URL du backend

En haut de la page du service, vous voyez une URL du type :

```
https://delicorner-whatsapp.onrender.com
```

**Notez cette URL** : vous en aurez besoin pour le frontend.

---

## Étape 8 : Tester le backend

Ouvrez dans votre navigateur :

```
https://delicorner-whatsapp.onrender.com/health
```

Vous devez voir quelque chose comme :

```json
{"status":"OK","service":"WhatsApp Order Service (Meta)","timestamp":"..."}
```

Si oui → **le backend est bien hébergé.**

---

## Étape 9 : Mettre à jour le frontend (plus tard)

Quand vous hébergerez le site, ouvrez `js/whatsapp-order.js` et remplacez :

```javascript
const WHATSAPP_API_URL = 'http://localhost:3000/send-whatsapp';
```

par (avec **votre** URL Render) :

```javascript
const WHATSAPP_API_URL = 'https://delicorner-whatsapp.onrender.com/send-whatsapp';
```

---

## Résumé

| # | Action |
|---|--------|
| 1 | Mettre le projet sur GitHub |
| 2 | Créer un compte Render (GitHub) |
| 3 | New Web Service → connecter le dépôt |
| 4 | Root Directory = `backend`, Start = `npm start` |
| 5 | Variables : `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_API_VERSION` |
| 6 | Create Web Service → attendre **Live** |
| 7 | Noter l’URL (ex. `https://...onrender.com`) |
| 8 | Tester `/health` |
| 9 | Plus tard : mettre `WHATSAPP_API_URL` dans `whatsapp-order.js` |

---

## En cas de problème

- **Build failed** : vérifiez que **Root Directory** = `backend`.
- **Crash au démarrage** : vérifiez les 3 variables d’environnement (surtout le token).
- **`/health` ne répond pas** : attendez 1–2 min de plus, Render peut mettre du temps au premier démarrage.
- **"GitHub repository is empty"** : le dépôt n'a pas reçu le code. Voir ci‑dessous.

### Corriger "GitHub repository is empty"

1. Terminal dans le dossier **racine** du projet (`delicorner-main`).
2. `git remote -v` → doit pointer vers `DELIcorner534/delicornerfinale`.
3. **Pousser** : `git push -u origin main`
4. Si Git demande identifiants : connexion GitHub ou **Personal Access Token**.
5. Sur Render : **Manual Deploy** → **Deploy latest commit**.

Une fois le push réussi, Render déploiera et le backend sera en ligne.
