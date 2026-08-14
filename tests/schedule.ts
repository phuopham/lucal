import {
  matches,
  schedulesOnDay,
  parseSolarDate,
  type ScheduleEntry,
  type DayContext,
} from '../src/lib/schedule.ts';

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
  const e: ScheduleEntry = { title: 'A', recurrence: 'once', date: '2026-06-15' };
  ok(matches(e, day(15, 6, 2026)), 'once: exact day matches');
  ok(!matches(e, day(15, 6, 2027)), 'once: other year does not match');
  ok(!matches(e, day(14, 6, 2026)), 'once: other day does not match');
}

// --- yearly (solar) ---
{
  const e: ScheduleEntry = { title: 'B', recurrence: 'yearly', date: '2026-06-15' };
  ok(matches(e, day(15, 6, 2026)), 'yearly: fire year matches');
  ok(matches(e, day(15, 6, 2027)), 'yearly: any later year matches');
  ok(matches(e, day(15, 6, 1905)), 'yearly: earlier year matches');
  ok(!matches(e, day(16, 6, 2026)), 'yearly: other day does not match');
  ok(!matches(e, day(15, 7, 2026)), 'yearly: other month does not match');
  ok(matches(e, day(15, 6, 2026, 5, 3)), 'yearly: ignores lunar fields (still matches)');
}

// --- lunar-yearly ---
{
  const e: ScheduleEntry = { title: 'C', recurrence: 'lunar-yearly', lunarMonth: 8, lunarDay: 16 };
  ok(matches(e, day(1, 1, 2026, 16, 8)), 'lunar-yearly: matches lunar date (any solar date)');
  ok(matches(e, day(20, 9, 2027, 16, 8)), 'lunar-yearly: matches in other years');
  ok(!matches(e, day(1, 1, 2026, 16, 7)), 'lunar-yearly: wrong lunar month');
  ok(!matches(e, day(1, 1, 2026, 15, 8)), 'lunar-yearly: wrong lunar day');
}

// --- schedulesOnDay aggregation ---
{
  const list: ScheduleEntry[] = [
    { title: 'Once', recurrence: 'once', date: '2026-03-10' },
    { title: 'Yearly', recurrence: 'yearly', date: '2026-03-10' },
    { title: 'Lunar', recurrence: 'lunar-yearly', lunarMonth: 2, lunarDay: 1 },
    { title: 'Other', recurrence: 'yearly', date: '2026-05-05' },
  ];
  const onDay = schedulesOnDay(list, day(10, 3, 2026, 1, 2));
  ok(onDay.length === 3, 'three schedules collide on this day (got ' + onDay.length + ')');
  ok(onDay.every((s) => s.title !== 'Other'), 'non-matching excluded');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);