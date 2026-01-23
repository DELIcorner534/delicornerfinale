# 📱 Cas d'Utilisation WhatsApp Business API - Delicorner

## 🎯 Quel Cas d'Utilisation Choisir ?

Lors de la configuration de WhatsApp Business Platform dans Meta Developer, on vous demande de sélectionner un **cas d'utilisation** (Use Case).

---

## ✅ Cas d'Utilisation Recommandé

### Option 1 : "Send notifications" ou "Envoyer des notifications" (RECOMMANDÉ)

**Pourquoi :**
- ✅ Vous envoyez des **notifications automatiques** de commande
- ✅ Les clients ne répondent pas nécessairement (communication unidirectionnelle)
- ✅ C'est exactement ce que fait votre système : notifier les clients de leurs commandes

**Si cette option existe, choisissez-la !**

---

### Option 2 : "Customer care" ou "Service client"

**Pourquoi :**
- ✅ Permet d'envoyer des messages aux clients
- ✅ Peut inclure des notifications
- ⚠️ Implique généralement une communication bidirectionnelle

**Acceptable si l'option "Notifications" n'existe pas.**

---

### Option 3 : "Marketing" ou "Marketing"

**⚠️ À ÉVITER :**
- ❌ Les messages marketing ont des restrictions plus strictes
- ❌ Nécessitent souvent des templates approuvés obligatoires
- ❌ Pas adapté pour les notifications de commande

---

### Option 4 : "Enter in contact with your customers via WhatsApp" ou "Entrer en contact avec vos clients via WhatsApp"

**Acceptable mais pas optimal :**
- ✅ Fonctionne pour envoyer des messages
- ⚠️ Généralement conçu pour une communication bidirectionnelle
- ⚠️ Peut avoir des limitations différentes

**Si c'est la seule option disponible, vous pouvez la choisir, mais préférez "Notifications" ou "Service client" si disponible.**

---

## 📋 Liste des Cas d'Utilisation Possibles

Voici les cas d'utilisation courants dans Meta WhatsApp Business API :

1. **"Send notifications"** / **"Envoyer des notifications"** ⭐ **MEILLEUR CHOIX**
2. **"Customer care"** / **"Service client"** ✅ **BON CHOIX**
3. **"Enter in contact with your customers"** / **"Entrer en contact avec vos clients"** ⚠️ **ACCEPTABLE**
4. **"Marketing"** / **"Marketing"** ❌ **À ÉVITER**

---

## 🎯 Recommandation pour Delicorner

**Choisissez :** **"Send notifications"** ou **"Envoyer des notifications"**

**Pourquoi :**
- Votre système envoie des **notifications automatiques** de commande
- Les clients reçoivent des messages mais ne répondent pas nécessairement
- C'est le cas d'utilisation le plus adapté pour votre besoin

---

## ✅ Si "Entrer en contact avec vos clients" est la seule option

Si **"Entrer en contact avec vos clients via WhatsApp"** est la seule option disponible :

1. **Vous pouvez la choisir** - cela fonctionnera
2. **Cela permettra** d'envoyer des messages WhatsApp
3. **Vous pourrez** toujours envoyer des notifications de commande

**Note :** Le cas d'utilisation peut affecter :
- Les types de messages que vous pouvez envoyer
- Les restrictions et limitations
- Les templates disponibles

Mais pour votre cas (notifications de commande), cela devrait fonctionner.

---

## 📝 Après la Sélection

Une fois le cas d'utilisation sélectionné :

1. ✅ Vous pourrez continuer la configuration
2. ✅ Récupérer le Phone Number ID
3. ✅ Récupérer l'Access Token
4. ✅ Configurer votre backend

---

## 🔄 Si Vous Voulez Changer Plus Tard

**Bonne nouvelle :** Vous pouvez généralement modifier le cas d'utilisation plus tard dans les paramètres de l'application si nécessaire.

---

## ✅ Action à Prendre

**Si vous voyez "Send notifications" ou "Envoyer des notifications" :**
→ **Choisissez cette option** ⭐

**Si vous ne voyez que "Entrer en contact avec vos clients" :**
→ **Choisissez cette option** - cela fonctionnera pour votre besoin ✅

**Si vous voyez "Customer care" ou "Service client" :**
→ **C'est aussi un bon choix** ✅

---

**En résumé :** "Entrer en contact avec vos clients via WhatsApp" fonctionnera, mais si vous voyez "Notifications" ou "Service client", préférez ces options.
