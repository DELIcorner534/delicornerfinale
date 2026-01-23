# 📋 Il reste quoi ? – État du projet Delicorner

## ✅ CE QUI EST FAIT (Terminé)

### Site & contenu
- ✅ Page d’échec de paiement
- ✅ Traductions (FR/NL/EN) pour toutes les pages *sauf* les noms des items du menu
- ✅ Styles CSS complets
- ✅ Horaires : Lun–Mar 7h–17h, Mer 7h–14h, Jeu–Ven 7h–17h, Sam–Dim fermé
- ✅ Adresse : Cypriaan Verhavertstraat 156, 1500 Halle
- ✅ Téléphone : 0488/153.993 (indisponible après heures)
- ✅ Modifs menu (The Classics, Panini zonder Groenten, sous-titre)

### Panier & commande
- ✅ Option crudités (The Basics) : Alle groenten +€0,50, Wortel/Sla/Komkommer/Tomaten +€0,20
- ✅ Saus (geen saus, andalouse, etc.) pour Panini (sauf Hesp Kaas, Mozzarella Tomaat Pesto) et Warme Broodjes
- ✅ Restriction horaire : Jeu–Ven 0h–8h30 (**mode simulation activé** = commandes à tout moment)
- ✅ Champs Adresse, Ville, Code postal **commentés** dans le formulaire
- ✅ Champs **Classe** et **École** (Heilig Hart / College Halle) avant Téléphone
- ✅ Images du menu (fictives ou corrigées)

### WhatsApp
- ✅ Envoi **automatique** des commandes par WhatsApp (Meta Business API)
- ✅ Token **permanent** configuré
- ✅ Message de commande en **néerlandais**
- ✅ Numéro de commande (#0001, #0002…)
- ✅ Code de vérification
- ✅ Section manuelle WhatsApp supprimée de la page succès

---

## ⏳ CE QUI RESTE (Optionnel ou pour la mise en production)

### 1. Désactiver le mode simulation (quand vous voulez la vraie restriction)

**Actuellement :** les commandes sont possibles **à tout moment** (pour les tests).

**Pour passer en réel :**
- Fichier : `js/cart-page.js`
- Mettre `SIMULATION_MODE: false` (ligne ~121)
- Ensuite : commandes **uniquement** le jeudi et vendredi de **0h à 8h30**

---

### 2. Mettre le backend en production

**Actuellement :** le backend tourne en local (`http://localhost:3000`).

**Pas besoin de base de données** : les commandes partent par WhatsApp à la sandwicherie, c’est suffisant. Guide détaillé : **`DEPLOIEMENT_BACKEND.md`**.

**À faire pour la prod :**
1. Déployer le backend (ex. **Heroku**, **Railway**, **Render**, **Vercel**…)
2. Mettre à jour l’URL dans `js/whatsapp-order.js` :
   - Remplacer `http://localhost:3000/send-whatsapp` par l’URL de prod, ex. `https://votre-app.herokuapp.com/send-whatsapp`
3. Configurer les variables d’environnement (`.env`) sur la plateforme de déploiement

Sans ça, WhatsApp ne fonctionne que sur votre PC, pas pour les visiteurs du site en ligne.

---

### 3. Héberger le site (frontend)

**Actuellement :** vous ouvrez les fichiers en local ou via un serveur local.

**À faire :** héberger les pages (HTML/CSS/JS) quelque part (ex. **Netlify**, **GitHub Pages**, **Vercel**) pour que le site soit accessible en ligne.

---

### 4. WhatsApp Meta – Production (si vous dépassez le mode test)

**En mode test :**
- Max **5 numéros** pouvant recevoir des messages
- Numéros à ajouter dans Meta Developer > WhatsApp > « Tests d’API »

**Pour la production :**
- Vérifier le **compte Meta Business**
- Ajouter / vérifier le **numéro WhatsApp Business** de la sandwicherie
- (Optionnel) Créer un **template** Meta pour envoyer des messages hors fenêtre 24h

---

### 5. Nettoyage / organisation (optionnel)

- Beaucoup de fichiers `.md` (guides Twilio, Meta, etc.) à la racine. Vous pouvez :
  - Les déplacer dans un dossier `docs/`
  - Ou supprimer ceux que vous n’utilisez plus

---

## 📊 Résumé rapide

| Élément | Statut |
|--------|--------|
| Site + menu + panier | ✅ Prêt |
| Formulaire (Classe, École, etc.) | ✅ Prêt |
| WhatsApp (Meta, NL, auto) | ✅ Prêt (en local) |
| Restriction horaire réelle | ⏳ Désactiver simulation |
| Backend en production | ⏳ À déployer |
| Site hébergé en ligne | ⏳ À faire |
| Meta en production (5+ numéros) | ⏳ Si besoin |

---

**En bref :** pour **tester en local**, tout est prêt. Pour **utiliser en vrai** avec des clients, il reste à **déployer le backend**, **héberger le site** et éventuellement **désactiver le mode simulation**.
