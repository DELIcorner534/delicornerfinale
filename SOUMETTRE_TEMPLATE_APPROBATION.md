# 📤 Soumettre le Template pour Approbation

## ⚠️ Problème Identifié

Le message dans Twilio indique : **"WhatsApp approval not submitted. Please submit the template for approval in order to use it."**

Cela signifie que le template doit être **soumis pour approbation** avant de pouvoir être utilisé.

---

## ✅ Solution : Soumettre le Template

### ⚠️ ÉTAPE PRÉALABLE : Créer un WhatsApp Sender

**IMPORTANT** : Avant de pouvoir soumettre le template, vous devez créer un **WhatsApp Sender**.

Si vous voyez le message : *"You need a WhatsApp Sender before submitting for approval"*, suivez d'abord le guide : **`CREER_WHATSAPP_SENDER.md`**

### Étape 1 : Ouvrir le Template

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Content"**
2. **Cliquez sur** le template `delicorner_nouvelle_commande`
3. **Vous verrez** les détails du template

### Étape 2 : Soumettre pour Approbation

1. **Cherchez le bouton** "Submit for Approval" ou "Soumettre pour approbation"
2. **Cliquez dessus**
3. **Confirmez** la soumission
4. **Le statut** passera à "Pending" (En attente)

---

## ⏳ En Attendant l'Approbation

Pendant que vous attendez l'approbation (1-3 jours), le système utilisera automatiquement le **fallback** (message libre) si :
- Le numéro de destination est ajouté au Sandbox
- Le numéro a initié une conversation dans les 24 dernières heures

---

## 🔧 Solution Temporaire : Utiliser le Message Libre

En attendant l'approbation, vous pouvez :

1. **S'assurer** que le numéro de destination (`+32451032356`) est ajouté au Sandbox
2. **Envoyer un message** depuis ce numéro au Sandbox (`+14155238886`) avec le code `join <code>`
3. **Tester** une commande - le système utilisera le message libre (fallback)

---

## 📝 Après l'Approbation

Une fois le template approuvé :

1. **Le statut** passera à "Approved"
2. **Le système utilisera automatiquement** le template
3. **Plus besoin** de messages libres ou de Sandbox

---

## 🆘 Si Vous Ne Trouvez Pas le Bouton

Si vous ne trouvez pas le bouton "Submit for Approval" :

1. **Vérifiez** que vous avez créé un **WhatsApp Sender** (voir `CREER_WHATSAPP_SENDER.md`)
2. **Vérifiez** que le template est bien créé et complet
3. **Vérifiez** que toutes les variables sont définies
4. **Contactez** le support Twilio si nécessaire

---

**Note** : L'approbation peut prendre 1-3 jours. Pendant ce temps, utilisez le Sandbox avec des messages libres.
