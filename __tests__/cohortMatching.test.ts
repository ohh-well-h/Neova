import {
  getStageWindow,
  postpartumStartDateForWeeks,
  weeksPostpartum,
} from '../src/services/cohortMatching';

describe('cohort matching', () => {
  it.each([
    [0, 0, 5],
    [5, 0, 5],
    [6, 6, 10],
    [10, 6, 10],
    [11, 11, 16],
    [24, 17, 24],
    [52, 37, 52],
    [53, 53, 104],
    [200, 53, 104],
  ])('places week %i in the %i-%i window', (week, expectedStart, expectedEnd) => {
    expect(getStageWindow(week)).toMatchObject({ start: expectedStart, end: expectedEnd });
  });

  it('clamps a negative week to the first cohort', () => {
    expect(getStageWindow(-4)).toMatchObject({ start: 0, end: 5 });
  });

  it('round-trips a postpartum week from a stable date', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const startDate = postpartumStartDateForWeeks(8, now);
    expect(weeksPostpartum(startDate, now)).toBe(8);
  });
});
