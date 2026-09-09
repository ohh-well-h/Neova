import { createDemoData } from '../src/data/demo';

describe('demo fallback', () => {
  it('creates a complete, immediately usable cohort state', () => {
    const demo = createDemoData(new Date('2026-09-08T12:00:00.000Z'));
    expect(demo.profile.displayName).toBeTruthy();
    expect(demo.members).toHaveLength(6);
    expect(demo.members.length).toBeLessThanOrEqual(15);
    expect(demo.posts.length).toBeGreaterThan(0);
    expect(demo.posts.every((post) => post.cohortId === demo.cohort.id)).toBe(true);
  });
});
