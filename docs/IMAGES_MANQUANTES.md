# Statut des médias ECOLYN

## Intégrés depuis le CDN officiel

- favicon ECOLYN ;
- deux portraits de la conseillère ;
- paire avant/après ;
- six portraits de témoignage et les six URLs audio associées.

La liste canonique des URLs se trouve dans `site-config.json`. Ces fichiers ne
sont pas téléchargés ni dupliqués dans `public/`.

## Points à conserver côté métier

- autorisation de diffusion pour chaque portrait, audio et avant/après ;
- contexte et durée documentés pour l’avant/après ;
- transcription validée si un verbatim écrit est ajouté plus tard ;
- liste d’ingrédients et précautions du pack vérifiées sur l’emballage actuel ;
- nom et qualifications de la conseillère laissés vides tant qu’ils ne sont pas
  confirmés officiellement.

`public/og.png` reste la carte sociale locale du site. Les visuels commerciaux
propres à `/pack/` sont conservés dans cette page séparée.

## Incident CDN constaté le 4 août 2026

Les fichiers `1.mp3`, `2.mp3`, `3.mp3` et `6.mp3` répondent HTTP 200. Les URLs
exactes fournies pour `4.mp3` (Khadija) et `5.mp3` (Najat) répondent HTTP 404.
Le lecteur affiche un message de secours traduit ; les deux fichiers doivent être
remis en ligne à ces mêmes URLs côté CDN.
