# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Expo managed workflow with React Native and TypeScript, Expo Router, Supabase Auth/Postgres/Realtime, React Native Reanimated for sparse purposeful motion, and EAS Build for iOS and Android. The complete v1 includes a local demo-data fallback and automated tests.

## Users

Neova serves postpartum women in the United States who want low-pressure, private peer support during an emotionally and physically vulnerable transition. A member should be able to find women at a similar postpartum stage, share honestly, ask for advice or company, and access crisis resources without navigating a public social network.

## Product Purpose

Neova places each new member into a small, stage-matched support cohort immediately after intake. Success means she enters a relevant circle without a waiting-room state, can participate safely without performing for metrics, and can reach authoritative US crisis resources wherever she encounters support content.

## Positioning

Neova is a subscription peer-support space organized around small cohorts of at most 15 women matched by postpartum-week window, not an open audience, follower graph, or engagement leaderboard.

## Operating Context

- Email/password authentication leads into a short postpartum intake.
- Intake records weeks postpartum, birth experiences, and the kind of support the member wants.
- The primary recurring activity is reading and posting in a chronological cohort feed.
- Members can view their circle and collective stage, learn from stage-specific resources, see partner organizations, and manage privacy and subscription settings.
- Members may use anonymous mode when posting or participating.
- The launch audience and crisis-resource policy are US-only.

## Capabilities and Constraints

- Five primary tabs: Home, My Circle, Learn, Impact, and Profile.
- Supabase authentication, database, realtime cohort-feed updates, and row-level security.
- Immediate cohort assignment by postpartum-week window with a 15-member cap.
- Non-numeric reactions only: “sending strength,” “same,” and “here for you.”
- A private concern-reporting path and moderator flags table.
- On crisis-language matches, never block or publicly mark a post and never make the app respond as a counselor. Show the author an acknowledgement-required resources modal and silently create a moderator flag.
- The approved crisis-language marker list has not yet been supplied. Detection remains explicitly disabled/configurable until that list is provided; no markers may be invented.
- Learn content and Impact partners are static in v1. Live expert Q&A, donation totals, and maps are deferred.
- Demo mode must let the complete experience run without Supabase credentials while clearly separating synthetic content from production data.

## Brand Commitments

- Product name: Neova.
- Voice: calm, warm, direct, non-infantilizing, and trustworthy; never gamified or falsely therapeutic.
- Visual constraints: cream `#FAF6F1`, terracotta `#C6714A`, sage `#8A9A7E`, charcoal `#2E2A26`; Inter for functional text and Fraunces as the restrained editorial display face.
- No gradients, glassmorphism, neon, generic repeated feature-card grids, stock “happy mom” photography, excessive pills or shadows, follower/like counts, streaks, leaderboards, or gratuitous motion.
- Fabulous, Headspace, and Cozy are benchmarks for calm restraint, not templates to clone.

## Evidence on Hand

- The user-provided product and technical brief is the source of truth for v1 scope.
- No production Supabase project credentials, approved crisis-marker list, legal copy, partner roster, testimonials, revenue figures, or other launch claims are currently present. Future work must not fabricate them.

## Product Principles

1. Place her in relevant company immediately; never make belonging feel like a queue.
2. Optimize for honest support, not measurable popularity.
3. Keep safety resources visible, authoritative, private, and non-counseling.
4. Make every interaction feel calm enough for a tired or overwhelmed person.
5. Preserve member dignity through privacy, plain language, and restrained product mechanics.

## Accessibility & Inclusion

Design for fatigue, one-handed use, stress, and variable attention: readable type, generous touch targets, clear focus and error states, screen-reader labels, reduced-motion support, and crisis resources that remain easy to find. Birth-experience intake supports vaginal birth, C-section, NICU stay, loss, and multiples without ranking or euphemizing those experiences.
