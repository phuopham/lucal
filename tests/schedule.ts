import {
  matches,
  schedulesOnDay,
  parseSolarDate,
  recurrenceFor,
  type ScheduleEntry,
  type DayContext,
} from '../src/lib/schedule.ts';
import { birthdayDays, memorialDays, memorialDaysLunar } from '../src/lib/memorials.ts';
import { nextLunarMonth, prevLunarMonth, clampLunarMonth } from '../src/lib/lunar-nav.ts';

let pass = 0;
let fail = 0;
function ok(cond: boolean, label: string) {
  if (cond) pass++;
  else {
    fail++;
    console.error('  FAIL: ' + label);
  }
}

const day = (d: number, m: number, y: number, ld = 1, lm = 1): DayContext => ({ d, m, y, ld, lm });

// --- recurrenceFor (type implies recurrence) ---
{
  ok(recurrenceFor('birthday', 'once') === 'yearly', 'birthday -> yearly');
  ok(recurrenceFor('birthday', 'lunar-yearly') === 'yearly', 'birthday overrides lunar-yearly -> yearly');
  ok(recurrenceFor('memorial', 'yearly') === 'lunar-yearly', 'memorial -> lunar-yearly');
  ok(recurrenceFor('memorial', 'once') === 'lunar-yearly', 'memorial overrides once -> lunar-yearly');
  ok(recurrenceFor('wedding', 'once') === 'once', 'wedding keeps stored recurrence');
  ok(recurrenceFor('custom', 'yearly') === 'yearly', 'custom keeps stored recurrence');
}

// --- parseSolarDate ---
{
  const p = parseSolarDate('2026-06-15');
  ok(p !== null && p.y === 2026 && p.m === 6 && p.d === 15, 'parse "2026-06-15"');
  ok(parseSolarDate('') === null, 'empty date -> null');
  ok(parseSolarDate('2026/06/15') === null, 'wrong format -> null');
  ok(parseSolarDate('2026-13-01') === null, 'month 13 -> null');
  ok(parseSolarDate('2026-6-5') !== null, 'zero-padded month/day accepted');
}

// --- once ---
{
  const e: ScheduleEntry = { title: 'A', type: 'custom', recurrence: 'once', date: '2026-06-15' };
  ok(matches(e, day(15, 6, 2026)), 'once: exact day matches');
  ok(!matches(e, day(15, 6, 2027)), 'once: other year does not match');
  ok(!matches(e, day(14, 6, 2026)), 'once: other day does not match');
}

// --- yearly (solar) ---
{
  const e: ScheduleEntry = { title: 'B', type: 'custom', recurrence: 'yearly', date: '2026-06-15' };
  ok(matches(e, day(15, 6, 2026)), 'yearly: fire year matches');
  ok(matches(e, day(15, 6, 2027)), 'yearly: any later year matches');
  ok(matches(e, day(15, 6, 1905)), 'yearly: earlier year matches');
  ok(!matches(e, day(16, 6, 2026)), 'yearly: other day does not match');
  ok(!matches(e, day(15, 7, 2026)), 'yearly: other month does not match');
  ok(matches(e, day(15, 6, 2026, 5, 3)), 'yearly: ignores lunar fields (still matches)');
}

// --- lunar-yearly ---
{
  const e: ScheduleEntry = { title: 'C', type: 'custom', recurrence: 'lunar-yearly', lunarMonth: 8, lunarDay: 16 };
  ok(matches(e, day(1, 1, 2026, 16, 8)), 'lunar-yearly: matches lunar date (any solar date)');
  ok(matches(e, day(20, 9, 2027, 16, 8)), 'lunar-yearly: matches in other years');
  ok(!matches(e, day(1, 1, 2026, 16, 7)), 'lunar-yearly: wrong lunar month');
  ok(!matches(e, day(1, 1, 2026, 15, 8)), 'lunar-yearly: wrong lunar day');
}

// --- schedulesOnDay aggregation ---
{
  const list: ScheduleEntry[] = [
    { title: 'Once', type: 'birthday', recurrence: 'once', date: '2026-03-10' },
    { title: 'Yearly', type: 'memorial', recurrence: 'yearly', date: '2026-03-10' },
    { title: 'Lunar', type: 'wedding', recurrence: 'lunar-yearly', lunarMonth: 2, lunarDay: 1 },
    { title: 'Other', type: 'custom', recurrence: 'yearly', date: '2026-05-05' },
  ];
  const onDay = schedulesOnDay(list, day(10, 3, 2026, 1, 2));
  ok(onDay.length === 3, 'three schedules collide on this day (got ' + onDay.length + ')');
  ok(onDay.every((s) => s.title !== 'Other'), 'non-matching excluded');
}

// --- birthdayDays (solar-yearly) ---
{
  const list: ScheduleEntry[] = [
    { title: 'Bà Bằng', type: 'birthday', recurrence: 'yearly', date: '23-01-2025' },
    { title: 'Beo', type: 'birthday', recurrence: 'yearly', date: '06-03-2026' },
    { title: 'Nope', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 8, lunarDay: 2 },
    { title: 'Skip', type: 'custom', recurrence: 'yearly', date: '2026-05-05' },
    { title: 'NoDate', type: 'birthday', recurrence: 'yearly' },
  ];
  const b = birthdayDays(list, 2027);
  ok(b.length === 2, 'only birthday entries resolve (got ' + b.length + ')');
  // two birthdays must be sorted by month/day regardless of stored date year
  const [first, second] = b;
  ok(first.title === 'Bà Bằng' && first.d === 23 && first.m === 1 && first.y === 2027, 'first: 23/1 in target year');
  ok(second.title === 'Beo' && second.d === 6 && second.m === 3 && second.y === 2027, 'second: 6/3 in target year');
}

// --- lunar month navigation (leap-aware) ---
{
  const eq = (a: { year: number; month: number; leap: boolean }, b: { year: number; month: number; leap: boolean }) =>
    a.year === b.year && a.month === b.month && a.leap === b.leap;
  // 2023 has a leap month 2.
  ok(eq(nextLunarMonth(2023, 2, false), { year: 2023, month: 2, leap: true }), 'regular 2 -> leap 2');
  ok(eq(nextLunarMonth(2023, 2, true), { year: 2023, month: 3, leap: false }), 'leap 2 -> month 3');
  ok(eq(prevLunarMonth(2023, 3, false), { year: 2023, month: 2, leap: true }), 'month 3 <- leap 2');
  // Year wrap.
  ok(eq(nextLunarMonth(2023, 12, false), { year: 2024, month: 1, leap: false }), '12 -> next year 1');
  ok(eq(prevLunarMonth(2024, 1, false), { year: 2023, month: 12, leap: false }), '1 <- previous year 12');
  // 2026 has no leap month: clamp drops a stale leap flag.
  ok(eq(clampLunarMonth(2026, 2, true), { year: 2026, month: 2, leap: false }), 'clamp drops non-existent leap');
  ok(eq(clampLunarMonth(2025, 6, true), { year: 2025, month: 6, leap: true }), 'clamp keeps existing leap');
  ok(eq(nextLunarMonth(2026, 7, false), { year: 2026, month: 8, leap: false }), '2026-7 -> 2026-8');
}

// --- memorial days: solar-year straddle (months 11/12) ---
{
  const m11: ScheduleEntry = { title: 'Giỗ cụ', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 11, lunarDay: 19 };
  const m12: ScheduleEntry = { title: 'Ông Táo', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 12, lunarDay: 23 };
  const all = [m11, m12];

  // 19/11 of lunar 2027 -> 16/12/2027 (present in solar 2027).
  {
    const ds = memorialDays([m11], 2027);
    ok(ds.length === 1 && ds[0].lm === 11 && ds[0].ld === 19 && ds[0].y === 2027, 'memorialDays(2027) keeps 19/11 (got ' + JSON.stringify(ds.map((x) => `${x.ld}/${x.lm}@${x.d}/${x.m}/${x.y}`)) + ')');
  }
  // 19/11 occurs twice in solar 2026 (7/1 from lunar 2025, 27/12 from lunar 2026);
  // the current lunar year's occurrence is preferred.
  {
    const ds = memorialDays([m11], 2026);
    ok(ds.length === 1 && ds[0].d === 27 && ds[0].m === 12 && ds[0].y === 2026, 'memorialDays(2026) prefers current lunar year (27/12/2026)');
    ok(memorialDays([m11], 2025).length === 0, 'no 19/11 occurrence in solar 2025');
  }
  // 23/12 of lunar 2026 -> 30/1/2027; month-12 never falls in its own solar year.
  {
    const ds = memorialDays(all, 2027);
    ok(ds.some((x) => x.ld === 23 && x.lm === 12 && x.d === 30 && x.m === 1), 'month-12 memorial resolves into Jan 2027');
  }
}

// --- memorial days: lunar-year resolution (all months of the viewed lunar year) ---
{
  const all: ScheduleEntry[] = [
    { title: 'Giỗ m1', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 1, lunarDay: 23 },
    { title: 'Giỗ m11', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 11, lunarDay: 19 },
    { title: 'Giỗ m12', type: 'memorial', recurrence: 'lunar-yearly', lunarMonth: 12, lunarDay: 23 },
  ];
  const ds = memorialDaysLunar(all, 2027);
  ok(ds.length === 3, 'memorialDaysLunar(2027) lists all 3 memorials (got ' + ds.length + ')');
  ok(ds.map((x) => x.lm).join(',') === '1,11,12', 'sorted by lunar month (got ' + ds.map((x) => x.lm).join(',') + ')');
  const m11 = ds.find((x) => x.lm === 11);
  ok(m11 !== undefined && m11.d === 16 && m11.m === 12 && m11.y === 2027, 'lunar 11/19 of 2027 -> 16/12/2027');
  const m12 = ds.find((x) => x.lm === 12);
  ok(m12 !== undefined && m12.d === 19 && m12.m === 1 && m12.y === 2028, 'lunar 12/23 of 2027 -> 19/1/2028');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);