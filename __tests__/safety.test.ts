import { containsCrisisLanguage } from '../src/services/safety';

describe('private crisis-language marker detection', () => {
  const reviewedTestMarkers = ['reviewed marker alpha', "marker's phrase"];

  it('does not infer markers when the production list is empty', () => {
    expect(containsCrisisLanguage('Any body text at all')).toBe(false);
  });

  it('matches a supplied marker without blocking on case or repeated whitespace', () => {
    expect(
      containsCrisisLanguage('A REVIEWED   MARKER ALPHA appeared.', reviewedTestMarkers),
    ).toBe(true);
  });

  it('normalizes typographic apostrophes', () => {
    expect(containsCrisisLanguage('This has a marker’s phrase.', reviewedTestMarkers)).toBe(true);
  });

  it('does not match unrelated text', () => {
    expect(containsCrisisLanguage('I would like company today.', reviewedTestMarkers)).toBe(false);
  });
});
