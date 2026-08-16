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
  /** Lunar day of month (present for memorial entries). */
  ld?: number;
  /** Lunar month, 1-12 (present for memorial entries). */
  lm?: number;
}

/**
 * Resolve every memorial entry (type `memorial`, lunar-yearly) to the solar
 * date on which it occurs within the given solar year. The lunar months 11 and
 * 12 straddle the solar-year boundary, so both the current and previous lunar
 * year are considered. Regular month is tried first, then the leap month.
 */
export function memorialDays(schedules: ScheduleEntry[], year: number): MemorialDay[] {
  const out: MemorialDay[] = [];
  for (const s of schedules) {
    if (s.type !== 'memorial') continue;
    if (!s.lunarMonth || !s.lunarDay) continue;
    let found: MemorialDay | null = null;
    for (const ly of [year, year - 1]) {
      if (found) break;
      for (const leap of [false, true]) {
        const solar = convertLunar2Solar(s.lunarDay, s.lunarMonth, ly, leap);
        if (solar && solar[2] === year) {
          found = {
            title: s.title,
            note: s.note,
            d: solar[0],
            m: solar[1],
            y: solar[2],
            ld: s.lunarDay,
            lm: s.lunarMonth,
          };
          break;
        }
      }
    }
    if (found) out.push(found);
  }
  return out.sort((a, b) => a.m - b.m || a.d - b.d);
}

/**
 * Resolve every memorial entry to its single occurrence within the given
 * lunar year, regardless of which solar year it lands in. This mirrors the
 * lunar year view: months 11/12 may resolve into the following solar year.
 */
export function memorialDaysLunar(schedules: ScheduleEntry[], lunarYear: number): MemorialDay[] {
  const out: MemorialDay[] = [];
  for (const s of schedules) {
    if (s.type !== 'memorial') continue;
    if (!s.lunarMonth || !s.lunarDay) continue;
    let resolved: [number, number, number] | null = null;
    for (const leap of [false, true]) {
      const solar = convertLunar2Solar(s.lunarDay, s.lunarMonth, lunarYear, leap);
      if (solar) {
        resolved = solar;
        break;
      }
    }
    if (!resolved) continue;
    out.push({
      title: s.title,
      note: s.note,
      d: resolved[0],
      m: resolved[1],
      y: resolved[2],
      ld: s.lunarDay,
      lm: s.lunarMonth,
    });
  }
  return out.sort((a, b) => a.lm! - b.lm! || a.ld! - b.ld!);
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