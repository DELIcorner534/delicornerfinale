# 📋 Variables du Template WhatsApp - Delicorner

## 🎯 Variables à Créer dans Twilio

Lors de la création du template dans Twilio, vous devrez définir ces 10 variables :

---

## 📝 Liste des Variables

### Variable 1 : Numéro de Commande
- **Nom** : `order_number`
- **Type** : `TEXT`
- **Exemple** : `0001`
- **Description** : Numéro séquentiel de la commande (0001, 0002, etc.)

---

### Variable 2 : Date et Heure
- **Nom** : `date_time`
- **Type** : `TEXT`
- **Exemple** : `23/01/2026 20:52`
- **Description** : Date et heure de la commande au format DD/MM/YYYY HH:MM

---

### Variable 3 : Nom du Client
- **Nom** : `client_name`
- **Type** : `TEXT`
- **Exemple** : `Jean Dupont`
- **Description** : Nom complet du client

---

### Variable 4 : Classe
- **Nom** : `client_class`
- **Type** : `TEXT`
- **Exemple** : `3A`
- **Description** : Classe de l'élève (peut être vide si non applicable)

---

### Variable 5 : École
- **Nom** : `client_school`
- **Type** : `TEXT`
- **Exemple** : `Heilig Hart`
- **Description** : Nom de l'école (Heilig Hart ou College Halle)

---

### Variable 6 : Téléphone
- **Nom** : `client_phone`
- **Type** : `TEXT`
- **Exemple** : `0488123456`
- **Description** : Numéro de téléphone du client

---

### Variable 7 : Liste des Articles
- **Nom** : `items_list`
- **Type** : `TEXT`
- **Exemple** : 
```
1. Hamburger x2 (Alle groenten, Wortel)
   Prix: €9,00
2. Panini Hesp Kaas x1 [Andalouse]
   Prix: €4,50
```
- **Description** : Liste formatée de tous les articles commandés avec options et sauces

---

### Variable 8 : Total
- **Nom** : `total_price`
- **Type** : `TEXT`
- **Exemple** : `9,00`
- **Description** : Montant total de la commande en euros (format: X,XX)

---

### Variable 9 : Méthode de Paiement
- **Nom** : `payment_method`
- **Type** : `TEXT`
- **Exemple** : `Bancontact`
- **Description** : Méthode de paiement utilisée

---

### Variable 10 : Code de Vérification
- **Nom** : `verification_code`
- **Type** : `TEXT`
- **Exemple** : `A3F9B2C1`
- **Description** : Code de vérification unique pour sécuriser la commande

---

## 📋 Tableau Récapitulatif

| # | Nom Variable | Type | Exemple | Utilisation dans Template |
|---|--------------|------|---------|---------------------------|
| 1 | `order_number` | TEXT | `0001` | `{{1}}` |
| 2 | `date_time` | TEXT | `23/01/2026 20:52` | `{{2}}` |
| 3 | `client_name` | TEXT | `Jean Dupont` | `{{3}}` |
| 4 | `client_class` | TEXT | `3A` | `{{4}}` |
| 5 | `client_school` | TEXT | `Heilig Hart` | `{{5}}` |
| 6 | `client_phone` | TEXT | `0488123456` | `{{6}}` |
| 7 | `items_list` | TEXT | `1. Hamburger x2...` | `{{7}}` |
| 8 | `total_price` | TEXT | `9,00` | `{{8}}` |
| 9 | `payment_method` | TEXT | `Bancontact` | `{{9}}` |
| 10 | `verification_code` | TEXT | `A3F9B2C1` | `{{10}}` |

---

## 🔧 Comment Remplir dans Twilio

Quand vous créez le template dans Twilio :

1. **Pour chaque variable**, Twilio vous demandera :
   - **Variable Name** : Utilisez les noms ci-dessus (ex: `order_number`)
   - **Type** : Sélectionnez **"TEXT"** pour toutes
   - **Example** : Utilisez les exemples ci-dessus

2. **Ordre important** : Les variables doivent être dans l'ordre (1, 2, 3, ... 10)

3. **Format** : Utilisez exactement `{{1}}`, `{{2}}`, etc. dans le corps du message

---

## 💻 Correspondance avec le Code

Dans le code backend, les variables seront mappées ainsi :

```javascript
contentVariables: JSON.stringify({
    '1': orderNumber,                    // Variable 1: order_number
    '2': dateTime,                       // Variable 2: date_time
    '3': orderData.delivery.name,        // Variable 3: client_name
    '4': orderData.delivery.class,       // Variable 4: client_class
    '5': orderData.delivery.school,      // Variable 5: client_school
    '6': orderData.delivery.phone,       // Variable 6: client_phone
    '7': formatItemsList(items),         // Variable 7: items_list
    '8': totalPrice,                     // Variable 8: total_price
    '9': paymentMethod,                  // Variable 9: payment_method
    '10': verificationCode               // Variable 10: verification_code
})
```

---

## ✅ Checklist de Création

Quand vous créez le template dans Twilio, vérifiez que :

- [ ] Les 10 variables sont créées dans l'ordre (1 à 10)
- [ ] Chaque variable a un nom descriptif
- [ ] Toutes les variables sont de type TEXT
- [ ] Chaque variable a un exemple de valeur
- [ ] Le template utilise `{{1}}` à `{{10}}` dans le bon ordre
- [ ] Le template est soumis pour approbation

---

**Note** : Les noms des variables (`order_number`, `date_time`, etc.) sont juste pour votre référence dans Twilio. Ce qui compte vraiment, c'est l'ordre des variables (`{{1}}`, `{{2}}`, etc.) dans le template.
