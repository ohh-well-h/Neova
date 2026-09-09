import { CRISIS_LANGUAGE_MARKERS } from '@/config/crisisMarkers';

const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export function containsCrisisLanguage(
  body: string,
  markers: readonly string[] = CRISIS_LANGUAGE_MARKERS,
): boolean {
  if (!body.trim() || markers.length === 0) {
    return false;
  }

  const normalizedBody = normalize(body);
  return markers.some((marker) => {
    const normalizedMarker = normalize(marker);
    return normalizedMarker.length > 0 && normalizedBody.includes(normalizedMarker);
  });
}
