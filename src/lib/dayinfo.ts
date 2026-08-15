import {
  convertSolar2Lunar,
  jdFromDate,
  getDayCanChi,
  getSolarTermIndex,
  getDayGod,
  getHoliday,
  isLastDayOfLunarYear,
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

export function monthDays(year: number, month: number, schedules: ScheduleEntry[]): DayInfo[] {
  const days: DayInfo[] = [];
  const count = daysInSolarMonth(year, month);
  const today = new Date();
  const todayJd = jdFromDate(today.getDate(), today.getMonth() + 1, today.getFullYear());
  for (let d = 1; d <= count; d++) {
    const jd = jdFromDate(d, month, year);
    const lunar = convertSolar2Lunar(d, month, year);
    const dayChi = getDayCanChi(jd);
    const term = getSolarTermIndex(jd);
    const termStart = getSolarTermIndex(jd - 1) !== term;
    const god = getDayGod(lunar.day, dayChi.chi);
    const holiday = getHoliday(lunar);
    days.push({
      jd,
      d,
      m: month,
      y: year,
      lunar,
      dayChi,
      term,
      termStart,
      god,
      holiday,
      newYearEve: isLastDayOfLunarYear(lunar),
      isToday: jd === todayJd,
      schedules: schedulesOnDay(schedules, { d, m: month, y: year, ld: lunar.day, lm: lunar.month }),
    });
  }
  return days;
}