# Rapport de production ECOLYN

Date de vérification : 4 août 2026.

## Résultat

Le site existant a été amélioré sans remplacer sa direction artistique ni transformer l’accueil en boutique. L’accueil reste une plateforme bilingue de conseils gratuits et `/pack/` reste la page commerciale séparée.

## Principales améliorations

- Parcours mobile revu : contenus révélés plus tôt, carrousels guidés, swipe conservé, boutons tactiles, safe areas, drawers adaptés et absence de débordement horizontal.
- Version arabe complète avec RTL réel, navigation, formulaire, contenus, contrôles audio, métadonnées et messages traduits.
- Deux vraies photos de l’experte chargées depuis le CDN, sans nom, diplôme ni qualification inventés.
- Comparateur avant/après tactile et clavier avec cadrage stable, avertissement individuel et absence de promesse de résultat.
- Six cartes de témoignages audio associées aux personnes demandées, sans autoplay ni transcription inventée.
- Dix articles bilingues approfondis avec niveau de preuve, action prudente, erreur à éviter, indication de consultation et sources fiables.
- Huit chapitres « Nutrition et peau » avec exemples accessibles au Maroc et limites scientifiques explicites.
- Formulaire multistep réellement relié à Supabase, consentements séparés, protection contre les doubles soumissions et redirection authentique vers `/merci`.
- `/merci` reste neutre lors d’un accès direct et ne confirme une demande qu’après une soumission réussie.
- Administration séparée du bundle public : connexion, prospects, recherche, filtres, statut, CSV, live et pixels.
- Tracking conditionnel Meta, TikTok et GA4 ; aucun script n’est chargé quand les identifiants sont vides.
- Les données sensibles (nom, téléphone, e-mail, texte libre, photo et détail de peau) sont filtrées des événements publicitaires.
- `/pack/` conservée, bilingue et responsive ; son formulaire Supabase a été vérifié.
- SEO unifié sur `https://ecolyn.ma` : canonical, Open Graph, favicon, sitemap, robots et fallback GitHub Pages.

## Configuration centrale

Le fichier `site-config.json` contient l’URL officielle, les médias CDN, le rôle configurable de l’experte et le prix du pack. Le build génère `dist/site-config.js`, également lu par `/pack/`.

Prix conservé conformément à la valeur déjà validée dans le projet : 350 DH, ancien prix affiché 450 DH. L’incohérence historique 349/399 contre 350/450 n’a pas été réintroduite.

## Association des témoignages

| Personne | Photo | Audio |
|---|---|---|
| Imane | `Testimonial photo Imane.webp` | `1.mp3` |
| Amal | `Testimonial photo amal.webp` | `2.mp3` |
| Karima | `Testimonial photo karima.webp` | `3.mp3` |
| Khadija | `Testimonial photo khadija.webp` | `4.mp3` |
| Najat | `Testimonial photo najat.webp` | `5.mp3` |
| Sara | `Testimonial photo sara.webp` | `6.mp3` |

Le lecteur utilise `preload="none"`, arrête l’audio précédent, expose lecture/pause, progression, durée, volume, chargement, secours d’erreur, clavier et libellés ARIA traduits. Les événements 25 %, 50 %, 75 % et fin sont envoyés sans données personnelles.

## Données éditoriales et sources

- `src/data/articles/index.ts` : dix articles FR/AR structurés.
- `src/data/nutrition/index.ts` : huit chapitres FR/AR.
- `src/data/cases/index.ts` : cas pratiques localisés.
- `src/data/testimonials/index.ts` : six associations audio officielles.
- `src/data/site.ts` : accès typé à la configuration centrale.

Les sources intégrées proviennent notamment de l’American Academy of Dermatology, du NIH Office of Dietary Supplements et de publications PubMed sur les caroténoïdes, la lumière visible, l’acné, l’hydratation et l’absorption des nutriments.

## Vérifications effectuées

| Contrôle | Résultat |
|---|---|
| TypeScript | Réussi |
| Build Vite de production | Réussi |
| Accueil FR et AR | Réussi |
| Persistance FR/AR après rechargement | Réussi |
| RTL et métadonnées arabes | Réussi |
| Largeurs 360, 390, 412, 430, 768 et 1440 px | Aucun débordement horizontal |
| Comparateur avant/après | Slider et boutons vérifiés |
| Audio réel | Lecture, pause et état de secours vérifiés |
| Formulaire principal Supabase | Réussi — référence de test `ECO-E2ZE14-4QOR` |
| Formulaire `/pack/` Supabase | Réussi — référence de test `ECO-K2ZUGM` |
| Accès anonyme aux prospects | Bloqué par Supabase — HTTP 401 |
| Lecture publique des réglages de pixels | Réussie — HTTP 200 |
| Pixels vides | 0 script Meta, TikTok ou GA4 chargé |
| Accès direct à `/merci` | Message neutre, aucun faux succès |
| Accès direct à `/admin` | Redirection vers `/admin/login` |
| Console navigateur | Aucune erreur JavaScript observée |
| Ressources CDN | Toutes les images et 4 audios répondent HTTP 200 |

Le schéma `supabase/schema.sql` active et force RLS. Le rôle anonyme possède uniquement le droit d’insérer un prospect ; il ne possède aucun droit de lecture, modification ou suppression. Les mises à jour administratives exigent à la fois une session authentifiée et la présence dans `admin_users`.

## Point externe restant

Les URLs CDN exactes fournies pour `4.mp3` (Khadija) et `5.mp3` (Najat) répondent actuellement HTTP 404, y compris avec une requête GET partielle. Le site garde les associations exactes demandées et affiche proprement le message de secours traduit au clic. Le code ne peut pas réparer un fichier absent du CDN : ces deux MP3 doivent être remis en ligne à ces mêmes URLs, sans modification du site.

Le tableau de bord authentifié complet n’a pas été ouvert pendant la vérification faute de mot de passe administrateur. La route protégée, les règles RLS et les parcours anonymes ont néanmoins été vérifiés.

Le workflow GitHub Pages final s’est terminé avec succès. L’accueil et `/pack/`
répondent HTTP 200 sur `https://ecolynroutine.github.io/`. Le domaine
`https://ecolyn.ma/` pointe bien vers l’infrastructure GitHub, mais sert encore
une ancienne version et `https://ecolyn.ma/pack/` répond HTTP 404. Le domaine doit
donc encore être rattaché au dépôt `ecolynroutine.github.io` dans **Settings →
Pages → Custom domain**. Cette opération appartient aux réglages du compte
GitHub et ne peut pas être remplacée par un changement de code.

Deux prospects de test sont présents dans Supabase avec le téléphone `0600000000`. Ils peuvent être classés « Archivé » depuis l’administration après connexion.

## Mesures de performance

Le bundle est découpé par route : l’administration et la page de remerciement ne sont plus incluses dans le premier écran public. Les audios ne sont pas préchargés, les images basses sont paresseuses et les tailles sont explicites. Le build produit des chunks publics mis en cache ; aucune erreur de build n’est présente.

Une mesure Lighthouse chiffrée n’a pas été ajoutée au rapport, car aucun audit Lighthouse reproductible n’était disponible dans l’environnement de vérification. Les objectifs Core Web Vitals devront être confirmés sur le domaine public après propagation DNS, avec les conditions réseau réelles.

## Fichiers principaux modifiés

- `src/App.tsx`, `src/styles.css`, `src/main.tsx`
- `src/lib/tracking.ts`, `src/pages/ThankYou.tsx`
- `src/admin/AdminLogin.tsx`, `src/admin/AdminDashboard.tsx`
- `src/data/articles/index.ts`, `src/data/nutrition/index.ts`, `src/data/testimonials/index.ts`
- `site-config.json`, `scripts/build-runtime-config.mjs`
- `public/pack/index.html`, `public/pack/ecolyn-runtime.js`
- `public/404.html`, `public/robots.txt`, `public/sitemap.xml`
- `index.html`, `README.md`

Les anciens portraits et faux doublons locaux ont été retirés : les médias officiels sont chargés directement depuis le CDN, comme demandé.
