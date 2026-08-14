import {
  jdFromDate,
  getWeekday,
  convertSolar2Lunar,
  convertLunar2Solar,
  getYearCanChi,
  getDayCanChi,
  getLunarMonth1,
  daysInLunarMonth,
  isHoangDaoHour,
  getSolarTermIndex,
  getSunLongitudeDeg,
} from '../src/lib/lunar.ts';

let pass = 0;
let fail = 0;

function ok(cond: boolean, label: string) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error('  FAIL: ' + label);
  }
}

// --- Tết is always 1/1 of the new lunar year ---
const tet = [
  [2020, 25, 1, 2020],
  [2023, 22, 1, 2023],
  [2024, 10, 2, 2024],
  [2025, 29, 1, 2025],
  [2026, 17, 2, 2026],
];
for (const [year, d, m, ly] of tet) {
  const l = convertSolar2Lunar(d, m, year);
  ok(l.day === 1 && l.month === 1 && l.year === ly && !l.leap, `${year} Tết -> 1/1/${ly} (got ${l.day}/${l.month}/${l.year})`);
}

// --- 2004 leap month: 2004-03-21 is 1/2 nhuận ---
{
  const l = convertSolar2Lunar(21, 3, 2004);
  ok(l.day === 1 && l.month === 2 && l.leap, '2004-03-21 -> 1/2 nhuận');
  ok(daysInLunarMonth(2, 2004, true) === 29, 'leap month 2/2004 has 29 days');
}

// --- Round trip: lunar -> solar === original ---
{
  const l = convertSolar2Lunar(14, 8, 2026); // today
  const s = convertLunar2Solar(l.day, l.month, l.year, l.leap);
  ok(s !== null && s[0] === 14 && s[1] === 8 && s[2] === 2026, 'round-trip lunar<->solar for 2026-08-14');
}

// --- Invalid leap month returns null ---
{
  // 2004 has leap month 2; leap month 5 should not exist.
  ok(convertLunar2Solar(1, 5, 2004, true) === null, 'leap month 5 of 2004 -> null');
}

// --- Weekday: 2000-01-01 Saturday, 2026-08-14 Friday, 1970-01-01 Thursday ---
{
  const days: Array<[number, number, number, number]> = [
    [1, 1, 2000, 5], // Saturday (index 5 in Mon..Sun)
    [14, 8, 2026, 4], // Friday
    [1, 1, 1970, 3], // Thursday
  ];
  for (const [d, m, y, w] of days) {
    const jd = jdFromDate(d, m, y);
    ok(getWeekday(jd) === w, `${d}/${m}/${y} weekday index ${w} (got ${getWeekday(jd)})`);
  }
}

// --- Year Can Chi: 2026 is Bính Ngọ (can 2, chi 6) ---
{
  const cc = getYearCanChi(2026);
  ok(cc.can === 2 && cc.chi === 6, `2026 -> Bính Ngọ (got ${cc.can}/${cc.chi})`);
  const cc2 = getYearCanChi(2024);
  ok(cc2.can === 0 && cc2.chi === 4, `2024 -> Giáp Thìn (got ${cc2.can}/${cc2.chi})`);
}

// --- Hoàng Đạo hour known cell: day chi Sửu (1), hour Thìn (4):
//     column floor(1/2)=0, row Thìn=[false,false,true,false,true,true] -> false for col0 ---
{
  ok(isHoangDaoHour(4, 1) === false, 'hour Thìn, day Sửu -> hắc đạo');
  // day chi Dần (2), col 1, hour Thìn row col1 = false
  ok(isHoangDaoHour(4, 2) === false, 'hour Thìn, day Dần -> hắc đạo');
  // day chi Giáp? chi Dần(2) col1; hour Mão(3) row col1 = true
  ok(isHoangDaoHour(3, 2) === true, 'hour Mão, day Dần -> hoàng đạo');
  // day chi Tỵ (5) col2; hour Tý(0) row col2 = true
  ok(isHoangDaoHour(0, 5) === true, 'hour Tý, day Tỵ -> hoàng đạo');
}

// --- Solar terms at known boundaries ---
{
  // Xuân phân (0°) crosses during 2026-03-20; the 22nd must be in index 3.
  const jd = jdFromDate(22, 3, 2026);
  ok(getSolarTermIndex(jd) === 3, `2026-03-22 -> Xuân phân sector (got ${getSolarTermIndex(jd)})`);
  // Đông chí (270°) around 2026-12-21/22; the 23rd must be in index 21.
  const jd2 = jdFromDate(23, 12, 2026);
  ok(getSolarTermIndex(jd2) === 21, `2026-12-23 -> Đông chí sector (got ${getSolarTermIndex(jd2)})`);
  // Lập xuân (315°) in early February: 2026-02-04 -> index 0.
  const jd3 = jdFromDate(5, 2, 2026);
  ok(getSolarTermIndex(jd3) === 0, `2026-02-05 -> Lập xuân sector (got ${getSolarTermIndex(jd3)})`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);