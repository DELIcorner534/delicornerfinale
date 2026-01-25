# Checklist – Infos à demander au client (Delicorner)

À envoyer au propriétaire de la sandwicherie pour **Meta (WhatsApp)** et **Mollie (Bancontact)**.

---

## 1. Vérification Meta (WhatsApp Business)

Pour que Meta **vérifie l’entreprise** et livre les messages WhatsApp, il faut fournir des infos et parfois des pièces. Voici ce que **tu dois demander au client** :

### 1.1 Infos sur l’entreprise

| À demander | Exemple | Remarque |
|------------|---------|----------|
| **Nom légal de l’entreprise** | Delicorner, SARL Delicorner, etc. | Exactement comme sur les documents officiels |
| **Adresse légale complète** | Cypriaan Verhavertstraat 156, 1500 Halle, Belgique | Même adresse que sur le KBIS / statuts |
| **Site web** | https://delicornerhalle.be | Doit exister et mentionner l’entreprise |
| **Adresse e‑mail professionnelle** | contact@delicorner.be | De préférence @domaine du site |
| **Numéro de téléphone de l’entreprise** | 0488/153.993 | Celui affiché (boutique, pas perso) |
| **Pays** | Belgique | |
| **Secteur d’activité** | Restauration / Sandwicherie | Selon les choix Meta |

### 1.2 Documents / pièces (si Meta les demande)

| Document | À demander au client |
|----------|----------------------|
| **Pièce d’identité** | Carte d’identité ou passeport du **représentant légal** (propriétaire / gérant). Recto + verso, lisibles, en cours de validité. |
| **Preuve d’adresse** | Facture (électricité, eau, téléphone, impôts) ou extrait de banque de moins de 3 mois, au nom de l’entreprise ou du représentant, à l’adresse déclarée. |
| **Justificatif d’entreprise** | Extrait **KBO** (Belgique) ou équivalent (KBIS, statuts, etc.) montrant le nom, l’adresse et le représentant légal. |
| **Preuve du site web** | Capture d’écran ou PDF de la page d’accueil du site avec l’adresse et les coordonnées, si Meta le demande. |

### 1.3 Accès Meta / Facebook

| À demander | Utilité |
|------------|---------|
| **Compte Facebook** | Le client doit pouvoir se connecter à [developers.facebook.com](https://developers.facebook.com) et [business.facebook.com](https://business.facebook.com) avec **son** compte (ou celui de l’entreprise). |
| **Droits sur la Page Facebook** | Si une Page Facebook “Delicorner” existe, le client doit être admin ou avoir les droits nécessaires pour lier WhatsApp. |
| **Décision “qui soumet la vérification”** | C’est en général le **propriétaire / gérant** qui lance la vérification et reçoit les e‑mails de Meta. Tu dois savoir qui fera les étapes dans le Centre de sécurité. |

### 1.4 Résumé à envoyer au client (Meta)

*« Pour activer l’envoi des commandes par WhatsApp, Meta doit vérifier ton entreprise. Il me faut :*

1. *Nom légal de l’entreprise, adresse complète, site web, e‑mail pro, téléphone, pays, secteur.*  
2. *Si Meta le demande : pièce d’identité du gérant, preuve d’adresse récente, extrait KBO (ou équivalent).*  
3. *Tu dois avoir accès au compte Facebook/Meta utilisé pour WhatsApp et pouvoir aller dans le Centre de sécurité pour compléter la vérification.*  
4. *Dès que c’est validé, les messages commandes arriveront sur le numéro WhatsApp qu’on a configuré.»*

---

## 2. Mollie (Bancontact)

Pour **Mollie** (paiements Bancontact), tu as surtout besoin des **accès** et du **mode** (test vs production). Les infos “entreprise” sont remplies par le client dans son compte Mollie.

### 2.1 Création du compte Mollie (par le client)

| À demander | Utilité |
|------------|---------|
| **Création du compte Mollie** | Le client crée un compte sur [mollie.com](https://www.mollie.com) (ou [mollie.com/fr](https://www.mollie.com/fr)) avec l’e‑mail professionnel. |
| **Activation Bancontact** | Dans le tableau de bord Mollie, activer **Bancontact** (et éventuellement Cartes si besoin). |
| **Complétion du profil entreprise** | Mollie demandera nom, adresse, numéro de TVA belge, IBAN, etc. Le client remplit tout lui‑même. |

### 2.2 Clés API Mollie (à mettre sur Render)

| À demander | Où le client les trouve |
|------------|--------------------------|
| **Clé API Test** | Mollie → **Développeurs** → **Clés API** → Clé **Test** (ex. `test_xxxxxxxx`). Pour tester les paiements sans vrais prélèvements. |
| **Clé API Live** | Même menu, clé **Live** (ex. `live_xxxxxxxx`). À utiliser uniquement quand le site est en production et que tout est validé. |

Tu configures ces clés dans **Render** → **Environment** → `MOLLIE_API_KEY` (test pour dev, live pour prod).

### 2.3 URLs de redirection (déjà en place)

Tu utilises déjà :

- Succès : `https://delicornerhalle.be/payment-return.html`
- Échec : `https://delicornerhalle.be/payment-failure.html`

Pas besoin de les redemander au client, sauf si tu changes de domaine.

### 2.4 Résumé à envoyer au client (Mollie)

*« Pour les paiements Bancontact sur le site, j’utilise Mollie. Il me faut :*

1. *Que tu crées un compte sur mollie.com avec ton e‑mail pro.*  
2. *Que tu actives Bancontact dans Mollie et que tu complètes ton profil entreprise (adresse, TVA, IBAN, etc.).*  
3. *Ta **clé API Test** (pour mes tests) puis ta **clé API Live** (pour les vrais paiements) : Mollie → Développeurs → Clés API. Tu me les envoie de façon sécurisée (pas par e‑mail non chiffré si possible).*  
4. *Les paiements réels iront sur le compte bancaire que tu auras renseigné dans Mollie.»*

---

## 3. Récap – Par qui fait quoi

| Qui | Meta (WhatsApp) | Mollie |
|-----|------------------|--------|
| **Toi (développeur)** | Config technique (backend, templates, tokens), déploiement. Tu **demandes** les infos ci‑dessus. | Config technique (clés API, URLs). Tu **demandes** les clés Test / Live. |
| **Client (Delicorner)** | Fournit infos + docs, complète la **vérification entreprise** dans le Centre de sécurité Meta, gère son compte Meta/Facebook. | Crée le compte Mollie, remplit le profil, active Bancontact, te donne les **clés API** (Test puis Live). |

---

## 4. Modèle de message unique à envoyer au client

Tu peux t’en inspirer pour tout demander d’un coup :

---

*Salut,*

*Pour finaliser le site (paiements Bancontact + envoi des commandes sur WhatsApp), j’ai besoin des éléments suivants.*

### WhatsApp (Meta)

1. **Infos entreprise** : nom légal, adresse complète, site web, e‑mail pro, téléphone, pays, secteur (ex. sandwicherie).
2. **Vérification Meta** : tu devras aller dans le **Centre de sécurité** Meta (lien fourni par Meta / dans les alertes) pour **vérifier l’entreprise**. Si on te demande des pièces : pièce d’identité du gérant, preuve d’adresse récente, extrait KBO (ou équivalent).
3. **Accès** : tu dois pouvoir te connecter au compte Facebook/Meta utilisé pour WhatsApp et faire les étapes de vérification toi‑même.

### Mollie (Bancontact)

1. **Compte Mollie** : crée un compte sur mollie.com avec ton e‑mail pro, active **Bancontact**, et complète ton profil entreprise (adresse, TVA, IBAN, etc.).
2. **Clés API** : envoie‑moi ta **clé API Test** (Mollie → Développeurs → Clés API) pour que je puisse tester. Plus tard, on passera en **Live** pour les vrais paiements.

*Dis‑moi quand c’est fait ou si tu as des questions.*

---

Tu peux copier-coller ce bloc, l’adapter (nom du client, ton prénom), et l’envoyer par e‑mail ou WhatsApp.
