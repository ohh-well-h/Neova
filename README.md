# Neova

Neova is a calm, subscription-based peer-support app for postpartum women in the United States. New members complete a brief intake and are immediately placed into a small cohort matched by postpartum stage.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add Supabase credentials, or leave those values empty for demo mode.
3. Run `npm start`, `npm run web`, `npm run ios`, or `npm run android`.

Database migrations live in `supabase/migrations`. Apply them to a Supabase project before using production mode:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

For a local Supabase stack, initialize the CLI config, start Docker, run `npx supabase start`, then `npx supabase db reset`. The database policy suite in `supabase/tests/database` runs with `npx supabase test db`.

## PWA build

The web target remains part of the same universal Expo project. Build the production SPA with:

```sh
npm run build:web
```

Expo writes the site to `dist`. Files from `public` supply the install manifest, iOS home-screen metadata, branded icons, service worker, and SPA route fallback. The PWA requires HTTPS when hosted; `localhost` is allowed for local service-worker testing.

After building, `npm run serve:web` serves the SPA locally for production-style browser checks.

The service worker precaches the app shell and generated entry bundle, then caches same-origin static files as they are used. Navigations fall back to the cached SPA shell when offline. Supabase requests remain network-owned and are not put in the app cache, so the existing demo/offline experience remains the safe fallback rather than serving stale private cohort data.

Pending crisis-resource acknowledgment is also stored per user in AsyncStorage, which maps to localStorage on web. The root guard blocks every internal route by default while pending, and the web guard re-pushes the required resources URL on browser back/forward. Escape and outside pointer interactions cannot dismiss it. Only the explicit acknowledgment action clears the local record; server reconciliation may set pending state but never silently clears local pending state. Demo session and pending state are restored across reloads, and sign-out is available without deleting that user's pending record.

### Web compatibility audit

`expo export --platform web` succeeds with the current dependency set. Expo Haptics, AsyncStorage, Reanimated, Gesture Handler, Linking, Safe Area Context, React Native SVG, and Supabase all resolve to supported web implementations in this build. Haptics uses the Web Vibration API where available.

React Native Web provides non-functional shims for `Alert`, `RefreshControl`, and `BackHandler`. Neova routes alerts through a browser-safe wrapper, presents an explicit web refresh action, and runs the hardware back listener only on native. The persistent crisis acknowledgement and route guard remain the cross-platform enforcement mechanism. No dependency replacement is required.

Before launch, test the production export in current Safari on iOS, Chrome on Android, and a desktop browser. Installation and offline behavior cannot be fully verified from a development server because browsers enforce secure-context and installability rules.

## Web subscription checkout

Neova has no in-app-purchase integration. Set `EXPO_PUBLIC_WEB_CHECKOUT_URL` to an HTTPS hosted checkout URL (for example, a Stripe Payment Link) or to a web endpoint that securely creates a checkout session and redirects the member. When configured, Profile exposes the standard web checkout action only on web; native builds remain valid and show the pending web-checkout state.

Do not place Stripe or PayPal secret keys in any `EXPO_PUBLIC_` variable. For account-linked subscriptions, prefer a server or Supabase Edge Function that authenticates the member, creates the provider checkout session, and returns or redirects to its URL.

## Hosting options

All three suitable hosts use build command `npm run build:web` and output directory `dist`. No deployment is performed by this repository.

- **Vercel:** simplest repository import. `vercel.json` already defines the build, SPA rewrite, and service-worker cache headers.
- **Netlify:** `netlify.toml` already sets the build, publish directory, and SPA history fallback. `public/_headers` prevents a stale service worker.
- **Cloudflare Pages:** set the same build command and output directory in the dashboard. Pages supplies SPA fallback automatically when no top-level `404.html` is present; the copied `_headers` file supplies the service-worker policy.

Whichever host is chosen, add its final HTTPS origin to Supabase Auth's Site URL and allowed redirect URLs before enabling production sign-in.

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
npm run test:web
npx expo-doctor
npm run build:web
```

`npm run test:web` builds the production PWA and runs the crisis acknowledgment gate in installed Chrome through Playwright. The suite covers Escape, outside interaction, browser back, offline reload/local restoration through the service worker, and failed acknowledgment persistence.

## Safety boundary

Production crisis-language markers are intentionally absent. Add only a reviewed marker list to the private `crisis_language_markers` table through a protected Supabase migration. The server - not the client - then atomically creates a post and private moderator flag and returns whether acknowledgement is required. `src/config/crisisMarkers.ts` is only the demo/offline fallback. Until a reviewed list is supplied, automatic detection stays disabled; the permanent 988 and PSI resource links remain available throughout the app.

The Impact roster and subscription setup remain honest placeholders until Neova supplies confirmed partner organizations and billing requirements. No partner or contribution claim is fabricated in demo mode.
