# 🔑 Récupérer les Credentials Meta WhatsApp - Guide Visuel

## ✅ Vous êtes au bon endroit !

Vous êtes actuellement dans **"Démarrage rapide"** (Getting Started) de WhatsApp Business Platform. C'est exactement là où vous devez être !

---

## 📍 Où Trouver les Informations

### Sur la Page "Démarrage rapide"

Sur cette page, vous devriez voir plusieurs sections. Voici ce que vous devez chercher :

---

## 🔍 Étape 1 : Trouver le Phone Number ID

1. **Sur la page "Démarrage rapide"**, faites défiler vers le bas
2. **Cherchez** une section qui contient :
   - **"From"** ou **"De"** (numéro d'envoi)
   - **"Phone number ID"** ou **"ID du numéro de téléphone"**
3. **Vous verrez** un numéro long (ex: `123456789012345`)
4. **Copiez** ce numéro → c'est votre `META_PHONE_NUMBER_ID`

**💡 Astuce** : Le Phone Number ID est généralement affiché dans une boîte de texte ou un champ de formulaire.

---

## 🔍 Étape 2 : Trouver l'Access Token

1. **Sur la même page "Démarrage rapide"**, continuez à faire défiler
2. **Cherchez** une section avec :
   - **"Temporary access token"** ou **"Token d'accès temporaire"**
   - Un bouton **"Copy"** ou **"Copier"** à côté
3. **Cliquez sur** **"Copy"** pour copier le token
4. **⚠️ Important** : Ce token est valide **24 heures seulement**
5. **Copiez** cette valeur → c'est votre `META_ACCESS_TOKEN` (temporaire)

**💡 Astuce** : Le token commence généralement par `EAA...` et est très long.

---

## 🔍 Étape 3 : Si Vous Ne Voyez Pas les Informations

Si vous ne voyez pas le Phone Number ID et l'Access Token sur la page "Démarrage rapide" :

1. **Dans la barre latérale gauche**, cliquez sur **"Configuration de l'API"** (API Setup)
2. **Sur cette page**, vous devriez voir :
   - **"From"** → Phone Number ID
   - **"Temporary access token"** → Access Token

---

## 📝 Exemple de ce que vous devriez voir

Sur la page "Démarrage rapide" ou "Configuration de l'API", vous devriez voir quelque chose comme :

```
┌─────────────────────────────────────┐
│ From (De)                            │
│ ┌─────────────────────────────────┐ │
│ │ 123456789012345                 │ │ ← Phone Number ID
│ └─────────────────────────────────┘ │
│                                      │
│ Temporary access token               │
│ ┌─────────────────────────────────┐ │
│ │ EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx │ │ ← Access Token
│ └─────────────────────────────────┘ │
│ [Copy] [Regenerate]                  │
└─────────────────────────────────────┘
```

---

## 📋 Checklist

- [ ] Page "Démarrage rapide" ouverte
- [ ] Phone Number ID trouvé et copié
- [ ] Access Token trouvé et copié
- [ ] Portefeuille d'entreprises sélectionné (ex: "Amou")

---

## 🔄 Si Vous Ne Trouvez Toujours Pas

**Option 1 : Aller dans "Configuration de l'API"**

1. **Dans la barre latérale gauche**, cliquez sur **"Configuration de l'API"** (API Setup)
2. **Les informations** devraient être visibles sur cette page

**Option 2 : Vérifier le Portefeuille**

1. **Assurez-vous** que le portefeuille d'entreprises est bien sélectionné (ex: "Amou")
2. **Si nécessaire**, changez le portefeuille dans le menu déroulant
3. **Les informations** peuvent varier selon le portefeuille sélectionné

---

## ✅ Une Fois les Credentials Récupérés

1. **Créez ou modifiez** `backend/.env` :

```env
META_PHONE_NUMBER_ID=votre_phone_number_id_ici
META_ACCESS_TOKEN=votre_access_token_ici
META_API_VERSION=v18.0
PORT=3000
```

2. **Remplacez** les valeurs par celles que vous avez copiées

3. **Démarrez le serveur** :

```bash
cd backend
npm run start:meta
```

---

## 🆘 Besoin d'Aide ?

Si vous ne trouvez toujours pas les informations :

1. **Faites défiler** toute la page "Démarrage rapide"
2. **Cliquez sur** "Configuration de l'API" dans la barre latérale
3. **Vérifiez** que le portefeuille d'entreprises est bien sélectionné
4. **Prenez une capture d'écran** de la page et je pourrai vous aider à localiser les informations

---

**Note** : Le token temporaire expire après 24h. Pour la production, vous devrez créer un token permanent via "System Users" dans les paramètres de l'application.
