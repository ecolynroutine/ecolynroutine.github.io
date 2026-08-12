# ECOLYN — plateforme de conseils skincare

Le projet ECOLYN est organisé en deux univers :

- `/` : plateforme éditoriale de conseils gratuits, bilingue FR/AR ;
- `/pack/` : ancienne landing page commerciale conservée et adaptée.

La homepage est un parcours de découverte mobile-first : la visiteuse choisit
son profil de peau, sa préoccupation et, si elle le souhaite, un sujet de mode
de vie. Un mini-feed réordonne ensuite les contenus sans envoyer ces choix au
backend. Chaque contenu conserve une source médicale ou scientifique visible
derrière « Pourquoi ? / علاش؟ ».

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

Le résultat de production doit être servi par GitHub Pages ou par `pnpm run
preview`. Ne pas ouvrir `dist/index.html` par double-clic : les modules web
modernes peuvent être bloqués en `file://`, ce qui donnerait une page blanche.

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

La configuration publique du backend se trouve dans `public/config.js`. Les
informations éditoriales partagées par la plateforme et `/pack/` (URLs, rôle de
la conseillère, médias CDN et prix) ont une seule source : `site-config.json`.

```js
window.ECOLYN_CONFIG = {
  leadEndpoint: "",
  whatsappNumber: "212699072913",
  whatsappGroupUrl: "",
  responseDelay: "Réponse dès que possible",
  responseDelayAr: "الجواب في أقرب وقت ممكن",
  metaPixelId: "",
  tiktokPixelId: "",
  ga4MeasurementId: "",
  siteUrl: ""
};
```

Les mêmes valeurs peuvent être fournies au build via `.env` en copiant `.env.example`.

## Collecte des prospects

Le mode normal utilise Supabase avec la clé publique du navigateur. Le visiteur
peut uniquement insérer une demande ; les règles RLS interdisent la lecture, la
modification et la suppression anonymes. Les réponses du formulaire court, les
consentements, la langue, la source, les UTM et la photo facultative compressée
sont enregistrés dans la table privée `prospects`.

Après un enregistrement réussi, le site ouvre `/merci` avec une référence liée
à la session. Un accès direct à `/merci` ne simule jamais une demande reçue.

`leadEndpoint` et le mode WhatsApp restent des solutions de secours uniquement.
Ne jamais placer de clé `service_role` ou d’autre secret dans le navigateur.

## Ajouter un contenu de découverte

Les cartes du mini-feed se trouvent dans `src/data/discovery.ts`. Chaque carte
contient ses profils, préoccupations et contextes associés, son explication
FR/AR, un geste, une erreur, le moment où demander un avis et les champs
`sourceTitle`, `sourceUrl` et `sourceType`.

Les contenus grossesse/allaitement, pilosité faciale, alimentation, sommeil et
stress doivent rester prudents : ne jamais transformer une association en
diagnostic ou en promesse.

## Articles historiques

Dupliquer une entrée dans `src/data/articles/index.ts`. Chaque article contient :

- titre et résumé FR/AR ;
- introduction et explication ;
- erreurs fréquentes ;
- gestes utiles ;
- point à surveiller ;
- moment où demander un avis professionnel.

Le drawer éditorial et la bibliothèque se mettent à jour automatiquement.

## Médias, témoignages et avant/après

Les médias officiels sont déclarés dans `site-config.json` et chargés directement
depuis le CDN ECOLYN. Ils ne sont pas dupliqués dans `public/`.

Les six témoignages conservent leurs photos et audios originaux. Les histoires
s’ouvrent dans un drawer sans autoplay. Aucun problème, résultat ou détail
biographique ne doit être inventé : les futurs champs écrits ne seront affichés
qu’après validation de leur transcription.

Le comparateur avant/après tactile et clavier est conservé avec son avertissement
clair : une expérience individuelle n’est ni une preuve clinique, ni une garantie.

## Modifier WhatsApp

- Numéro de contact : `whatsappNumber` dans `public/config.js` ;
- groupe communautaire : `whatsappGroupUrl`.

Le groupe est proposé discrètement sur la homepage et plus visiblement après une
demande confirmée sur `/merci`.

## Trackings

Meta Pixel, TikTok Pixel et GA4 sont activés séparément depuis `/admin`. Le site
charge uniquement les scripts dont l’identifiant est renseigné et activé. Le
même onglet contient maintenant un diagnostic de chargement et un bouton pour
envoyer un événement de test.

La couche `dataLayer` reçoit notamment : `page_view`, `view_content`,
`article_open`, `article_complete`, `audio_start`, `audio_25`, `audio_50`,
`audio_75`, `audio_complete`, `before_after_interaction`, `form_start`,
`form_step_complete`, `form_submit`, `generate_lead`, `whatsapp_click`,
`pack_view`, `pack_cta_click`, `initiate_checkout`, `order_submit`,
`select_skin_profile`, `select_skin_concern`, `select_lifestyle_topic`,
`content_open`, `content_complete`, `story_open`, `story_audio_play` et
`join_whatsapp_group`.

Les noms, téléphones, e-mails, photos, références et textes libres sont filtrés
avant tout envoi vers `dataLayer`, Meta, TikTok ou GA4.

La fonction Supabase `meta-capi` complète le Pixel pour les leads consentis. Le
jeton Meta reste dans les secrets Supabase et les coordonnées sont hachées côté
serveur avant l’envoi. Les quelques actions manuelles sont détaillées dans
[`docs/META_CAPI_SUPABASE.md`](docs/META_CAPI_SUPABASE.md).

## Déploiement GitHub Pages

1. pousser le projet sur la branche `main` ;
2. ouvrir **Settings → Pages** et sélectionner **GitHub Actions** ;
3. adapter ou supprimer `public/CNAME` si le domaine change ;
4. lancer le workflow `Deploy ECOLYN to GitHub Pages`.

Le `base` relatif, la route statique `/pack/`, `404.html` et `CNAME` sont déjà configurés.

Le guide pas à pas pour la mise en production sur `ecolyn.ma` se trouve dans
[`docs/MISE_EN_LIGNE_ECOLYN_MA.md`](docs/MISE_EN_LIGNE_ECOLYN_MA.md).

## Confidentialité

La photo est facultative. Le consentement de contact et le consentement marketing sont séparés. Aucune photo ne doit être publiée ou réutilisée en publicité sans autorisation explicite distincte.
