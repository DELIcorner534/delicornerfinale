# Template Meta pour recevoir les commandes WhatsApp

## Pourquoi un template ?

Meta n’envoie les **messages texte libres** que dans les **24 h** suivant le dernier message du **client**.  
Les notifications de commande partent **sans** que le client ait écrit au préalable → **sans template, vous ne recevez rien**.

En envoyant d’abord un **template approuvé**, on ouvre la conversation ; le détail de la commande part juste après en message texte.

---

## Option 1 : Test rapide avec `hello_world`

1. **WhatsApp Manager** : [business.facebook.com/wa/manage](https://business.facebook.com/wa/manage) → **Message Templates** → **Create Template**.
2. Choisir **Browse Templates** → rechercher **hello_world**.
3. Créer le template (nom = `hello_world`, langue = **English (US)** ou **Dutch**).
4. Soumettre. Il est souvent **déjà approuvé** (template standard).

**Variables d’environnement** (backend + Render) :

```
META_TEMPLATE_NAME=hello_world
META_TEMPLATE_LANGUAGE=en_US
```

Vous recevrez d’abord « Hello World » (ou équivalent), puis le détail complet de la commande.

---

## Option 2 : Template « Order confirmation » `order_management_1` (Utility > Order management)

Template de la **bibliothèque** Meta (Order management → Order confirmation).

1. **Message Templates** → **Create Template** → **Browse Templates**.
2. **Order management** → **Order confirmation** → choisir le template (ex. « order_management_1 »).
3. **Name your template** : `order_management_1` (exactement, pour que le backend le reconnaisse).
4. **Language** : **English (US)** (ou **Dutch (Belgium)** → alors `META_TEMPLATE_LANGUAGE=nl_BE`).
5. Bouton « View order details » : **Static** → `https://delicornerhalle.be` (ou ton URL).
6. **Submit** et attendre l’approbation.

Le backend envoie : **nom client** ({{1}}), **"order"** ({{2}}), **numéro de commande** ({{3}}), **"order"** ({{4}}), **date livraison** ({{5}}).

**Variables d’environnement** (Render) :

```
META_TEMPLATE_NAME=order_management_1
META_TEMPLATE_LANGUAGE=en_US
```

---

## Option 2b : Template « Order confirmation » `order_confirmation`

Même idée, autre variante. **Name your template** : `order_confirmation`.  
Le backend envoie : nom, numéro, date.

```
META_TEMPLATE_NAME=order_confirmation
META_TEMPLATE_LANGUAGE=en_US
```

---

## Option 3 : Template « commande » `delicorner_order` (personnalisé)

1. **Message Templates** → **Create Template**.
2. **Create your own** (pas la bibliothèque).
3. Renseigner :
   - **Name** : `delicorner_order`
   - **Category** : Utility
   - **Language** : Dutch (Belgium) ou English (US)
   - **Body** :

```
Nieuwe bestelling Delicorner

Bestelling #{{1}}
Klant: {{2}}
Totaal: €{{3}}
```

4. Exemples pour les variables : `0001`, `Jan Janssen`, `12,50`.
5. **Submit** et attendre l’approbation (souvent 24–48 h).

**Variables d’environnement** :

```
META_TEMPLATE_NAME=delicorner_order
META_TEMPLATE_LANGUAGE=nl_BE
```

---

## Option 4 : Template « commande complète » `delicorner_order_full`

Inclut **école, classe, téléphone** et **liste des articles**.

**Name** : `delicorner_order_full`  
**Category** : Utility  
**Language** : Dutch (Belgium)

**Body** :

```
🍽️ Nieuwe bestelling Delicorner

Bestelling #{{1}}
Klant: {{2}}
Telefoon: {{3}}
School: {{4}}
Klas: {{5}}

Totaal: €{{6}}

Artikelen:
{{7}}

Wij nemen contact op bij vragen.
```

**Variables d’environnement** :

```
META_TEMPLATE_NAME=delicorner_order_full
META_TEMPLATE_LANGUAGE=nl_BE
```

---

## Où configurer ?

- **En local** : `backend/.env`
- **Sur Render** : Service **delicorner-whatsapp** → **Environment** → ajouter ou modifier :
  - `META_TEMPLATE_NAME`
  - `META_TEMPLATE_LANGUAGE`

Puis **Manual Deploy** → **Clear build cache & deploy**.

---

## Vérifications

1. **Numéro de test** : le numéro qui reçoit les commandes (+32 451 03 23 56) doit être ajouté dans **Meta** → **WhatsApp** → **API Setup** → **To** (numéros de test).
2. **Logs Render** : après une commande, vous devez voir « Template envoyé » puis « Message WhatsApp envoyé via Meta ».
3. Si vous ne recevez toujours rien : vérifier **DEPANNAGE_COMMANDES_WHATSAPP.md** (file://, variables, curl, etc.).

---

## Récapitulatif

| Template            | Usage        | Langue recommandée |
|---------------------|-------------|--------------------|
| `hello_world`       | Test rapide | `en_US`            |
| `order_confirmation`| Commandes (bibliothèque) | `en_US` |
| `delicorner_order`  | Commandes (personnalisé) | `nl_BE`            |

Sans `META_TEMPLATE_NAME`, les messages **ne sont pas livrés**. Utilisez `order_confirmation` si vous l’avez créé depuis la bibliothèque.
