# Neova Design System

## Thesis

Neova is a private, subscription-oriented peer-support app for postpartum women in the United States. Its visual world is a **shared care ledger**: warm cream paper, substantial terracotta and sage fields, fine rules, a continuous botanical thread, and editorial type used with restraint. The experience should feel calm, specific, and humane under fatigue or stress. It supports peer connection; it never presents itself as counseling or clinical care.

## Palette

Use only tokens from `src/theme/tokens.ts`; do not invent near-matches.

| Token | Value | Role and accessible pairing |
| --- | --- | --- |
| `cream` | `#FAF6F1` | App ground; pair with `charcoal` or `charcoalSoft`. |
| `creamDeep` | `#F1E9DF` | Warm section field; pair with `charcoal`. |
| `paper` | `#FFFDF9` | Reading and input surface; pair with `charcoal`. |
| `terracotta` | `#C6714A` | Large decorative emphasis or selected state; use `terracottaDark` when the color must carry text-level contrast. |
| `terracottaDark` | `#9E5132` | Accessible dark terracotta companion for text/actions on light surfaces; use `white` on solid dark fields. |
| `terracottaSoft` | `#F2DDD0` | Quiet warm field; pair with `charcoal` or `terracottaDark`. |
| `sage` | `#8A9A7E` | Orientation, selection, and decorative support; use `sageDark` where stronger contrast is required. |
| `sageDark` | `#65735B` | Accessible dark sage companion for controls/icon fields; pair with `white` on solid fields. |
| `sageSoft` | `#E2E7DD` | Resource or article field; pair with `charcoal` or `sageDark`. |
| `charcoal` | `#2E2A26` | Primary text and icons. |
| `charcoalSoft` | `#625C56` | Secondary text. |
| `muted` | `#6E6862` | Captions and tertiary metadata on light grounds only. |
| `line` | `#D9CFC3` | Dividers and input borders; never the sole error/focus signal. |
| `danger` | `#A84C3B` | Error text and urgent semantic emphasis, always with explicit copy/icon. |
| `white` | `#FFFFFF` | Text/icons on verified dark fills. |
| `transparent` | `transparent` | Structural transparency only. |

The dark companions are functional, not extra decoration: `terracottaDark` and `sageDark` carry text, icon, and action contrast where their mid-tone parents should not. Verify every final foreground/background combination to WCAG AA; never rely on hue alone.

## Typography

- Display voice: `Fraunces_600SemiBold` for human, editorial moments only—screen titles and rare section statements.
- Product voice: `Inter_400Regular` for reading, `Inter_500Medium` for labels, and `Inter_600SemiBold` for stronger controls.
- Scale: display `44`, title `32`, heading `24`, subheading `19`, body `16`, body-small `14`, caption `12`.
- Keep body copy comfortably spaced and left aligned. Support dynamic type; layouts must reflow rather than clip. Do not use Fraunces for dense controls, metadata, or long body copy.

## Spacing, shape, and depth

- Spacing scale: `xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `xxl 32`, `xxxl 40`.
- Radii: `sm 10`, `md 14`, `lg 16`, `round 999`.
- Prefer open editorial spacing, flat fields, fine warm rules, and meaningful grouping over nested containers.
- Default shadow is intentionally quiet: charcoal at `0.08` opacity, radius `14`, offset `0/6`; Android elevation `2`. Use it only when hierarchy cannot be communicated by space, rule, or fill.

## Core components

- **Screen:** cream ground, safe-area aware, readable side gutters, optional scroll, and no ornamental chrome competing with content.
- **AppText:** maps variants strictly to the type and color tokens; preserves dynamic-type growth and semantic accessibility roles.
- **ActionButton:** minimum 44–48 px target; primary uses a strong solid field, secondary uses a calm outlined/soft treatment, and text tone is reserved for low-emphasis actions. Loading and disabled states remain labeled.
- **PressableScale:** use for touch semantics and restrained feedback, but visual motion is opacity-only; never shrink, bounce, or translate the control.
- **LeafMark / botanical thread:** a sparse identity cue, not a repeating wallpaper. Preserve clear space and silhouette at small sizes.
- **Post composer:** large paper text area, visible character count, explicit anonymous switch, plain-language privacy explanation, and a single share action.
- **Cohort post:** chronological, readable, and non-competitive; show no popularity score, rank, streak, follower count, or public flag state. Reactions are supportive and non-numeric.
- **CrisisResourcesCard / resource row:** permanent, high-visibility access with exact service distinctions; 988 is 24/7 crisis support, PSI is postpartum support/referrals and not an emergency line, and 911 is for immediate danger.
- **Settings row / switch:** label and explanatory copy remain tappable and understandable without color; disclose anonymous behavior where relevant.
- **Article block:** sourced editorial content with stage relevance, reading metadata, official-source action, and redundant crisis access.

## Five primary screen compositions

### Home

Lead with the current week and a low-pressure check-in, then a clear composer entry and a chronological feed capped to recent cohort content. Vary rhythm with rules and fields rather than repeating identical cards. Keep supportive reactions non-numeric.

### My Circle

Open with cohort identity and collective stage, followed by a simple shared-stage timeline, then a minimal roster and a discreet private-concern path. The roster is not a social graph; never expose member detail beyond display name and join time.

### Learn

Place permanent crisis resources before stage controls and content. Follow with a compact stage selector and a varied editorial article list: one lead story may carry stronger visual weight while supporting stories remain flatter. Every article exposes its official source.

### Impact

Present an honest, calm roster of prospective/pending partners and their focus areas. Use editorial rows or alternating fields, not logos in a trophy wall. Do not claim donations, contributions, outcomes, or confirmed affiliation before confirmation exists.

### Profile

Lead with identity and postpartum week, then group anonymous-post default, subscription placeholder, and account settings. Provide redundant crisis access and a clearly separated sign-out action. Privacy explanations must sit beside the setting they qualify.

Supporting routes—sign in, sign up, intake, compose, private concern, article detail, and the crisis acknowledgement sheet—inherit the same hierarchy and safety rules.

## PWA adaptation

- The Expo web build is an installable, standalone PWA while the native iOS and Android paths remain intact.
- After the first signed-in or demo session, eligible mobile-web users may see one quiet, dismissible install card. It is never a blocking modal and is remembered locally after its first appearance.
- iOS copy names Safari's Share and Add to Home Screen actions. Supporting browsers receive the browser-owned install prompt only after an explicit tap.
- Installed mode retains the cream app ground and terracotta browser theme. Safe-area viewport insets remain enabled for notched iOS devices.
- Offline caching is limited to same-origin app-shell and static assets. Never cache Supabase requests or private member data in the service worker.
- Pending safety acknowledgment is stored per user locally and on the server. The root guard blocks every internal route except the required resource screen, and web history is re-pushed after back/forward attempts. Escape and outside interaction cannot dismiss it; explicit acknowledgment is the only clearing action. Sign-out remains available without deleting pending state.
- Subscription billing uses an external HTTPS web checkout. No App Store or Play Store purchase surface belongs in this v1 path.

## Motion

- Motion is fade-only. Use at most one gentle opacity entrance when it reduces a loading or route-transition jolt.
- Bottom-tab changes are immediate. Never animate layout, scale, parallax, card stacking, counters, or decorative loops.
- Keep press feedback under `150ms`; opacity change is sufficient. Haptics are limited to deliberate selection or submission feedback.
- Respect the platform reduced-motion setting: remove entrances and nonessential transitions entirely while preserving immediate state feedback.

## Accessibility

- Meet WCAG AA contrast for text and essential icons; use the dark companion tokens when mid-tones are insufficient.
- Maintain 44–48 px minimum touch targets, safe-area clearance, logical focus order, visible focus/error states, and screen-reader labels that state action and outcome.
- Never encode status, stage, error, selection, or urgency by color alone. Pair color with text, iconography, shape, or state language.
- Support large text without truncating crisis information, resource phone numbers, buttons, or form errors. Avoid fixed-height text containers.
- Write for fatigue and variable attention: short labels, plain language, clear recovery paths, and no time pressure.

## Safety and privacy data contract

- Supabase owns auth, Postgres, realtime, RPC cohort assignment, and row-level security. A member reads only their own intake profile.
- Cohorts are stage matched and capped at 15. The roster RPC returns only member ID, display name, and join time.
- Author labels come from a member-scoped feed RPC; anonymous identity is redacted on the server. Clients never select raw post or raw reaction rows.
- The feed is bounded to 50 recent posts. Reaction responses expose only the caller's state, and realtime publishes sanitized cohort event rows.
- Concern flags are insert-only for members and invisible to clients after submission. Never show a public safety marker on a post.
- Production crisis markers remain empty until Neova supplies a reviewed list stored in a private database table. The atomic server post function evaluates markers, silently creates a moderator flag, and returns whether acknowledgement is required.
- Required acknowledgement persists across restarts until saved. Do not block or rewrite the post, diagnose the member, or respond as a counselor.
- Resource language must remain exact in meaning: 988 call/text for free, confidential 24/7 crisis support; PSI HelpLine `1-800-944-4773` for postpartum support and referrals, not emergency or 24/7 crisis care; 911 for immediate danger.

## Banned patterns

No gradients, glassmorphism, neon, heavy shadows, stock happy-mother imagery, generic dashboards, repeated same-shape cards, floating decoration without meaning, oversized pill controls, public metrics, popularity scores, streaks, follower mechanics, gamification, growth loops, or unconfirmed impact claims. Do not use babies, hearts, medical crosses, or clinical imagery as shortcuts for trust.

## Asset provenance

All shipping raster identity assets must retain documented provenance. The current leaf-and-thread mark was generated with the built-in OpenAI image-generation tool, then locally cleaned and normalized to the Neova palette; prompt and export details live in [assets/ASSET_GENERATION.md](assets/ASSET_GENERATION.md). The transparent source of truth is `assets/neova-mark-master.png`.

## Native screenshot QA limitation

Native device screenshot QA is not currently evidenced in this repository: no simulator/device capture is available here, so web or generated mockups must not be treated as proof of iOS/Android rendering. Before release, capture and review the five primary screens plus auth, intake, compose, article, private concern, and crisis acknowledgement on representative iOS and Android devices, including large text, reduced motion, dark accessibility settings where applicable, keyboard states, safe areas, and offline/error states.
