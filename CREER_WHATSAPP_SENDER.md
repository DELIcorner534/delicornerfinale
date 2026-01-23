# 📱 Créer un WhatsApp Sender dans Twilio

## ⚠️ Problème Identifié

Le message indique : **"You need a WhatsApp Sender before submitting for approval. Create one on the WhatsApp senders page."**

Cela signifie que vous devez **créer un WhatsApp Sender** avant de pouvoir soumettre le template pour approbation.

---

## 🚨 IMPORTANT : Compte d'Essai

**Si vous voyez le message : "Veuillez mettre à niveau votre compte pour soumettre un expéditeur WhatsApp"**, cela signifie que vous avez un **compte d'essai Twilio**.

**Avec un compte d'essai :**
- ❌ Vous **ne pouvez pas** créer un WhatsApp Sender
- ❌ Vous **ne pouvez pas** soumettre des templates pour approbation
- ✅ Vous **pouvez** toujours utiliser le Sandbox avec des messages libres (fenêtre de 24h)

**Solutions :**
- **Option 1** : Mettre à niveau vers un compte payant (voir `COMPTE_ESSAI_TWILIO.md`)
- **Option 2** : Continuer avec le Sandbox et les messages libres (gratuit, mais limité à 24h)

Voir le guide complet : **`COMPTE_ESSAI_TWILIO.md`**

---

## ✅ Solution : Créer un WhatsApp Sender

### Étape 1 : Accéder à la Page WhatsApp Senders

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Senders"**
2. **Ou cliquez directement** sur le lien dans le message d'erreur : "WhatsApp senders page"
3. **Vous verrez** la liste des senders existants (probablement vide)

### Étape 2 : Créer un Nouveau Sender

1. **Cliquez sur** le bouton **"Create Sender"** ou **"Add Sender"**
2. **Sélectionnez** le type : **"WhatsApp"**
3. **Remplissez les informations** :
   - **Display Name** : `Delicorner` (ou le nom de votre sandwicherie)
   - **Phone Number** : Utilisez le numéro Sandbox `+14155238886`
   - **Description** (optionnel) : `Sandwicherie Delicorner - Commandes WhatsApp`

### Étape 3 : Vérifier le Sender

1. **Vérifiez** que le sender est créé et actif
2. **Le statut** devrait être "Active" ou "Verified"
3. **Notez** le Sender ID (si disponible)

---

## 📋 Informations Nécessaires

Pour créer le sender, vous aurez besoin de :

- **Display Name** : Nom d'affichage (ex: `Delicorner`)
- **Phone Number** : Le numéro WhatsApp Sandbox (`+14155238886`)
- **Description** (optionnel) : Description du sender

---

## 🔄 Après la Création du Sender

Une fois le sender créé :

1. **Retournez** à la page **"Content"** > **"Templates"**
2. **Ouvrez** le template `delicorner_nouvelle_commande`
3. **Le bouton** "Submit for Approval" devrait maintenant être disponible
4. **Soumettez** le template pour approbation

---

## 🆘 Si Vous Ne Trouvez Pas la Page

Si vous ne trouvez pas la page "WhatsApp Senders" :

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Settings"** > **"Senders"**
2. **Ou utilisez** la barre de recherche en haut : tapez "WhatsApp Senders"
3. **Ou allez directement** à : `https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders`

---

## 📝 Notes Importantes

- **Le sender est nécessaire** pour soumettre des templates WhatsApp pour approbation
- **Vous pouvez utiliser** le numéro Sandbox (`+14155238886`) pour créer le sender
- **Une fois le sender créé**, vous pourrez soumettre le template

---

## ✅ Prochaines Étapes

1. ✅ Créer le WhatsApp Sender
2. ✅ Retourner au template
3. ✅ Soumettre le template pour approbation
4. ⏳ Attendre l'approbation (1-3 jours)
5. ✅ Tester les commandes

---

**Note** : Le sender est un prérequis pour l'approbation des templates. Sans sender, vous ne pouvez pas soumettre de templates.
