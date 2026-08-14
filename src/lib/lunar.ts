// Vietnamese lunar calendar engine.
// Implements the algorithms documented by Hồ Ngọc Đức
// (https://www.xemamlich.uhm.vn/calrules.html) for Vietnam, timezone GMT+7 (105°E).

export const TIME_ZONE = 7.0;
export const PI = Math.PI;
export const INT = Math.floor;

const SYNODIC_MONTH = 29.530588853;
const JDN_1900_01_01 = 2415021;

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

export function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

// Julian day number of the new-moon (Sóc) day number k, counted from the
// Sóc of 1900-01-01.
export function getNewMoonDay(k: number, timeZone = TIME_ZONE): number {
  const dr = PI / 180;
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

// Solar longitude at local noon, in degrees in [0, 360).
export function getSunLongitudeDeg(jdn: number, timeZone = TIME_ZONE): number {
  const dr = PI / 180;
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  const L = L0 + DL;
  return ((L % 360) + 360) % 360;
}

// Solar longitude sector 0..11 (each 30°): used to locate the Trung khí.
export function getSunLongitude(jdn: number, timeZone = TIME_ZONE): number {
  return Math.floor(getSunLongitudeDeg(jdn, timeZone) / 30);
}

// One of the 24 solar terms (Tiết khí), each covering 15° of solar longitude.
// Index 0 = Lập xuân (315°) going through Đại hàn.
export function getSolarTermIndex(jdn: number, timeZone = TIME_ZONE): number {
  const deg = getSunLongitudeDeg(jdn, timeZone);
  return Math.floor(((deg + 45) % 360) / 15);
}

// JDN of the first day of lunar month 11 (the month containing the winter
// solstice, Đông chí) of the lunar year that starts in solar year yy.
export function getLunarMonth11(yy: number, timeZone = TIME_ZONE): number {
  const off = jdFromDate(31, 12, yy) - JDN_1900_01_01;
  const k = INT(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(k, timeZone);
  if (getSunLongitude(nm, timeZone) >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

// Number of lunar months after month 11 before the leap month (0 = no leap
// month in the 13-month cycle).
export function getLeapMonthOffset(a11: number, timeZone = TIME_ZONE): number {
  const k = INT(0.5 + (a11 - 2415021.076998695) / SYNODIC_MONTH);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc != last && i < 14);
  return i - 1;
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = TIME_ZONE): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  let k = INT((dayNumber - 2415021.076998695) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff == leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap !== 0 };
}

// JDN of day 1 of the given lunar month, or null if the constellation
// (month + leap combination) does not exist.
export function getLunarMonth1(
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone = TIME_ZONE,
): number | null {
  let a11: number, b11: number, off: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    const leapMonth = leapOff - 2 < 0 ? leapOff + 10 : leapOff - 2;
    if (lunarLeap && lunarMonth != leapMonth) {
      return null;
    } else if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / SYNODIC_MONTH);
  return getNewMoonDay(k + off, timeZone);
}

export function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone = TIME_ZONE,
): [number, number, number] | null {
  const start = getLunarMonth1(lunarMonth, lunarYear, lunarLeap, timeZone);
  if (start === null) {
    return null;
  }
  return jdToDate(start + lunarDay - 1);
}

export function daysInLunarMonth(lunarMonth: number, lunarYear: number, leap: boolean, timeZone = TIME_ZONE): number {
  const m1 = getLunarMonth1(lunarMonth, lunarYear, leap, timeZone);
  if (m1 === null) {
    return 0;
  }
  const nextM = lunarMonth === 12 ? 1 : lunarMonth + 1;
  const nextY = lunarMonth === 12 ? lunarYear + 1 : lunarYear;
  const m2 = getLunarMonth1(nextM, nextY, false, timeZone);
  if (m2 === null) {
    return 0;
  }
  return m2 - m1;
}

export function isLastDayOfLunarYear(l: LunarDate, timeZone = TIME_ZONE): boolean {
  if (l.month !== 12 || l.day < 29) {
    return false;
  }
  return convertLunar2Solar(l.day + 1, l.month, l.year, l.leap, timeZone) === null;
}

// --- Can Chi (heavenly stems / earthly branches), numeric indices ---

export function getYearCanChi(year: number): { can: number; chi: number } {
  return { can: ((year + 6) % 10 + 10) % 10, chi: ((year + 8) % 12 + 12) % 12 };
}

export function getDayCanChi(jd: number): { can: number; chi: number } {
  return { can: ((jd + 9) % 10 + 10) % 10, chi: ((jd + 1) % 12 + 12) % 12 };
}

// Can-Chi of a lunar month in a lunar year. Month 11 is Tý, 12 Sửu, 1 Dần...
export function getLunarMonthCanChi(lunarYear: number, lunarMonth: number): { can: number; chi: number } {
  const chi = (((lunarMonth + 1) % 12) + 12) % 12;
  const can = (((lunarYear * 12 + lunarMonth + 3) % 10) + 10) % 10;
  return { can, chi };
}

// Day of week. 0 = Monday ... 6 = Sunday (validated: 2000-01-01 is Saturday).
export function getWeekday(jd: number): number {
  return (((jd % 7) + 7) % 7);
}

// --- Hoàng Đạo / Hắc Đạo (folk convention, Ngọc Hạp style) ---

// The 12 day-guard gods. Even if the notion is folk, the assignment is fixed.
const GODS: Array<{ hoang: boolean }> = [
  { hoang: true }, // 0 Thanh Long
  { hoang: true }, // 1 Minh Đường
  { hoang: false }, // 2 Thiên Hình
  { hoang: false }, // 3 Chu Tước
  { hoang: true }, // 4 Kim Quỹ
  { hoang: true }, // 5 Kim Đường
  { hoang: false }, // 6 Bạch Hổ
  { hoang: true }, // 7 Ngọc Đường
  { hoang: false }, // 8 Thiên Lao
  { hoang: false }, // 9 Nguyên Vũ
  { hoang: true }, // 10 Tư Mệnh
  { hoang: false }, // 11 Câu Trần
];

export function getDayGod(lunarDay: number, dayChi: number): { god: number; hoang: boolean } {
  const n = ((lunarDay - 1) % 12 + 12) % 12;
  const god = (((dayChi - 2 * n) % 12) + 12) % 12;
  return { god, hoang: GODS[god].hoang };
}

// Good (hoàng đạo) hours for a day: row = hour chi (0 Tý..11 Hợi),
// column = day-chi pair (floor(dayChi/2)).
const HOANG_DAO_HOURS: boolean[][] = [
  [true, false, true, true, false, false], // Tý 23-1h
  [true, false, true, false, false, true], // Sửu 1-3h
  [false, true, false, true, true, false], // Dần 3-5h
  [true, true, false, true, false, false], // Mão 5-7h
  [false, false, true, false, true, true], // Thìn 7-9h
  [false, true, true, false, true, false], // Tỵ 9-11h
  [true, false, false, true, false, true], // Ngọ 11-13h
  [false, false, true, true, false, true], // Mùi 13-15h
  [true, true, false, false, true, false], // Thân 15-17h
  [true, false, false, true, true, false], // Dậu 17-19h
  [false, true, true, false, false, true], // Tuất 19-21h
  [false, true, false, false, true, true], // Hợi 21-23h
];

export function isHoangDaoHour(hourChi: number, dayChi: number): boolean {
  return HOANG_DAO_HOURS[hourChi][Math.floor(dayChi / 2)];
}

// Chi index of the traditional 2-hour slot that contains hour h (0-23).
export function hourToChi(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

// --- Holidays (fixed lunar dates) ---

export interface Holiday {
  month: number;
  day: number;
  id: string; // key into i18n dictionaries
}

export const LUNAR_HOLIDAYS: Holiday[] = [
  { month: 1, day: 1, id: 'h1_1' },
  { month: 1, day: 15, id: 'h1_15' },
  { month: 3, day: 3, id: 'h3_3' },
  { month: 3, day: 10, id: 'h3_10' },
  { month: 4, day: 15, id: 'h4_15' },
  { month: 5, day: 5, id: 'h5_5' },
  { month: 7, day: 15, id: 'h7_15' },
  { month: 8, day: 15, id: 'h8_15' },
  { month: 9, day: 9, id: 'h9_9' },
  { month: 12, day: 23, id: 'h12_23' },
];

export function getHoliday(l: LunarDate): Holiday | null {
  for (const h of LUNAR_HOLIDAYS) {
    if (l.month === h.month && l.day === h.day) {
      return h;
    }
  }
  return null;
}