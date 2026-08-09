# Mettre ECOLYN en ligne sur `ecolyn.ma`

> État vérifié le 9 août 2026 : les quatre entrées `A` et le `CNAME www`
> pointent déjà correctement vers GitHub Pages. Si `ecolyn.ma` affiche encore
> l’ancienne version, ne touchez plus aux DNS : terminez seulement l’étape 9.

Ce guide contient uniquement les actions qui doivent être faites dans les
comptes du propriétaire. Ne partagez jamais vos mots de passe, une clé
`service_role`, une clé `secret` ou le mot de passe de la base de données.

## Étape 1 — Installer la base Supabase

1. Ouvrez le projet Supabase.
2. Dans la colonne de gauche, cliquez sur **SQL Editor**.
3. Cliquez sur **New query**.
4. Ouvrez le fichier `supabase/schema.sql` livré avec le projet.
5. Copiez tout son contenu.
6. Collez-le dans Supabase.
7. Cliquez sur **Run**.
8. Attendez le message de réussite.

Le script crée les prospects, les réglages de tracking, les réglages du live,
le rôle administrateur et toutes les protections RLS.

## Étape 2 — Créer le compte administrateur

1. Dans Supabase, cliquez sur **Authentication**.
2. Cliquez sur **Users**.
3. Cliquez sur **Add user**, puis **Create new user**.
4. Entrez `ecolyn@proton.me`.
5. Choisissez vous-même un mot de passe fort. Ne le transmettez à personne.
6. Activez la confirmation automatique si Supabase propose cette option.
7. Revenez dans **SQL Editor**.
8. Créez une nouvelle requête.
9. Collez puis exécutez :

```sql
select private.grant_admin_by_email('ecolyn@proton.me');
```

## Étape 3 — Empêcher les inscriptions publiques

1. Ouvrez **Authentication → Providers → Email**.
2. Désactivez **Allow new users to sign up**.
3. Enregistrez.

## Étape 4 — Autoriser les bonnes adresses

Dans Supabase, ouvrez **Authentication → URL Configuration**.

Dans **Site URL**, mettez :

```text
https://ecolyn.ma/
```

Dans **Redirect URLs**, ajoutez :

```text
https://ecolyn.ma/**
https://www.ecolyn.ma/**
https://ecolynroutine.github.io/**
```

## Étape 5 — Autoriser Codex à publier sur GitHub

Le dépôt existe déjà, mais la connexion actuelle ne possède pas encore le droit
d'écriture.

1. Installez **GitHub CLI** depuis `https://cli.github.com/`.
2. Ouvrez PowerShell.
3. Tapez `gh auth login`.
4. Choisissez **GitHub.com**.
5. Choisissez **HTTPS**.
6. Choisissez **Login with a web browser**.
7. Copiez le code affiché, validez-le dans la page GitHub et revenez dans Codex.

Ne transmettez ni mot de passe ni jeton. Dites seulement : « GitHub CLI est
connecté ».

## Étape 6 — Aucune variable GitHub à ajouter

Les valeurs publiques Supabase, l'adresse `ecolyn.ma` et le numéro WhatsApp sont
déjà configurés dans le projet. Vous n'avez rien à copier dans les secrets
GitHub.

La clé utilisée commence par `sb_publishable_`. C'est une clé publique prévue
pour les sites web. Les données restent protégées par les règles RLS installées
à l'étape 1. Aucune clé `secret` ou `service_role` n'est présente dans le dépôt.

## Étape 7 — Activer GitHub Pages

1. Dans le dépôt, ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **GitHub Actions**.
3. Attendez que l'action **Deploy ECOLYN to GitHub Pages** devienne verte.

Le site temporaire sera alors disponible sur :

```text
https://ecolynroutine.github.io/
```

## Étape 8 — Relier `ecolyn.ma` chez Cap Connect

Dans l'espace client Cap Connect :

1. Cliquez sur **Domaines**.
2. Ouvrez `ecolyn.ma`.
3. Cliquez sur **Gestion de la zone DNS**.
4. Supprimez seulement les anciens enregistrements `A` ou `AAAA` de `@` qui
   pointent vers un ancien site. Ne supprimez pas les entrées `MX` si vous avez
   une messagerie.
5. Ajoutez les cinq lignes suivantes avec un TTL de `3600`.

| Type | Nom d'hôte | Adresse / valeur |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | ecolynroutine.github.io |

N'ajoutez pas d'enregistrement DNS avec le caractère `*`.

## Étape 9 — Déclarer le domaine dans GitHub

1. Ouvrez le dépôt GitHub.
2. Cliquez sur **Settings → Pages**.
3. Dans **Custom domain**, écrivez `ecolyn.ma`.
4. Cliquez sur **Save**.
5. Lorsque l'option devient disponible, cochez **Enforce HTTPS**.

La propagation peut prendre plusieurs heures. Pendant ce temps, ne changez pas
les valeurs DNS.

## Étape 10 — Vérification finale

1. Ouvrez `https://ecolyn.ma`.
2. Envoyez un formulaire test.
3. Vérifiez la redirection vers `/merci`.
4. Ouvrez `https://ecolyn.ma/admin/login`.
5. Connectez-vous avec `ecolyn@proton.me`.
6. Vérifiez le prospect, changez son statut et exportez le CSV.
7. Programmez un live test.
8. Cliquez sur **Me prévenir** depuis un téléphone.
9. Vérifiez que l'événement proposé contient bien le rappel.
