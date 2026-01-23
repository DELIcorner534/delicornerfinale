# 📱 Template WhatsApp pour les Commandes Delicorner

## 🎯 Objectif

Créer un template de message WhatsApp pré-approuvé pour envoyer automatiquement les commandes via Twilio.

---

## 📋 Template Proposé

### Nom du Template
`delicorner_nouvelle_commande`

### Catégorie
**UTILITY** (Messages transactionnels/utilitaires)

### Langue
**Français (fr)** ou **Néerlandais (nl)**

### Corps du Message

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

### Variables du Template

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{1}}` | Numéro de commande | 0001 |
| `{{2}}` | Date et heure | 23/01/2026 20:52 |
| `{{3}}` | Nom du client | Jean Dupont |
| `{{4}}` | Classe | 3A |
| `{{5}}` | École | Heilig Hart |
| `{{6}}` | Téléphone | 0488123456 |
| `{{7}}` | Liste des articles | 1. Hamburger x2 (Sauce: andalouse)\n   Prix: €9,00 |
| `{{8}}` | Total | 9,00 |
| `{{9}}` | Méthode de paiement | Bancontact |
| `{{10}}` | Code de vérification | A3F9B2C1 |

---

## 🔧 Création du Template dans Twilio

### Étape 1 : Accéder à Content Templates

1. **Dans le Dashboard Twilio**, allez dans **"Messaging"** > **"Content"**
2. **Cliquez sur** "Create Template" ou "Nouveau template"

### Étape 2 : Remplir les Informations

1. **Nom du template** : `delicorner_nouvelle_commande`
2. **Catégorie** : Sélectionnez **"UTILITY"**
3. **Langue** : Sélectionnez **"Français (fr)"** ou **"Néerlandais (nl)"**
4. **Type de contenu** : Sélectionnez **"Text"**

### Étape 3 : Rédiger le Message

**Copiez-collez** le corps du message ci-dessus dans l'éditeur.

**Important** : Remplacez les variables `{{1}}`, `{{2}}`, etc. par les variables Twilio :
- `{{1}}` → `{{1}}` (Twilio utilise la même syntaxe)
- `{{2}}` → `{{2}}`
- etc.

### Étape 4 : Ajouter les Variables

Twilio vous demandera de définir les variables. Pour chaque variable :

1. **Nom** : `order_number`, `date_time`, `client_name`, etc.
2. **Type** : `TEXT` (pour toutes les variables)
3. **Exemple** : Donnez un exemple de valeur

### Étape 5 : Soumettre pour Approbation

1. **Vérifiez** que tout est correct
2. **Cliquez sur** "Submit for Approval" ou "Soumettre pour approbation"
3. **Attendez l'approbation** (peut prendre plusieurs jours)

---

## 💻 Modification du Code Backend

Une fois le template approuvé, modifiez `backend/server.js` pour utiliser le template :

```javascript
// Envoyer le message WhatsApp via Twilio avec template
const result = await client.messages.create({
    from: twilioWhatsAppNumber,
    to: formattedTo,
    contentSid: 'HX...', // Content SID du template approuvé
    contentVariables: JSON.stringify({
        '1': orderNumber,           // {{1}}
        '2': new Date().toLocaleString('fr-BE'), // {{2}}
        '3': orderData.delivery.name, // {{3}}
        '4': orderData.delivery.class || 'N/A', // {{4}}
        '5': orderData.delivery.school || 'N/A', // {{5}}
        '6': orderData.delivery.phone, // {{6}}
        '7': formatItemsList(orderData.items), // {{7}}
        '8': orderData.total, // {{8}}
        '9': orderData.payment_method || 'Bancontact', // {{9}}
        '10': verificationCode // {{10}}
    })
});
```

---

## 📝 Format de la Liste des Articles

Créez une fonction pour formater la liste des articles :

```javascript
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
```

---

## ⚠️ Limitations des Templates

1. **Approbation requise** : Les templates doivent être approuvés par WhatsApp (peut prendre plusieurs jours)
2. **Pas de modification** : Une fois approuvé, vous ne pouvez pas modifier le template
3. **Variables limitées** : Maximum 10 variables par template
4. **Format strict** : Le format doit respecter les règles WhatsApp

---

## 🚀 Alternative : Template Simplifié

Si vous voulez un template plus simple avec moins de variables :

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
- `{{1}}` : Numéro de commande
- `{{2}}` : Date/heure
- `{{3}}` : Nom du client
- `{{4}}` : Téléphone
- `{{5}}` : Liste des articles (formatée)
- `{{6}}` : Total
- `{{7}}` : Code de vérification

---

## 📚 Ressources

- **Documentation Twilio Content Templates** : [twilio.com/docs/content](https://www.twilio.com/docs/content)
- **Guide WhatsApp Templates** : [twilio.com/docs/whatsapp/templates](https://www.twilio.com/docs/whatsapp/templates)
- **Règles de formatage** : [developers.facebook.com/docs/whatsapp/message-templates](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## ✅ Checklist

- [ ] Template créé dans Twilio Content
- [ ] Variables définies correctement
- [ ] Template soumis pour approbation
- [ ] Template approuvé par WhatsApp
- [ ] Code backend modifié pour utiliser le template
- [ ] Content SID récupéré et ajouté au code
- [ ] Test effectué avec succès

---

**Note** : Pendant l'attente de l'approbation du template, vous pouvez continuer à utiliser le Sandbox avec des messages libres (si le numéro a initié une conversation dans les 24h).
