# Mode maintenance - Delicorner

## Page maintenance

Le fichier `maintenance.html` affiche un message de fermeture temporaire pour maintenance, en néerlandais.

**Message affiché :**
- 🔧 Tijdelijke sluiting voor onderhoud
- We brengen momenteel verbeteringen aan op onze website.
- Bestellingen zijn binnenkort weer mogelijk.
- Binnenkort weer open 💛

---

## Comment activer le mode maintenance

### Option 1 : Remplacer index.html (recommandé)

Sur ton serveur (FileZilla) :

1. Renomme `index.html` en `index-backup.html`
2. Renomme `maintenance.html` en `index.html`

Tous les visiteurs verront la page maintenance à la place de l'accueil.

### Option 2 : Redirection .htaccess

Ajoute au début de ton `.htaccess` (avant les autres règles) :

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/maintenance\.html$
RewriteCond %{REMOTE_ADDR} !^127\.0\.0\.1$
RewriteRule ^(.*)$ /maintenance.html [R=302,L]
```

Remplace le dernier paramètre par `[L]` (sans redirection visible) si tu préfères :

```apache
RewriteRule ^(.*)$ /maintenance.html [L]
```

### Option 3 : Lien direct

Tu peux mettre `maintenance.html` en page d'accueil temporaire en modifiant la configuration de ton hébergeur (document racine / index par défaut).

---

## Comment désactiver le mode maintenance

### Si Option 1 utilisée :

1. Supprime (ou renomme) `index.html` (qui est en fait la page maintenance)
2. Renomme `index-backup.html` en `index.html`

### Si Option 2 utilisée :

Supprime ou commente les lignes RewriteRule du `.htaccess`.

---

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `maintenance.html` | Page affichée pendant la maintenance |
| `MAINTENANCE.md` | Ce guide d'utilisation |
