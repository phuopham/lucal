import { convertLunar2Solar } from './lunar';
import { parseSolarDate } from './schedule';
import type { ScheduleEntry } from './schedule';

export interface MemorialDay {
  title: string;
  note?: string;
  /** Solar day of month. */
  d: number;
  /** Solar month, 1-12. */
  m: number;
  /** Solar year. */
  y: number;
}

/**
 * Resolve every memorial entry (type `memorial`, lunar-yearly) to its solar
 * date for the given year. Regular month is tried first, then the leap month,
 * falling back to the first that resolves within the target year.
 */
export function memorialDays(schedules: ScheduleEntry[], year: number): MemorialDay[] {
  const out: MemorialDay[] = [];
  for (const s of schedules) {
    if (s.type !== 'memorial') continue;
    if (!s.lunarMonth || !s.lunarDay) continue;
    for (const leap of [false, true]) {
      const solar = convertLunar2Solar(s.lunarDay, s.lunarMonth, year, leap);
      if (solar && solar[2] === year) {
        out.push({ title: s.title, note: s.note, d: solar[0], m: solar[1], y: solar[2] });
        break;
      }
    }
  }
  return out.sort((a, b) => a.m - b.m || a.d - b.d);
}

/**
 * Resolve every birthday entry (type `birthday`, solar-yearly) to its solar
 * date for the given year. The stored year is ignored; it repeats every year.
 */
export function birthdayDays(schedules: ScheduleEntry[], year: number): MemorialDay[] {
  const out: MemorialDay[] = [];
  for (const s of schedules) {
    if (s.type !== 'birthday') continue;
    const p = parseSolarDate(s.date);
    if (!p) continue;
    out.push({ title: s.title, note: s.note, d: p.d, m: p.m, y: year });
  }
  return out.sort((a, b) => a.m - b.m || a.d - b.d);
}