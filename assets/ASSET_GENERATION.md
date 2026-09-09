# Neova app asset provenance

Generated with the built-in OpenAI image-generation tool on 2026-09-08, then
locally normalized to the product palette and exported at platform-appropriate
sizes. The cleaned, palette-normalized transparent source of truth is
`neova-mark-master.png`; the temporary magenta chroma-key render was discarded
after extraction.

## Prompt

```text
Use case: logo-brand
Asset type: master app icon artwork and Android adaptive-icon foreground for a maternal shared-care mobile app named Neova
Primary request: create one original, restrained botanical leaf-and-thread symbol: two simple leaves growing from one continuous gently curved thread-like stem, expressing shared care, continuity, and quiet companionship. The mark must have a strong compact silhouette and remain recognizable at 16-32 px.
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for later removal; uniform edge-to-edge with no shadows, gradients, texture, floor plane, lighting variation, reflections, or vignette.
Style/medium: precise flat vector-like editorial emblem rendered as a clean raster; tactile warmth through subtly imperfect hand-cut contours, but no grain or speckle.
Composition/framing: centered, upright, generous even padding; symbol occupies about 58% of the square and stays fully inside the central safe area. Two leaves only, balanced but not mechanically symmetrical.
Color palette: terracotta #C6714A and sage #8A9A7E with a small charcoal #2E2A26 connecting stem; no other subject colors. Do not use magenta in the symbol.
Constraints: no text, no letters, no wordmark, no people, no faces, no heart, no medical cross, no baby silhouette, no stock imagery, no border, no rounded-square container, no shadow, no glow, no gradient, no watermark. Crisp separated edges suitable for chroma-key removal and Android adaptive-icon use.
```

## Export notes

- Background removal used the installed image-generation chroma-key helper with
  a soft matte and despill.
- Opaque colors were normalized to terracotta `#C6714A`, sage `#8A9A7E`, and
  charcoal `#2E2A26`; the icon canvases use cream `#FAF6F1`.
- Android monochrome artwork is an alpha mask with solid white foreground so
  launchers can apply the user's system tint.
- PWA exports in `public/icon-192.png`, `public/icon-512.png`, and
  `public/apple-touch-icon.png` are high-quality downscales of the existing
  branded `assets/icon.png`; no new artwork or external asset was introduced.
