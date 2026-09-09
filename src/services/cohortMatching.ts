export type StageWindow = {
  start: number;
  end: number;
  label: string;
};

const WINDOWS: readonly StageWindow[] = [
  { start: 0, end: 5, label: 'Weeks 0–5' },
  { start: 6, end: 10, label: 'Weeks 6–10' },
  { start: 11, end: 16, label: 'Weeks 11–16' },
  { start: 17, end: 24, label: 'Weeks 17–24' },
  { start: 25, end: 36, label: 'Weeks 25–36' },
  { start: 37, end: 52, label: 'Weeks 37–52' },
  { start: 53, end: 104, label: 'One year and beyond' },
] as const;

export function getStageWindow(weeksPostpartum: number): StageWindow {
  const safeWeek = Math.max(0, Math.floor(weeksPostpartum));
  return WINDOWS.find((window) => safeWeek <= window.end) ?? WINDOWS[WINDOWS.length - 1]!;
}

export function weeksPostpartum(startDate: string, now = new Date()): number {
  const start = new Date(`${startDate}T00:00:00`);
  const milliseconds = Math.max(0, now.getTime() - start.getTime());
  return Math.floor(milliseconds / (7 * 24 * 60 * 60 * 1000));
}

export function postpartumStartDateForWeeks(weeks: number, now = new Date()): string {
  const result = new Date(now);
  result.setDate(result.getDate() - Math.max(0, Math.floor(weeks)) * 7);
  return result.toISOString().slice(0, 10);
}
