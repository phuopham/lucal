import { Window } from 'happy-dom';

const window = new Window();
const { document } = window;
(globalThis as Record<string, unknown>).window = window;
(globalThis as Record<string, unknown>).document = document;

import { mountCalendar } from '../src/components/calendar-ui.ts';
import { convertSolar2Lunar } from '../src/lib/lunar.ts';

let pass = 0;
let fail = 0;
function ok(cond: boolean, label: string) {
  if (cond) pass++;
  else {
    fail++;
    console.error('  FAIL: ' + label);
  }
}

const host = document.createElement('div');
document.body.appendChild(host);
mountCalendar(host);

const now = new Date();
const nowD = now.getDate();
const nowM = now.getMonth() + 1;
const nowY = now.getFullYear();

const $ = (sel: string): HTMLElement | null => host.querySelector(sel);
const act = (name: string): void => {
  const el = $(`[data-act="${name}"]`) as HTMLElement;
  el?.click();
};

ok($('.cal-card') !== null, 'card rendered');
ok(host.querySelectorAll('.day-cell:not(.empty)').length >= 28, 'month grid has cells');
ok($('.detail-big') !== null, 'details rendered');
ok($('.chip') !== null, 'good hours chips rendered');
ok($('.cal-subtitle')!.textContent!.includes('Năm'), 'subtitle shows lunar year');

// Assert the subtitle reflects TODAY's real lunar date (month name + year),
// protecting against argument-order regressions in jd/convert calls.
{
  const l = convertSolar2Lunar(nowD, nowM, nowY);
  const yearVi = `${['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'][(l.year + 6) % 10]} ${['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'][(l.year + 8) % 12]}`;
  const monthVi = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'][l.month];
  const sub = $('.cal-subtitle')!.textContent!;
  ok(sub.includes(`tháng ${monthVi}`), `subtitle lunar month "${monthVi}" (got "${sub}")`);
  ok(sub.includes(yearVi), `subtitle lunar year "${yearVi}" (got "${sub}")`);
}

act('view-year');
ok($('.year-grid') !== null, 'year view rendered');
ok(host.querySelectorAll('.ym').length === 12, '12 mini months');

act('view-month');
const firstDay = $('.day-cell:not(.empty)') as HTMLElement;
const jd = Number(firstDay.dataset.jd);
firstDay.click();
ok($('.day-cell.sel') !== null, 'selected day highlighted');

act('lang');
ok(host.querySelector('.cal-title')!.textContent!.match(/[A-Za-z]{3}/) !== null, 'language toggle switches to EN');
act('lang');
ok(host.querySelector('.cal-title')!.textContent!.includes('Tháng'), 'language toggle switches back to VI');

host.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
ok($('.day-cell.sel')?.getAttribute('data-jd') === String(jd + 1), 'ArrowRight moves selection to next day');

const titleBefore = host.querySelector('.cal-title')!.textContent!;
act('month-next');
const titleAfter = host.querySelector('.cal-title')!.textContent!;
ok(titleAfter !== titleBefore, 'next-month navigates (' + titleBefore + ' -> ' + titleAfter + ')');

act('today');
ok(host.querySelector('.cal-title')!.textContent!.includes(String(nowY)), 'Today resets to current year');

const l2 = convertSolar2Lunar(nowD, nowM, nowY);
ok(l2.year >= 1900 && l2.year <= 2100, 'today converts to lunar: ' + JSON.stringify(l2));

// --- schedules rendered from host.data-schedules ---
(() => {
  const testDay = new Date();
  testDay.setDate(15);
  const host2 = document.createElement('div');
  host2.dataset.schedules = JSON.stringify([
    { title: 'Sinh nhật Mẹ', recurrence: 'yearly', date: `${nowY}-${nowM}-${nowD}` },
    { title: 'Lunar event', recurrence: 'lunar-yearly', lunarMonth: l2.month, lunarDay: l2.day },
  ]);
  document.body.appendChild(host2);
  mountCalendar(host2);
  // today's cell should carry a schedule dot
  const todayCell = host2.querySelector('.day-cell.today') as HTMLElement | null;
  ok(todayCell !== null && todayCell.querySelector('.evdots .dot') !== null, 'day-cell shows schedule dot');
  const rows = [...host2.querySelectorAll('.row')];
  ok(
    rows.some((r) => (r.querySelector('.k') as HTMLElement)?.textContent?.includes('Lịch')),
    'details shows schedule section label',
  );
})();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);