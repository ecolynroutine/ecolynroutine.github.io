# Activer Meta Conversions API (CAPI)

Le code est déjà prêt. Le jeton Meta reste uniquement dans les secrets Supabase : il ne doit jamais être collé dans le site, GitHub ou une variable `VITE_*`.

## Les seules actions manuelles

1. Dans **Meta Events Manager**, ouvrez la source de données reliée au pixel ECOLYN.
2. Ouvrez **Paramètres** → **API Conversions** → **Configurer manuellement** → **Générer un jeton d’accès**.
3. Copiez ce jeton sans l’envoyer dans une conversation.
4. Dans Supabase, ouvrez le projet ECOLYN puis **Edge Functions** → **Secrets**.
5. Ajoutez le secret `META_CAPI_ACCESS_TOKEN` et collez le jeton comme valeur.
6. Pour un premier test, récupérez dans Meta **Tester les événements** le code de test et ajoutez dans Supabase le secret `META_CAPI_TEST_EVENT_CODE`. Supprimez ce second secret après validation.
7. Déployez la fonction `meta-capi` depuis le dossier du projet :

   ```powershell
   npx supabase login
   npx supabase functions deploy meta-capi --project-ref kzygabpjpdzbjfglmppj --no-verify-jwt
   ```

## Fonctionnement et confidentialité

- Le navigateur envoie le même identifiant d’événement au Pixel et à CAPI, afin que Meta puisse dédupliquer le `Lead`.
- CAPI est appelée seulement après l’enregistrement réussi du formulaire et seulement si le consentement marketing séparé est coché.
- L’email et le téléphone sont lus côté serveur, normalisés puis hachés en SHA-256 avant l’envoi à Meta. Ils ne sont jamais renvoyés au navigateur.
- La clé `service_role` et le jeton Meta ne sont jamais exposés côté frontend.

Pour tester, ouvrez le site avec `?tracking_debug=1`, soumettez un formulaire de test en cochant le consentement marketing, puis contrôlez **Meta Events Manager → Tester les événements**.
