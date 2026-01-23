# 📱 Créer un Template WhatsApp dans Twilio

## 🎯 Template Proposé pour Delicorner

### Informations du Template

- **Nom** : `delicorner_commande`
- **Catégorie** : `UTILITY` (Messages transactionnels)
- **Langue** : `Français (fr)` ou `Néerlandais (nl)`

---

## 📝 Corps du Template

### Version Complète (10 variables)

```
🍽️ *NOUVELLE COMMANDE DELICORNER*

📋 *Commande #{{1}}*
🕐 {{2}}

👤 *INFORMATIONS CLIENT*
Nom: {{3}}
Classe: {{4}}
École: {{5}}
Téléphone: {{6}}

🛒 *ARTICLES*
{{7}}

💰 *TOTAL: €{{8}}*

💳 Méthode de paiement: {{9}}

🔐 *Code de vérification: {{10}}*

✅ Merci pour votre commande !
```

### Variables

1. `{{1}}` - Numéro de commande (ex: 0001)
2. `{{2}}` - Date et heure (ex: 23/01/2026 20:52)
3. `{{3}}` - Nom du client (ex: Jean Dupont)
4. `{{4}}` - Classe (ex: 3A)
5. `{{5}}` - École (ex: Heilig Hart)
6. `{{6}}` - Téléphone (ex: 0488123456)
7. `{{7}}` - Liste des articles (formatée)
8. `{{8}}` - Total (ex: 9,00)
9. `{{9}}` - Méthode de paiement (ex: Bancontact)
10. `{{10}}` - Code de vérification (ex: A3F9B2C1)

---

## 🚀 Étapes pour Créer le Template dans Twilio

### Étape 1 : Accéder à Content Templates

1. **Connectez-vous** au Dashboard Twilio
2. **Allez dans** "Messaging" (menu de gauche)
3. **Cliquez sur** "Content" ou "Content Templates"
4. **Cliquez sur** "Create Template" ou "Nouveau template"

### Étape 2 : Remplir les Informations de Base

1. **Friendly Name** (Nom convivial) : `delicorner_commande`
2. **Category** (Catégorie) : Sélectionnez **"UTILITY"**
3. **Language** (Langue) : Sélectionnez **"Français (fr)"** ou **"Néerlandais (nl)"**
4. **Content Type** (Type de contenu) : Sélectionnez **"Text"**

### Étape 3 : Rédiger le Message

1. **Dans l'éditeur de texte**, copiez-collez le corps du template ci-dessus
2. **Important** : Utilisez exactement la syntaxe `{{1}}`, `{{2}}`, etc. pour les variables

### Étape 4 : Définir les Variables

Pour chaque variable `{{1}}` à `{{10}}`, Twilio vous demandera :

- **Variable Name** : Donnez un nom descriptif (ex: `order_number`, `date_time`, etc.)
- **Type** : Sélectionnez **"TEXT"** pour toutes
- **Example** : Donnez un exemple de valeur

**Exemples de noms de variables** :
- `{{1}}` → `order_number`
- `{{2}}` → `date_time`
- `{{3}}` → `client_name`
- `{{4}}` → `client_class`
- `{{5}}` → `client_school`
- `{{6}}` → `client_phone`
- `{{7}}` → `items_list`
- `{{8}}` → `total_price`
- `{{9}}` → `payment_method`
- `{{10}}` → `verification_code`

### Étape 5 : Soumettre pour Approbation

1. **Vérifiez** que tout est correct
2. **Cliquez sur** "Submit for Approval" ou "Soumettre pour approbation"
3. **Notez le Content SID** qui sera généré (commence par `HX...`)
4. **Attendez l'approbation** (peut prendre 1-3 jours)

---

## 💻 Modifier le Code Backend pour Utiliser le Template

Une fois le template approuvé, modifiez `backend/server.js` :

### 1. Ajouter le Content SID dans `.env`

```env
TWILIO_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Modifier `backend/server.js`

Remplacez la section d'envoi de message par :

```javascript
// Récupérer le Content SID depuis les variables d'environnement
const contentSid = process.env.TWILIO_CONTENT_SID;

// Formater la liste des articles
function formatItemsList(items) {
    return items.map((item, index) => {
        let itemText = `${index + 1}. ${item.name} x${item.quantity}`;
        
        // Ajouter les options (crudités)
        if (item.options && item.options.length > 0) {
            const optionsText = item.options.map(opt => opt.name).join(', ');
            itemText += ` (${optionsText})`;
        }
        
        // Ajouter la sauce
        if (item.sauce && item.sauce.name) {
            itemText += ` [${item.sauce.name}]`;
        }
        
        itemText += `\n   Prix: €${item.price}`;
        
        return itemText;
    }).join('\n');
}

// Dans la route /send-whatsapp, remplacer l'envoi par :
const result = await client.messages.create({
    from: twilioWhatsAppNumber,
    to: formattedTo,
    contentSid: contentSid,
    contentVariables: JSON.stringify({
        '1': orderNumber,
        '2': new Date().toLocaleString('fr-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        '3': orderData.delivery.name,
        '4': orderData.delivery.class || 'N/A',
        '5': orderData.delivery.school || 'N/A',
        '6': orderData.delivery.phone,
        '7': formatItemsList(orderData.items),
        '8': orderData.total.toFixed(2).replace('.', ','),
        '9': orderData.payment_method === 'bancontact' ? 'Bancontact' : orderData.payment_method,
        '10': orderData.verificationCode || 'N/A'
    })
});
```

---

## 📋 Version Simplifiée (7 variables)

Si vous préférez un template plus simple :

```
🍽️ *NOUVELLE COMMANDE DELICORNER*

📋 Commande #{{1}}
🕐 {{2}}

👤 Client: {{3}}
📞 Tél: {{4}}

🛒 Articles:
{{5}}

💰 Total: €{{6}}

🔐 Code: {{7}}
```

**Variables** :
1. `{{1}}` - Numéro de commande
2. `{{2}}` - Date/heure
3. `{{3}}` - Nom du client
4. `{{4}}` - Téléphone
5. `{{5}}` - Liste des articles
6. `{{6}}` - Total
7. `{{7}}` - Code de vérification

---

## ⚠️ Règles Importantes

1. **Pas d'emojis dans les variables** : Les emojis doivent être dans le texte fixe, pas dans les variables
2. **Format strict** : Respectez exactement le format WhatsApp
3. **Variables limitées** : Maximum 10 variables par template
4. **Pas de modification** : Une fois approuvé, vous ne pouvez pas modifier le template
5. **Approbation requise** : Tous les templates doivent être approuvés par WhatsApp

---

## ✅ Checklist

- [ ] Template créé dans Twilio Content
- [ ] Variables définies (1 à 10)
- [ ] Template soumis pour approbation
- [ ] Content SID noté (HX...)
- [ ] Content SID ajouté dans `backend/.env`
- [ ] Code backend modifié pour utiliser le template
- [ ] Fonction `formatItemsList` créée
- [ ] Template approuvé par WhatsApp
- [ ] Test effectué avec succès

---

## 🆘 Besoin d'Aide ?

Si vous avez des questions sur la création du template :
1. Consultez la documentation Twilio : [twilio.com/docs/content](https://www.twilio.com/docs/content)
2. Vérifiez les exemples de templates dans Twilio Dashboard
3. Contactez le support Twilio si nécessaire

---

**Note** : Pendant l'attente de l'approbation (1-3 jours), vous pouvez continuer à utiliser le Sandbox avec des messages libres si le numéro a initié une conversation dans les 24h.
