# ECOLYN — plateforme de conseils skincare

Refonte complète de l’ancien site commercial ECOLYN en deux univers :

- `/` : plateforme éditoriale de conseils gratuits, bilingue FR/AR ;
- `/pack/` : ancienne landing page commerciale conservée et adaptée.

## Démarrage

Prérequis : Node.js 22 et pnpm.

```bash
pnpm install
pnpm run dev
```

Build de production :

```bash
pnpm run build
```

Le résultat est généré dans `dist/`.

Le build est autonome : `dist/index.html` peut être ouvert directement par
double-clic, sans serveur local. Le lien « Routine ECOLYN » utilise alors
automatiquement `dist/pack/index.html`.

## Backend Supabase et administration

Le projet inclut maintenant :

- l’enregistrement sécurisé des prospects et des commandes `/pack` ;
- Supabase Auth sur `/admin/login` ;
- l’espace protégé `/admin` ;
- la recherche, les filtres, les statuts, les notes et l’export CSV ;
- la programmation bilingue du prochain live et son rappel calendrier ;
- la configuration dynamique Meta Pixel, TikTok Pixel et GA4 ;
- la page `/merci` ;
- les politiques RLS complètes dans `supabase/schema.sql`.

L’onglet **Live** de l’administration permet de régler la date, les textes,
la plateforme et le lien du prochain rendez-vous. Une fois publié, le bouton
« Me prévenir » ajoute un événement au calendrier avec un rappel 30 minutes
avant ; Google Agenda est également proposé.

Le guide le plus court pour le propriétaire des comptes est :
[`docs/INSTALLATION_SUPABASE_GITHUB.md`](docs/INSTALLATION_SUPABASE_GITHUB.md).

Variables obligatoires :

```dotenv
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-anon
```

La clé `service_role` ne doit jamais être ajoutée au frontend, à un fichier
`.env` de production ou à GitHub.

## Configuration

La configuration publique modifiable sans recompiler se trouve dans `public/config.js`.

```js
window.ECOLYN_CONFIG = {
  leadEndpoint: "",
  whatsappNumber: "212699072913",
  whatsappGroupUrl: "",
  responseDelay: "24 à 48 heures",
  responseDelayAr: "24 حتى 48 ساعة",
  metaPixelId: "",
  ga4MeasurementId: "",
  siteUrl: ""
};
```

Les mêmes valeurs peuvent être fournies au build via `.env` en copiant `.env.example`.

## Collecte des leads

### Option recommandée : endpoint sécurisé

Renseigner `leadEndpoint` avec une URL HTTPS acceptant un `POST multipart/form-data`. Le formulaire envoie tous les champs, la catégorie choisie, les consentements, la photo facultative, la langue, la source, la date et une référence.

L’endpoint peut être :

- Supabase Edge Function ;
- Firebase Cloud Function ;
- Formspree ;
- Google Apps Script ;
- une API privée.

Ne jamais placer de clé secrète dans `config.js` ou dans le dépôt.

### Mode de secours

Sans endpoint, la demande est préparée dans WhatsApp avec un message prérempli. Une courte file locale reste sur l’appareil pour éviter une perte immédiate, mais elle ne remplace pas un stockage serveur. La photo n’est jamais stockée localement.

## Ajouter un article

Dupliquer une entrée dans `src/data/articles/index.ts`. Chaque article contient :

- titre et résumé FR/AR ;
- introduction et explication ;
- erreurs fréquentes ;
- gestes utiles ;
- point à surveiller ;
- moment où demander un avis professionnel.

Le drawer éditorial et la bibliothèque se mettent à jour automatiquement.

## Ajouter une vidéo

Modifier `src/data/videos/index.ts` :

1. placer la vidéo compressée dans `public/assets/videos/` ou utiliser une URL autorisée ;
2. renseigner `source`, `poster`, `duration` et `category` ;
3. passer `published` à `true` ;
4. ajouter des sous-titres WebVTT dans `public/assets/captions/`.

Dix emplacements sont déjà prévus. Aucun faux témoignage n’est publié.

## Ajouter un vrai avant/après

Conserver une autorisation séparée de l’utilisatrice. Documenter la durée, les habitudes, le contexte et la variabilité des résultats. Ne pas présenter une illustration comme une preuve.

## Modifier WhatsApp

- Numéro de contact : `whatsappNumber` dans `public/config.js` ;
- groupe communautaire : `whatsappGroupUrl`.

Le lien du groupe reste caché avant la soumission.

## Meta Pixel et GA4

Renseigner :

- `metaPixelId` ;
- `ga4MeasurementId`.

La couche `dataLayer` reçoit les événements :

- `page_view`, `select_skin_concern`, `article_open`, `video_start`,
  `case_study_view`, `form_start`, `form_step_complete`, `generate_lead`,
  `whatsapp_click`, `join_whatsapp_group`, `pack_view`, `pack_cta_click`.

Les équivalents Meta sont envoyés automatiquement lorsque le Pixel est configuré.

## Déploiement GitHub Pages

1. pousser le projet sur la branche `main` ;
2. ouvrir **Settings → Pages** et sélectionner **GitHub Actions** ;
3. adapter ou supprimer `public/CNAME` si le domaine change ;
4. lancer le workflow `Deploy ECOLYN to GitHub Pages`.

Le `base` relatif, la route statique `/pack/`, `404.html` et `CNAME` sont déjà configurés.

## Confidentialité

La photo est facultative. Le consentement de contact et le consentement marketing sont séparés. Aucune photo ne doit être publiée ou réutilisée en publicité sans autorisation explicite distincte.
