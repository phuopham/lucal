// Schedule entries managed through Pages CMS (`.pages.yml` -> src/content/schedule).
// Recurrence types:
//   - once:        fires on one exact solar date (dd-MM-yyyy)
//   - yearly:      fires every solar year on the same month/day (date's year ignored)
//   - lunar-yearly: fires every year on the same LUNAR month/day

export type ScheduleRecurrence = 'once' | 'yearly' | 'lunar-yearly';

export interface ScheduleEntry {
  title: string;
  recurrence: ScheduleRecurrence;
  /** Solar date in `dd-MM-yyyy` form. Used by `once` and `yearly`. */
  date?: string;
  /** Lunar month (1-12). Used by `lunar-yearly`. */
  lunarMonth?: number;
  /** Lunar day (1-30). Used by `lunar-yearly`. */
  lunarDay?: number;
  note?: string;
}

export interface DayContext {
  /** Solar day of month. */
  d: number;
  /** Solar month, 1-12. */
  m: number;
  /** Solar year. */
  y: number;
  /** Lunar day of month. */
  ld: number;
  /** Lunar month, 1-12. */
  lm: number;
}

const CAL = (n: string): number => Number(n);

/** Parse `dd-MM-yyyy` (or `yyyy-MM-dd`) into parts, or null. */
export function parseSolarDate(s: string | undefined): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const [, a, b, c] = m;
  if (a.length === 4) {
    const y = CAL(a);
    const mo = CAL(b);
    const d = CAL(c);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return { y, m: mo, d };
  }
  const d = CAL(a);
  const mo = CAL(b);
  const y = CAL(c);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

/** For a given calendar day, return every schedule that occurs on it. */
export function schedulesOnDay(schedules: ScheduleEntry[], day: DayContext): ScheduleEntry[] {
  const out: ScheduleEntry[] = [];
  for (const s of schedules) {
    if (matches(s, day)) out.push(s);
  }
  return out;
}

export function matches(s: ScheduleEntry, day: DayContext): boolean {
  switch (s.recurrence) {
    case 'once': {
      const p = parseSolarDate(s.date);
      return p !== null && p.y === day.y && p.m === day.m && p.d === day.d;
    }
    case 'yearly': {
      const p = parseSolarDate(s.date);
      return p !== null && p.m === day.m && p.d === day.d;
    }
    case 'lunar-yearly':
      return s.lunarMonth === day.lm && s.lunarDay === day.ld;
    default:
      return false;
  }
}