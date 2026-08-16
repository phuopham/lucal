import {
  convertSolar2Lunar,
  convertLunar2Solar,
  jdFromDate,
  getDayCanChi,
  getSolarTermIndex,
  getDayGod,
  getLunarMonth1,
  getLeapMonth,
  getHoliday,
  isLastDayOfLunarYear,
  daysInLunarMonth,
  type LunarDate,
} from './lunar';
import { schedulesOnDay, type ScheduleEntry } from './schedule';

export interface DayInfo {
  jd: number;
  d: number;
  m: number;
  y: number;
  lunar: LunarDate;
  dayChi: { can: number; chi: number };
  term: number;
  termStart: boolean;
  god: { god: number; hoang: boolean };
  holiday: ReturnType<typeof getHoliday>;
  newYearEve: boolean;
  isToday: boolean;
  schedules: ScheduleEntry[];
}

export function daysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function dayInfo(d: number, m: number, y: number, schedules: ScheduleEntry[], todayJd: number): DayInfo {
  const jd = jdFromDate(d, m, y);
  const lunar = convertSolar2Lunar(d, m, y);
  const dayChi = getDayCanChi(jd);
  const term = getSolarTermIndex(jd);
  const termStart = getSolarTermIndex(jd - 1) !== term;
  const god = getDayGod(lunar.day, dayChi.chi);
  const holiday = getHoliday(lunar);
  return {
    jd,
    d,
    m,
    y,
    lunar,
    dayChi,
    term,
    termStart,
    god,
    holiday,
    newYearEve: isLastDayOfLunarYear(lunar),
    isToday: jd === todayJd,
    schedules: schedulesOnDay(schedules, { d, m, y, ld: lunar.day, lm: lunar.month }),
  };
}

export function monthDays(year: number, month: number, schedules: ScheduleEntry[]): DayInfo[] {
  const days: DayInfo[] = [];
  const count = daysInSolarMonth(year, month);
  const today = new Date();
  const todayJd = jdFromDate(today.getDate(), today.getMonth() + 1, today.getFullYear());
  for (let d = 1; d <= count; d++) {
    days.push(dayInfo(d, month, year, schedules, todayJd));
  }
  return days;
}

/** Ordered months of a lunar year, e.g. [{month:1,leap:false}, …, {month,leap:true} when the year has a leap month]. */
export function lunarMonthSequence(lunarYear: number): { month: number; leap: boolean }[] {
  const out: { month: number; leap: boolean }[] = [];
  const leapMonth = getLeapMonth(lunarYear);
  for (let m = 1; m <= 12; m++) {
    out.push({ month: m, leap: false });
    if (leapMonth === m) {
      out.push({ month: m, leap: true });
    }
  }
  return out;
}

/**
 * Every solar day that falls inside the given lunar month, ordered by lunar
 * day. Returns an empty array when the (month/leap) combination is invalid.
 */
export function lunarMonthDays(
  schedules: ScheduleEntry[],
  lunarYear: number,
  lunarMonth: number,
  leap: boolean,
): DayInfo[] {
  const start = getLunarMonth1(lunarMonth, lunarYear, leap);
  const count = daysInLunarMonth(lunarMonth, lunarYear, leap);
  if (start === null || count < 1) return [];
  const today = new Date();
  const todayJd = jdFromDate(today.getDate(), today.getMonth() + 1, today.getFullYear());
  const days: DayInfo[] = [];
  for (let ld = 1; ld <= count; ld++) {
    const solar = convertLunar2Solar(ld, lunarMonth, lunarYear, leap);
    if (!solar) continue;
    days.push(dayInfo(solar[0], solar[1], solar[2], schedules, todayJd));
  }
  return days;
}