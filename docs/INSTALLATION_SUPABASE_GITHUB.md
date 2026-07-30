# Installation ECOLYN — uniquement les actions manuelles

Tout le code, les règles de sécurité, l’administration et le déploiement sont
déjà préparés. Les étapes ci-dessous sont les seules qui exigent le propriétaire
des comptes.

## 1. Créer le projet Supabase

1. Ouvrir [supabase.com/dashboard](https://supabase.com/dashboard).
2. Cliquer sur **New project**.
3. Choisir l’organisation, un nom comme `ecolyn-production`, une région proche
   du Maroc et un mot de passe de base de données fort.
4. Attendre que le projet soit prêt.

Le mot de passe de base de données ne doit être placé ni dans le site ni dans
GitHub.

## 2. Installer la base et toute la sécurité

1. Dans Supabase, ouvrir **SQL Editor**.
2. Cliquer sur **New query**.
3. Copier tout le contenu de [`supabase/schema.sql`](../supabase/schema.sql).
4. Cliquer sur **Run**.

Ce script réalise en une seule opération :

- les tables `prospects`, `tracking_settings` et `admin_users` ;
- les index et validations ;
- la liste des statuts ;
- toutes les politiques RLS ;
- l’interdiction de lire les prospects anonymement ;
- l’autorisation d’insertion anonyme uniquement ;
- la protection administrateur ;
- les fonctions sécurisées d’attribution du rôle.

## 3. Créer le premier administrateur

1. Ouvrir **Authentication → Users**.
2. Cliquer sur **Add user** puis **Create new user**.
3. Saisir votre adresse e-mail et un mot de passe fort.
4. Activer la confirmation automatique de cet utilisateur si cette option est
   proposée.
5. Revenir dans **SQL Editor**, créer une nouvelle requête et exécuter :

```sql
select private.grant_admin_by_email('VOTRE_ADRESSE_EMAIL');
```

Remplacer uniquement l’adresse entre les apostrophes.

Pour retirer ultérieurement le rôle :

```sql
select private.revoke_admin_by_email('ADRESSE_EMAIL');
```

Ces fonctions ne sont pas accessibles depuis le navigateur.

## 4. Bloquer les inscriptions publiques

Après la création du compte administrateur :

1. Ouvrir **Authentication → Providers → Email**.
2. Désactiver l’option permettant aux visiteurs de créer eux-mêmes un compte
   (`Allow new users to sign up` ou libellé équivalent).
3. Enregistrer.

Le site ne contient déjà aucune page d’inscription. Cette option ajoute une
protection supplémentaire au niveau de Supabase Auth.

## 5. Récupérer les deux valeurs publiques

Dans **Project Settings → API Keys** — parfois affiché sous **Data API** :

1. copier **Project URL** ;
2. copier la clé publique **anon** ou **publishable**.

Elles correspondent à :

```dotenv
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

La clé publique `anon` est conçue pour être utilisée dans un navigateur. Sa
sécurité dépend des politiques RLS déjà installées. Ne jamais copier la clé
`service_role`, `secret` ou une clé de base de données dans le projet.

## 6. Créer le dépôt GitHub

1. Ouvrir [github.com/new](https://github.com/new).
2. Créer un dépôt vide, par exemple `ecolyn-site`.
3. Ne pas ajouter de README, de licence ou de `.gitignore`.
4. Transmettre uniquement l’URL du dépôt pour que le projet puisse y être
   envoyé.

## 7. Ajouter les deux variables GitHub

Dans le dépôt : **Settings → Secrets and variables → Actions → Secrets**.

Créer exactement :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Dans l’onglet **Variables**, les valeurs facultatives disponibles sont :

- `VITE_SITE_URL`
- `VITE_WHATSAPP_NUMBER`
- `VITE_WHATSAPP_GROUP_URL`

Les identifiants Meta, TikTok et GA4 ne sont pas stockés dans GitHub : ils se
gèrent directement depuis `/admin`.

## 8. Activer GitHub Pages

1. Ouvrir **Settings → Pages**.
2. Dans **Build and deployment**, choisir **GitHub Actions**.
3. Envoyer une modification sur `main` ou lancer manuellement le workflow
   **Deploy ECOLYN to GitHub Pages**.

Le workflow compile le site, injecte uniquement les deux valeurs publiques et
publie le dossier `dist`.

## 9. Régler les URL Supabase Auth

Quand l’adresse GitHub Pages définitive est connue :

1. ouvrir **Supabase → Authentication → URL Configuration** ;
2. mettre l’adresse publique dans **Site URL** ;
3. ajouter la même origine suivie de `/**` dans **Redirect URLs**.

Exemples :

```text
https://votre-compte.github.io/ecolyn-site/
https://votre-compte.github.io/ecolyn-site/**
```

Avec un domaine personnalisé :

```text
https://www.votre-domaine.com/
https://www.votre-domaine.com/**
```

## Vérifications finales

Après configuration :

1. envoyer une demande test depuis le formulaire ;
2. vérifier la redirection vers `/merci` ;
3. se connecter sur `/admin/login` ;
4. vérifier le prospect et modifier son statut ;
5. exporter le CSV ;
6. enregistrer un pixel test désactivé, puis activé ;
7. confirmer qu’un visiteur non connecté ne peut lire aucune ligne de
   `prospects`.

La documentation officielle de référence est disponible dans les guides
[Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
et [Supabase Auth](https://supabase.com/docs/guides/auth).
